import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_req: Request, { params }: { params: { productId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;

  await prisma.wishlistItem.deleteMany({
    where: { userId, productId: params.productId },
  });

  const count = await prisma.wishlistItem.count({ where: { userId } });
  return NextResponse.json({ wishlisted: false, count });
}
