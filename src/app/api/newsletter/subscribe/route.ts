import { NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { db } from "~/server/db";
import { Resend } from "resend";

const subscribeSchema = z.object({
  email: z.string().email("Invalid email address"),
});

async function sendWelcomeEmail(email: string, unsubscribeToken: string): Promise<boolean> {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.warn("[Newsletter] RESEND_API_KEY not configured");
      return false;
    }

    const resend = new Resend(resendApiKey);
    const fromEmail = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const unsubscribeUrl = `${baseUrl}/api/newsletter/unsubscribe?token=${unsubscribeToken}`;

    const result = await resend.emails.send({
      from: `PPTMaster <${fromEmail}>`,
      to: [email],
      subject: "Welcome to PPTMaster Newsletter! 🎉",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1a1a1a; font-size: 28px; margin: 0;">Welcome to PPTMaster! 🎉</h1>
          </div>
          
          <p style="color: #4a4a4a; font-size: 16px; line-height: 26px;">
            Thanks for subscribing to our newsletter! You're now part of the PPTMaster community.
          </p>
          
          <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <h3 style="color: #1a1a1a; margin-top: 0; font-size: 18px;">What you'll receive:</h3>
            <ul style="color: #4a4a4a; font-size: 15px; line-height: 24px; padding-left: 20px;">
              <li>🚀 New feature announcements and updates</li>
              <li>💡 Tips & tricks for creating stunning presentations</li>
              <li>🎨 Design inspiration and templates</li>
              <li>📊 Industry insights and best practices</li>
              <li>🎁 Exclusive offers and early access to new features</li>
            </ul>
          </div>
          
          <p style="color: #4a4a4a; font-size: 16px; line-height: 26px;">
            We typically send 1-2 emails per month — no spam, just valuable content to help you create better presentations.
          </p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${baseUrl}/dashboard" style="background-color: #5046e5; border-radius: 6px; color: #fff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 12px 28px; display: inline-block;">
              Start Creating
            </a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e6e6e6; margin: 32px 0;" />
          
          <p style="color: #8898aa; font-size: 14px;">
            — The PPTMaster Team
          </p>
          
          <div style="margin-top: 24px; padding: 12px; background-color: #f9fafb; border-radius: 6px; border: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px; margin: 0; text-align: center;">
              🤖 This is an automated message. Please do not reply to this email.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
            <a href="${unsubscribeUrl}" style="color: #9ca3af; font-size: 11px; text-decoration: underline;">
              Unsubscribe from this newsletter
            </a>
          </div>
        </div>
      `,
    });

    if (result.error) {
      console.error("[Newsletter] Email error:", result.error);
      return false;
    }

    console.log("[Newsletter] Welcome email sent, ID:", result.data?.id);
    return true;
  } catch (error) {
    console.error("[Newsletter] Failed to send email:", error);
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = subscribeSchema.parse(body);

    // Check if already subscribed
    const existing = await db.newsletter.findUnique({
      where: { email },
    });

    if (existing) {
      if (existing.status === "confirmed") {
        return NextResponse.json({
          success: true,
          message: "You're already subscribed!",
          alreadySubscribed: true,
        });
      }

      // If pending or unsubscribed, reactivate
      const unsubscribeToken = existing.unsubscribeToken ?? nanoid(32);
      
      await db.newsletter.update({
        where: { email },
        data: {
          status: "confirmed",
          confirmedAt: new Date(),
          unsubscribeToken,
          unsubscribedAt: null,
        },
      });

      await sendWelcomeEmail(email, unsubscribeToken);

      return NextResponse.json({
        success: true,
        message: "You're subscribed! Check your inbox for a welcome email.",
      });
    }

    // Create new subscription (directly confirmed, no double opt-in)
    const unsubscribeToken = nanoid(32);

    await db.newsletter.create({
      data: {
        email,
        status: "confirmed",
        confirmedAt: new Date(),
        unsubscribeToken,
      },
    });

    // Send welcome email
    await sendWelcomeEmail(email, unsubscribeToken);

    return NextResponse.json({
      success: true,
      message: "You're subscribed! Check your inbox for a welcome email.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0]?.message ?? "Invalid email" },
        { status: 400 }
      );
    }

    console.error("[Newsletter Subscribe] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to subscribe" },
      { status: 500 }
    );
  }
}
