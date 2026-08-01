import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const reorderSchema = z.object({
  order: z.array(z.object({ id: z.string(), displayOrder: z.number().int() })),
});

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = reorderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  await Promise.all(
    parsed.data.order.map(({ id, displayOrder }) =>
      prisma.category.update({ where: { id }, data: { displayOrder } })
    )
  );

  return NextResponse.json({ success: true });
}
