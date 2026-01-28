import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { requireAuth } from "~/lib/clerk-server";

/**
 * Download completed export file
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const authUser = await requireAuth();
    const { jobId } = await params;

    // Get the export job
    const exportJob = await db.exportJob.findFirst({
      where: {
        id: jobId,
        userId: authUser.id,
      },
      include: {
        presentation: true,
      },
    });

    if (!exportJob) {
      return NextResponse.json({ error: "Export not found" }, { status: 404 });
    }

    if (exportJob.status !== "completed") {
      return NextResponse.json(
        { error: "Export not ready", status: exportJob.status },
        { status: 400 }
      );
    }

    // Check if expired
    if (exportJob.expiresAt && exportJob.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Download link has expired" },
        { status: 410 }
      );
    }

    // In production, redirect to cloud storage URL
    // For now, we need to fetch the file from the original export endpoint
    // This is a temporary solution - in production, store files in S3/R2
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    
    const exportUrl = new URL(
      `/api/presentations/${exportJob.presentationId}/export`,
      baseUrl
    );
    
    exportUrl.searchParams.set("format", exportJob.format);

    // Make internal request to get the file
    const exportResponse = await fetch(exportUrl.toString(), {
      method: "GET",
      headers: {
        "x-internal-request": "true",
      },
    });

    if (!exportResponse.ok) {
      throw new Error(`Failed to fetch export: ${exportResponse.statusText}`);
    }

    const fileBuffer = await exportResponse.arrayBuffer();
    
    // Determine content type and filename
    let contentType = "application/octet-stream";
    let extension = "";
    
    switch (exportJob.format) {
      case "pdf":
        contentType = "application/pdf";
        extension = "pdf";
        break;
      case "pptx":
        contentType = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
        extension = "pptx";
        break;
      case "images":
        contentType = "application/zip";
        extension = "zip";
        break;
    }

    const filename = `${exportJob.presentation?.title || "presentation"}.${extension}`;

    // Log download activity
    await db.activity.create({
      data: {
        userId: authUser.id,
        type: "download",
        description: `Downloaded ${exportJob.format.toUpperCase()} export of "${exportJob.presentation?.title}"`,
        metadata: {
          exportJobId: jobId,
          format: exportJob.format,
        },
      },
    });

    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
        "Content-Length": fileBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error("[Export Download] Error:", error);
    return NextResponse.json(
      {
        error: "Download failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
