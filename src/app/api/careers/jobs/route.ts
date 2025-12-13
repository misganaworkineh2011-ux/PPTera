import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";

// GET - Fetch active job postings
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const department = searchParams.get("department");

    const where = {
      isActive: true,
      ...(department && department !== "all" ? { department } : {}),
    };

    const jobs = await db.jobPosting.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        department: true,
        location: true,
        type: true,
        description: true,
        requirements: true,
        benefits: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("Fetch jobs error:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}
