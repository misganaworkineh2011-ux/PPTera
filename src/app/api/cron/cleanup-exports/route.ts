import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";

/**
 * Cron job to clean up expired export files
 * Should be called periodically (e.g., every hour)
 * 
 * In Vercel, add this to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/cleanup-exports",
 *     "schedule": "0 * * * *"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (optional but recommended)
    const authHeader = request.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    // Find expired export jobs
    const expiredJobs = await db.exportJob.findMany({
      where: {
        expiresAt: {
          lt: now,
        },
        status: "completed",
      },
    });

    console.log(`[Cleanup Exports] Found ${expiredJobs.length} expired jobs`);

    // Delete expired jobs
    // In production, also delete files from cloud storage
    const deleted = await db.exportJob.deleteMany({
      where: {
        expiresAt: {
          lt: now,
        },
        status: "completed",
      },
    });

    // Also clean up old failed jobs (older than 7 days)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const deletedFailed = await db.exportJob.deleteMany({
      where: {
        status: "failed",
        createdAt: {
          lt: sevenDaysAgo,
        },
      },
    });

    console.log(`[Cleanup Exports] Deleted ${deleted.count} expired and ${deletedFailed.count} old failed jobs`);

    return NextResponse.json({
      success: true,
      deletedExpired: deleted.count,
      deletedFailed: deletedFailed.count,
    });
  } catch (error) {
    console.error("[Cleanup Exports] Error:", error);
    return NextResponse.json(
      {
        error: "Cleanup failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
