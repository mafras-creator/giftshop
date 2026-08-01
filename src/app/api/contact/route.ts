import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const inquirySchema = z.object({
  queryType: z.string().min(1),
  fullName: z.string().min(2),
  email: z.string().email(),
  mobile: z.string().min(6),
  message: z.string().min(5),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = inquirySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please fill in all fields correctly." },
      { status: 400 }
    );
  }

  const inquiry = await prisma.contactInquiry.create({ data: parsed.data });

  return NextResponse.json({ inquiry }, { status: 201 });
}
