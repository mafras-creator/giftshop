import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

// Customer-facing upload endpoint - any logged-in user can upload a
// personalization image (e.g. a photo to print on a mug). This is
// separate from /api/admin/upload, which is locked to admins only
// and used for product catalog photos.

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Please log in to upload an image" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Only JPG, PNG, WEBP, or GIF images are allowed" },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "Image must be smaller than 5MB" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadsDir = path.join(process.cwd(), "public", "uploads", "customer");
  await mkdir(uploadsDir, { recursive: true });

  const ext = path.extname(file.name) || ".jpg";
  const filename = `${crypto.randomUUID()}${ext}`;
  const filePath = path.join(uploadsDir, filename);

  await writeFile(filePath, buffer);

  const url = `/uploads/customer/${filename}`;
  return NextResponse.json({ url }, { status: 201 });
}
