import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
<<<<<<< HEAD
import { checkRateLimit, getClientIP, RATE_LIMITS } from "~/lib/rate-limit";
=======
import { Resend } from "resend";
>>>>>>> f675ca3 (welcome, newsletter and subscribe emails are done)

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  category: z.enum(["general", "support", "billing", "feedback", "partnership"]),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(20, "Message must be at least 20 characters"),
});

// Helper function to escape HTML characters for safe email rendering
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
    const data = contactSchema.parse(body);

    // Save to database for audit trail
    const submission = await db.contactSubmission.create({
      data: {
        name: data.name,
        email: data.email,
        category: data.category,
        subject: data.subject,
        message: data.message,
      },
    });

    // Send email notification (don't fail the request if email fails)
    let emailSent = false;
    try {
      const resendApiKey = process.env.RESEND_API_KEY;
      const fromEmail = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
      const toEmail = process.env.RESEND_REPLY_TO_EMAIL ?? "pptmaster.app@gmail.com";
      
      console.log("[Contact API] Email config:", { 
        hasApiKey: !!resendApiKey, 
        fromEmail, 
        toEmail,
        userEmail: data.email 
      });
      
      if (resendApiKey) {
        const resend = new Resend(resendApiKey);
        
        // Extract just the email address part for the from field
        const fromEmailAddress = fromEmail.includes("<") 
          ? fromEmail.match(/<(.+)>/)?.[1] ?? fromEmail 
          : fromEmail;
        
        // Send notification to owner - show it's from the contact form with user's name
        const result = await resend.emails.send({
          from: `PPTMaster Contact <${fromEmailAddress}>`,
          to: [toEmail],
          replyTo: data.email,
          subject: `[${data.category.toUpperCase()}] ${data.subject} - from ${data.name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #333; border-bottom: 2px solid #5046e5; padding-bottom: 10px;">
                📩 New Contact Form Submission
              </h2>
              
              <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 10px 0;"><strong>👤 From:</strong> ${escapeHtml(data.name)}</p>
                <p style="margin: 10px 0;"><strong>📧 Email:</strong> <a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></p>
                <p style="margin: 10px 0;"><strong>🏷️ Category:</strong> ${escapeHtml(data.category)}</p>
                <p style="margin: 10px 0;"><strong>📋 Subject:</strong> ${escapeHtml(data.subject)}</p>
                <p style="margin: 10px 0;"><strong>🕐 Submitted:</strong> ${new Date().toLocaleString()}</p>
              </div>
              
              <div style="background-color: #fff; padding: 15px; border-left: 4px solid #5046e5; margin: 20px 0;">
                <h3 style="color: #333; margin-top: 0;">Message:</h3>
                <p style="color: #555; line-height: 1.6; white-space: pre-wrap;">${escapeHtml(data.message)}</p>
              </div>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #888; font-size: 12px;">
                <p>💡 <strong>Tip:</strong> Reply directly to this email to respond to ${escapeHtml(data.name)}.</p>
                <p>This notification was sent from the PPTMaster contact form.</p>
              </div>
            </div>
          `,
        });
        
        console.log("[Contact API] Resend response:", result);
        
        if (result.error) {
          console.error("[Contact API] Resend error:", result.error);
        } else {
          emailSent = true;
          console.log("[Contact API] Email sent successfully, ID:", result.data?.id);
        }
        
        // Send confirmation email to the user (will only work with verified domain)
        // On free tier, this only works if user's email is your Resend account email
        try {
          const confirmResult = await resend.emails.send({
            from: `PPTMaster <${fromEmailAddress}>`,
            to: [data.email],
            subject: "We received your message - PPTMaster",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #333; text-align: center;">We Got Your Message! 📬</h2>
                
                <p style="color: #4a4a4a; font-size: 16px; line-height: 26px;">Hi ${escapeHtml(data.name)},</p>
                
                <p style="color: #4a4a4a; font-size: 16px; line-height: 26px;">
                  Thanks for reaching out! We've received your message regarding:
                </p>
                
                <div style="background-color: #f4f4f5; border-radius: 6px; padding: 16px; margin: 16px 0; font-style: italic;">
                  "${escapeHtml(data.subject)}"
                </div>
                
                <p style="color: #4a4a4a; font-size: 16px; line-height: 26px;">
                  Our team typically responds within 24-48 hours. We'll get back to you as soon as possible.
                </p>
                
                <hr style="border: none; border-top: 1px solid #e6e6e6; margin: 32px 0;" />
                
                <p style="color: #8898aa; font-size: 14px;">— The PPTMaster Support Team</p>
                
                <div style="margin-top: 24px; padding: 12px; background-color: #f9fafb; border-radius: 6px; border: 1px solid #e5e7eb;">
                  <p style="color: #6b7280; font-size: 12px; margin: 0; text-align: center;">
                    🤖 This is an automated message. Please do not reply directly to this email.<br/>
                    A member of our support team will respond to your inquiry shortly.
                  </p>
                </div>
              </div>
            `,
          });
          
          if (confirmResult.error) {
            console.log("[Contact API] Confirmation email failed (expected on free tier):", confirmResult.error.message);
          } else {
            console.log("[Contact API] Confirmation email sent to user, ID:", confirmResult.data?.id);
          }
        } catch (confirmError) {
          // Expected to fail on free tier for unverified emails
          console.log("[Contact API] Confirmation email skipped (free tier limitation)");
        }
      } else {
        console.warn("[Contact API] RESEND_API_KEY not configured, skipping email");
      }
    } catch (emailError) {
      // Log error but don't fail the request - message is already saved
      console.error("[Contact API] Failed to send email notification:", emailError);
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
