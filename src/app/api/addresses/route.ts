import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const addressSchema = z.object({
  line1: z.string().min(3),
  line2: z.string().optional(),
  city: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
  isDefault: z.boolean().optional().default(false),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ addresses: [] });
  }

  const userId = (session.user as any).id as string;
  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: { isDefault: "desc" },
  });

  return NextResponse.json({ addresses });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Please log in" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;
  const body = await req.json();
  const parsed = addressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please fill in all required address fields" }, { status: 400 });
  }

  // If this is set as default, un-default any existing ones first
  if (parsed.data.isDefault) {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  }

  const existingCount = await prisma.address.count({ where: { userId } });

  const address = await prisma.address.create({
    data: {
      ...parsed.data,
      userId,
      isDefault: parsed.data.isDefault || existingCount === 0, // first address is always default
    },
  });

  return NextResponse.json({ address }, { status: 201 });
}
