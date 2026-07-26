import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { isAdmin } from "@/lib/auth";
import { getBucket } from "@/lib/gcs";

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 422 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${randomUUID()}-${file.name}`;
  const blob = getBucket().file(filename);
  await blob.save(buffer, { contentType: file.type });

  const url = `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${filename}`;
  return NextResponse.json({ url }, { status: 201 });
}
