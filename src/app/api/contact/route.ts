import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { checkRateLimit, getClientIP, RATE_LIMITS } from "~/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIP(req);
    const rateLimit = checkRateLimit(`contact:${ip}`, RATE_LIMITS.CONTACT);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { name, email, subject, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Create contact submission
    const submission = await db.contactSubmission.create({
      data: {
        name,
        email,
        subject,
        message,
        status: "pending",
      },
    });

    // TODO: Send email notification to admin
    // TODO: Send confirmation email to user

    return NextResponse.json(
      {
        success: true,
        message: "Thank you for contacting us! We'll get back to you soon.",
        id: submission.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to submit contact form" },
      { status: 500 }
    );
  }
}
