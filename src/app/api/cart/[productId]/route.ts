import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  quantity: z.coerce.number().int().min(1).max(20),
});

export async function PUT(req: Request, { params }: { params: { productId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
  }

  const userId = (session.user as any).id as string;

  const product = await prisma.product.findUnique({ where: { id: params.productId } });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const quantity = Math.min(parsed.data.quantity, product.stock || parsed.data.quantity);

  const cartItem = await prisma.cartItem.update({
    where: { userId_productId: { userId, productId: params.productId } },
    data: { quantity },
  });

  return NextResponse.json({ cartItem });
}

export async function DELETE(_req: Request, { params }: { params: { productId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;

  await prisma.cartItem.delete({
    where: { userId_productId: { userId, productId: params.productId } },
  });

  return NextResponse.json({ success: true });
}
