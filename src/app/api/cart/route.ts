import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const addToCartSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(20).default(1),
  personalizationText: z.string().max(500).optional(),
  personalizationImageUrl: z.string().min(1).optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Please log in to add items to your cart" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = addToCartSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { productId, quantity, personalizationText, personalizationImageUrl } = parsed.data;
  const userId = (session.user as any).id as string;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // Enforce that whatever the admin required for this product is actually provided
  if (product.isPersonalizable) {
    if (product.personalizationTextEnabled && !personalizationText?.trim()) {
      return NextResponse.json(
        { error: "Please add your personalization message for this product" },
        { status: 400 }
      );
    }
    if (product.personalizationImageEnabled && !personalizationImageUrl) {
      return NextResponse.json(
        { error: "Please upload an image for this product" },
        { status: 400 }
      );
    }
  }

  const existing = await prisma.cartItem.findUnique({
    where: { userId_productId: { userId, productId } },
  });

  const newQuantity = Math.min((existing?.quantity ?? 0) + quantity, product.stock || quantity, 20);

  const personalizationData = product.isPersonalizable
    ? {
        personalizationText: product.personalizationTextEnabled ? personalizationText : null,
        personalizationImageUrl: product.personalizationImageEnabled
          ? personalizationImageUrl
          : null,
      }
    : {};

  const cartItem = await prisma.cartItem.upsert({
    where: { userId_productId: { userId, productId } },
    update: { quantity: newQuantity, ...personalizationData },
    create: {
      userId,
      productId,
      quantity: Math.min(quantity, product.stock || quantity),
      ...personalizationData,
    },
  });

  const cartCount = await prisma.cartItem.aggregate({
    _sum: { quantity: true },
    where: { userId },
  });

  return NextResponse.json({ cartItem, cartCount: cartCount._sum.quantity ?? 0 }, { status: 201 });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ items: [] });
  }

  const userId = (session.user as any).id as string;
  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: { include: { images: true } } },
  });

  return NextResponse.json({ items });
}
