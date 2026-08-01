import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Please log in" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;

  const address = await prisma.address.findUnique({ where: { id: params.id } });
  if (!address || address.userId !== userId) {
    return NextResponse.json({ error: "Address not found" }, { status: 404 });
  }

  await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  await prisma.address.update({ where: { id: params.id }, data: { isDefault: true } });

  return NextResponse.json({ success: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Please log in" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;

  const address = await prisma.address.findUnique({ where: { id: params.id } });
  if (!address || address.userId !== userId) {
    return NextResponse.json({ error: "Address not found" }, { status: 404 });
  }

  await prisma.address.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
