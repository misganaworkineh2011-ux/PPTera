import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { sendContactNotification, sendContactConfirmation } from "~/lib/email";

export async function POST(req: NextRequest) {
  try {
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

    // Send email notification to admin (don't block on failure)
    sendContactNotification(name, email, subject, message).catch((err) => {
      console.error("Failed to send admin notification:", err);
    });

    // Send confirmation email to user (don't block on failure)
    sendContactConfirmation(email, name, subject).catch((err) => {
      console.error("Failed to send user confirmation:", err);
    });

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
