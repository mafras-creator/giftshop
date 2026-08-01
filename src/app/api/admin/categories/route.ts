import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") return null;
  return session;
}

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const existing = await prisma.category.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) {
    return NextResponse.json({ error: "A category with a similar name already exists" }, { status: 409 });
  }

  const maxOrder = await prisma.category.aggregate({ _max: { displayOrder: true } });

  const category = await prisma.category.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      displayOrder: (maxOrder._max.displayOrder ?? 0) + 1,
      emoji: "🎁",
    },
  });

  return NextResponse.json({ category }, { status: 201 });
}
