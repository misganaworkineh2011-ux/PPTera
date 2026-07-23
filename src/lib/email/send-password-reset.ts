import { getResendClient, emailConfig, type EmailResult } from "./resend";

interface SendPasswordResetParams {
  to: string;
  name?: string | null;
  url: string;
}

/** Better Auth password-reset email (plain HTML, brand-consistent). */
export async function sendPasswordResetEmail({
  to,
  name,
  url,
}: SendPasswordResetParams): Promise<EmailResult> {
  try {
    const resend = getResendClient();
    const greeting = name?.trim() ? `Hi ${name.trim().split(" ")[0]},` : "Hi,";
    const { data, error } = await resend.emails.send({
      from: emailConfig.fromNoReply,
      to,
      subject: "Reset your PPTera password",
      html: `
        <div style="font-family:Segoe UI,Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#0f172a;">
          <h2 style="margin:0 0 16px;font-size:20px;">Reset your password</h2>
          <p style="margin:0 0 12px;font-size:14px;line-height:1.6;">${greeting}</p>
          <p style="margin:0 0 20px;font-size:14px;line-height:1.6;">
            We received a request to reset the password for your PPTera account.
            Click the button below to choose a new one. This link expires in one hour.
          </p>
          <a href="${url}" style="display:inline-block;padding:12px 22px;border-radius:12px;background:linear-gradient(90deg,#7c3aed,#06b6d4);color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;">
            Choose a new password
          </a>
          <p style="margin:24px 0 0;font-size:12px;color:#64748b;line-height:1.6;">
            If you didn't request this, you can safely ignore this email — your
            password stays unchanged.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("[Email] Failed to send password reset:", error);
      return { success: false, error: error.message };
    }
    return { success: true, messageId: data?.id };
  } catch (err) {
    console.error("[Email] Password reset send crashed:", err);
    return { success: false, error: err instanceof Error ? err.message : "unknown" };
  }
}
