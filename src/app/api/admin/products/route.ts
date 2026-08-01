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

function slugify(name: string) {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") + "-" + Math.random().toString(36).slice(2, 7)
  );
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return null;
  }
  return session;
}

export async function POST(req: Request) {
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

  const product = await prisma.product.create({
    data: {
      name,
      slug: slugify(name),
      description,
      price,
      stock,
      categoryId,
      isPersonalizable,
      personalizationTextEnabled: isPersonalizable && personalizationTextEnabled,
      personalizationImageEnabled: isPersonalizable && personalizationImageEnabled,
      ...(imageUrls.length > 0
        ? { images: { create: imageUrls.map((url) => ({ url })) } }
        : {}),
    },
  });

  return NextResponse.json({ product }, { status: 201 });
}
