import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const addSchema = z.object({ productId: z.string().min(1) });

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ items: [] });
  }

  const userId = (session.user as any).id as string;
  const items = await prisma.wishlistItem.findMany({
    where: { userId },
    include: { product: { include: { images: true, category: true } } },
    orderBy: { id: "desc" },
  });

  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Please log in to save items to your wishlist" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;
  const body = await req.json();
  const parsed = addSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId, productId: parsed.data.productId } },
  });

  if (existing) {
    // Already wishlisted - treat repeat POST as a no-op success
    const count = await prisma.wishlistItem.count({ where: { userId } });
    return NextResponse.json({ wishlisted: true, count });
  }

  await prisma.wishlistItem.create({
    data: { userId, productId: parsed.data.productId },
  });

  const count = await prisma.wishlistItem.count({ where: { userId } });
  return NextResponse.json({ wishlisted: true, count }, { status: 201 });
}
