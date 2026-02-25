import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { requireAuth } from "~/lib/clerk-server";

/**
 * Initiate an async export job
 * Returns immediately with a job ID
 * User will receive an email when export is ready
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await requireAuth();
    const { id: presentationId } = await params;
    const body = await request.json();
    
    const { format, range, customRange, quality } = body as {
      format: "pdf" | "pptx" | "images";
      range?: "all" | "current" | "custom";
      customRange?: { from: number; to: number };
      quality?: "standard" | "hd" | "2k";
    };

    // Validate format
    if (!format || !["pdf", "pptx", "images"].includes(format)) {
      return NextResponse.json({ error: "Invalid format" }, { status: 400 });
    }

    // Check if presentation exists and user has access
    const presentation = await db.presentation.findFirst({
      where: {
        id: presentationId,
        OR: [
          { userId: authUser.id },
          { collaborations: { some: { userId: authUser.id } } },
        ],
      },
    });

    if (!presentation) {
      return NextResponse.json(
        { error: "Presentation not found" },
        { status: 404 }
      );
    }

    // Create export job
    const exportJob = await db.exportJob.create({
      data: {
        userId: authUser.id,
        presentationId,
        format,
        status: "pending",
        // Store export options in a JSON field if needed
        // For now, we'll handle range in the processor
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      },
    });

    console.log(`[Export Async] Created job ${exportJob.id} for presentation ${presentationId}`);

    // Trigger background processing
    // In production, you'd use a queue system like BullMQ, Inngest, or Trigger.dev
    // For now, we'll use a simple API call that processes in the background
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : "http://localhost:3000";
    
    // Fire and forget - don't await
    fetch(`${baseUrl}/api/export-jobs/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        jobId: exportJob.id,
        range,
        customRange,
        quality,
      }),
    }).catch((error) => {
      console.error("[Export Async] Failed to trigger processor:", error);
    });

    return NextResponse.json({
      success: true,
      jobId: exportJob.id,
      message: "Export started. You'll receive an email when it's ready.",
    });
  } catch (error) {
    console.error("[Export Async] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to start export",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Check export job status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await requireAuth();
    const { id: presentationId } = await params;
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");

    if (!jobId) {
      return NextResponse.json({ error: "Job ID required" }, { status: 400 });
    }

    const exportJob = await db.exportJob.findFirst({
      where: {
        id: jobId,
        userId: authUser.id,
        presentationId,
      },
    });

    if (!exportJob) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({
      jobId: exportJob.id,
      status: exportJob.status,
      format: exportJob.format,
      fileUrl: exportJob.fileUrl,
      fileSize: exportJob.fileSize,
      error: exportJob.error,
      createdAt: exportJob.createdAt,
      completedAt: exportJob.completedAt,
      expiresAt: exportJob.expiresAt,
    });
  } catch (error) {
    console.error("[Export Async GET] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to get job status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
