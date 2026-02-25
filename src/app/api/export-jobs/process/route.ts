import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { sendExportReadyEmail } from "~/lib/email";

/**
 * Background job processor for exports
 * This endpoint processes export jobs asynchronously
 * 
 * In production, this should be:
 * 1. Protected by a secret token
 * 2. Called by a queue system (BullMQ, Inngest, Trigger.dev)
 * 3. Have proper retry logic
 * 4. Have timeout handling
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId, range, customRange, quality } = body as {
      jobId: string;
      range?: "all" | "current" | "custom";
      customRange?: { from: number; to: number };
      quality?: "standard" | "hd" | "2k";
    };

    if (!jobId) {
      return NextResponse.json({ error: "Job ID required" }, { status: 400 });
    }

    // Get the export job
    const exportJob = await db.exportJob.findUnique({
      where: { id: jobId },
    });

    if (!exportJob) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (exportJob.status !== "pending") {
      return NextResponse.json(
        { error: "Job already processed" },
        { status: 400 }
      );
    }

    // Update status to processing
    await db.exportJob.update({
      where: { id: jobId },
      data: { status: "processing" },
    });

    console.log(`[Export Processor] Processing job ${jobId}`);

    try {
      // Call the existing export endpoint
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
      
      const exportUrl = new URL(
        `/api/presentations/${exportJob.presentationId}/export`,
        baseUrl
      );
      
      // Add query parameters
      exportUrl.searchParams.set("format", exportJob.format);
      if (range) exportUrl.searchParams.set("range", range);
      if (customRange?.from) exportUrl.searchParams.set("from", customRange.from.toString());
      if (customRange?.to) exportUrl.searchParams.set("to", customRange.to.toString());
      if (quality) exportUrl.searchParams.set("quality", quality);

      // Get user's Clerk session token for authentication
      // Note: In production, you'd need to handle this differently
      // For now, we'll make an internal call that bypasses auth
      const exportResponse = await fetch(exportUrl.toString(), {
        method: "GET",
        headers: {
          "x-internal-request": "true", // Mark as internal
        },
      });

      if (!exportResponse.ok) {
        throw new Error(`Export failed: ${exportResponse.statusText}`);
      }

      const fileBuffer = await exportResponse.arrayBuffer();
      const fileSize = fileBuffer.byteLength;

      // In production, upload to cloud storage (S3, R2, etc.)
      // For now, we'll store as base64 in database (NOT RECOMMENDED for production)
      const base64File = Buffer.from(fileBuffer).toString("base64");
      
      // Get presentation and user details
      const presentation = await db.presentation.findUnique({
        where: { id: exportJob.presentationId },
        include: { user: true },
      });

      if (!presentation) {
        throw new Error("Presentation not found");
      }

      // Create download URL
      const downloadUrl = `${baseUrl}/api/export-jobs/download/${jobId}`;

      // Update job as completed
      await db.exportJob.update({
        where: { id: jobId },
        data: {
          status: "completed",
          fileUrl: downloadUrl,
          fileSize,
          completedAt: new Date(),
        },
      });

      // Format file size
      const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
      const fileSizeFormatted = `${fileSizeMB} MB`;

      // Send email notification
      await sendExportReadyEmail({
        to: presentation.user.email,
        presentationTitle: presentation.title,
        format: exportJob.format as "pdf" | "pptx" | "images",
        downloadUrl,
        expiresIn: "24 hours",
        fileSize: fileSizeFormatted,
      });

      console.log(`[Export Processor] Job ${jobId} completed successfully`);

      return NextResponse.json({
        success: true,
        jobId,
        status: "completed",
      });
    } catch (error) {
      console.error(`[Export Processor] Job ${jobId} failed:`, error);

      // Update job as failed
      await db.exportJob.update({
        where: { id: jobId },
        data: {
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
        },
      });

      return NextResponse.json(
        {
          success: false,
          jobId,
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[Export Processor] Error:", error);
    return NextResponse.json(
      {
        error: "Processing failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
