import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  imageUrl: z.string().min(1).optional(),
  emoji: z.string().optional(),
  showOnHome: z.boolean().optional(),
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") return null;
  return session;
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const category = await prisma.category.update({
    where: { id: params.id },
    data: parsed.data,
  });

  return NextResponse.json({ category });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const productsUsingCategory = await prisma.product.count({ where: { categoryId: params.id } });
  if (productsUsingCategory > 0) {
    return NextResponse.json(
      { error: `Can't delete — ${productsUsingCategory} product(s) still use this category. Move or delete them first.` },
      { status: 409 }
    );
  }

  await prisma.category.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
