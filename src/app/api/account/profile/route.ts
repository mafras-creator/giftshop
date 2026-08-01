import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
});

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Please log in" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please enter a valid name" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { name: parsed.data.name, phone: parsed.data.phone || null },
    select: { id: true, name: true, email: true, phone: true },
  });

  return NextResponse.json({ user });
}
