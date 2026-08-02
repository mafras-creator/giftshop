import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  label: z.string().min(1).optional(),
  href: z.string().min(1).optional(),
  emoji: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  active: z.boolean().optional(),
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

  const item = await prisma.bottomNavItem.update({
    where: { id: params.id },
    data: parsed.data,
  });

  return NextResponse.json({ item });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await prisma.bottomNavItem.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
