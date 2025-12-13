import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";

// POST - Submit job application
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jobId, name, email, phone, resume, coverLetter, linkedIn, portfolio } = body;

    // Validate required fields
    if (!jobId || !name || !email || !resume) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if job exists
    const job = await db.jobPosting.findUnique({
      where: { id: jobId },
    });

    if (!job || !job.isActive) {
      return NextResponse.json(
        { error: "Job posting not found or inactive" },
        { status: 404 }
      );
    }

    // Create application
    const application = await db.jobApplication.create({
      data: {
        jobId,
        name,
        email,
        phone,
        resume,
        coverLetter,
        linkedIn,
        portfolio,
        status: "pending",
      },
    });

    // TODO: Send confirmation email to applicant
    // TODO: Notify HR team

    return NextResponse.json(
      {
        success: true,
        message: "Application submitted successfully!",
        applicationId: application.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Job application error:", error);
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }
}
