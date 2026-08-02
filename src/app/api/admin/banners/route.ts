import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  imageUrl: z.string().min(1),
  mobileImageUrl: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  buttonText: z.string().optional(),
  linkUrl: z.string().optional(),
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

  const maxOrder = await prisma.banner.aggregate({ _max: { displayOrder: true } });

  const banner = await prisma.banner.create({
    data: {
      ...parsed.data,
      displayOrder: (maxOrder._max.displayOrder ?? 0) + 1,
    },
  });

  return NextResponse.json({ banner }, { status: 201 });
}
