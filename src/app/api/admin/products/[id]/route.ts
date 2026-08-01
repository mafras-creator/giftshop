import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(1),
  price: z.coerce.number().positive(),
  stock: z.coerce.number().int().min(0),
  categoryId: z.string().min(1),
  imageUrls: z.array(z.string().min(1)).max(4).optional().default([]),
  isPersonalizable: z.boolean().optional().default(false),
  personalizationTextEnabled: z.boolean().optional().default(false),
  personalizationImageEnabled: z.boolean().optional().default(false),
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return null;
  }
  return session;
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const {
    name,
    description,
    price,
    stock,
    categoryId,
    imageUrls,
    isPersonalizable,
    personalizationTextEnabled,
    personalizationImageEnabled,
  } = parsed.data;

  const product = await prisma.product.update({
    where: { id: params.id },
    data: {
      name,
      description,
      price,
      stock,
      categoryId,
      isPersonalizable,
      personalizationTextEnabled: isPersonalizable && personalizationTextEnabled,
      personalizationImageEnabled: isPersonalizable && personalizationImageEnabled,
    },
  });

  // Replace all existing images with the submitted set (simplest correct approach)
  await prisma.productImage.deleteMany({ where: { productId: params.id } });
  if (imageUrls.length > 0) {
    await prisma.productImage.createMany({
      data: imageUrls.map((url) => ({ productId: params.id, url })),
    });
  }

  return NextResponse.json({ product });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await prisma.product.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
