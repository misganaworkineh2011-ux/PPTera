import { auth } from "~/lib/auth-server";
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { env } from "~/env";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        credits: true,
        images: {
          orderBy: { createdAt: "desc" },
          take: 50,
          select: {
            id: true,
            url: true,
            filename: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      images: user.images,
      credits: user.credits,
    });
  } catch (error) {
    console.error("[Images API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch images" },
      { status: 500 }
    );
  }
}

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

    const body = await req.json();
    const { url, presentationId } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const cloudName = env.CLOUDINARY_CLOUD_NAME;
    const uploadPreset = env.CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      // Return original URL if Cloudinary not configured
      return NextResponse.json({ url, message: "Cloudinary not configured" });
    }

    // Upload to Cloudinary from URL
    const formData = new FormData();
    formData.append("file", url);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", "pptmaster/ai-images");

    const cloudinaryRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!cloudinaryRes.ok) {
      console.error("[Images API] Cloudinary upload failed:", cloudinaryRes.status);
      // Return original URL on failure
      return NextResponse.json({ url });
    }

    const cloudinaryData = await cloudinaryRes.json();
    const cloudinaryUrl = cloudinaryData.secure_url as string;

    // Save to database
    const savedImage = await db.image.create({
      data: {
        url: cloudinaryUrl,
        filename: `ai-generated-${Date.now()}.png`,
        userId: user.id,
        presentationId: presentationId || null,
      },
    });

    return NextResponse.json({
      url: cloudinaryUrl,
      id: savedImage.id,
    });
  } catch (error) {
    console.error("[Images API] POST Error:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
