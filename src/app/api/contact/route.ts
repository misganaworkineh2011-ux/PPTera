import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { Resend } from "resend";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  category: z
    .enum(["general", "support", "billing", "feedback", "partnership"])
    .default("general"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(20, "Message must be at least 20 characters"),
});

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = contactSchema.parse(body);

    const submission = await db.contactSubmission.create({
      data: {
        name: data.name,
        email: data.email,
        category: data.category,
        subject: data.subject,
        message: data.message,
      },
    });

    let emailSent = false;
    try {
      const resendApiKey = process.env.RESEND_API_KEY;
      const fromEmail =
        process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
      const toEmail =
        process.env.RESEND_REPLY_TO_EMAIL ?? "pptmaster.app@gmail.com";

      if (resendApiKey) {
        const resend = new Resend(resendApiKey);
        const fromEmailAddress = fromEmail.includes("<")
          ? (fromEmail.match(/<(.+)>/)?.[1] ?? fromEmail)
          : fromEmail;

        const result = await resend.emails.send({
          from: `PPTera Contact <${fromEmailAddress}>`,
          to: [toEmail],
          replyTo: data.email,
          subject: `[${data.category.toUpperCase()}] ${data.subject} - from ${data.name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #333; border-bottom: 2px solid #5046e5; padding-bottom: 10px;">
                New Contact Form Submission
              </h2>
              <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>From:</strong> ${escapeHtml(data.name)}</p>
                <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
                <p><strong>Category:</strong> ${escapeHtml(data.category)}</p>
                <p><strong>Subject:</strong> ${escapeHtml(data.subject)}</p>
              </div>
              <div style="background-color: #fff; padding: 15px; border-left: 4px solid #5046e5;">
                <h3>Message:</h3>
                <p style="white-space: pre-wrap;">${escapeHtml(data.message)}</p>
              </div>
            </div>
          `,
        });

        if (!result.error) {
          emailSent = true;
        }
      }
    } catch (emailError) {
      console.error("[Contact API] Email error:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "Message sent! We'll get back to you soon.",
      id: submission.id,
      emailSent,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0]?.message ?? "Validation error" },
        { status: 400 }
      );
    }

    console.error("[Contact API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit contact form" },
      { status: 500 }
    );
  }
}
