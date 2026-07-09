import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { uploadImageFromDataUrl } from "~/lib/uploads/cloudinary";

// Accept a file uploaded from the user's computer (multipart/form-data, field "file"),
// push it to Cloudinary, and return the hosted URL. Mirrors /api/images (which takes a
// remote URL) but for direct file uploads.
const MAX_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
];

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const presentationId = formData.get("presentationId");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const blob = file as File;
    if (blob.size === 0) {
      return NextResponse.json({ error: "Empty file" }, { status: 400 });
    }
    if (blob.size > MAX_BYTES) {
      return NextResponse.json({ error: "Image is too large (max 10MB)" }, { status: 413 });
    }
    if (blob.type && !ALLOWED_TYPES.includes(blob.type)) {
      return NextResponse.json({ error: "Unsupported image type" }, { status: 415 });
    }

    const arrayBuffer = await blob.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mime = blob.type || "image/png";
    const dataUrl = `data:${mime};base64,${base64}`;

    const result = await uploadImageFromDataUrl(dataUrl, {
      folder: "pptmaster/uploads",
      tags: ["upload"],
    });

    if (!result) {
      return NextResponse.json(
        { error: "Upload service is not configured or unavailable" },
        { status: 502 }
      );
    }

    // Persist to the user's image library (non-fatal if it fails — the URL still works).
    try {
      await db.image.create({
        data: {
          url: result.url,
          filename: blob.name || `upload-${Date.now()}`,
          userId: user.id,
          presentationId:
            typeof presentationId === "string" && presentationId ? presentationId : null,
        },
      });
    } catch (e) {
      console.error("[Upload Image] DB save failed (non-fatal):", e);
    }

    return NextResponse.json({ url: result.url });
  } catch (error) {
    console.error("[Upload Image] Error:", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}
