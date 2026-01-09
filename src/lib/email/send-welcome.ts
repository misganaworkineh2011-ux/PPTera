import { getResendClient, emailConfig, type EmailResult } from "./resend";
import { WelcomeEmail } from "./templates/welcome-email";

interface SendWelcomeEmailParams {
  to: string;
  userName: string;
}

export async function sendWelcomeEmail({
  to,
  userName,
}: SendWelcomeEmailParams): Promise<EmailResult> {
  try {
    const resend = getResendClient();
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://pptmaster.app"}/dashboard`;

    const { data, error } = await resend.emails.send({
      from: emailConfig.fromNoReply,
      to,
      subject: "Welcome to PPT Master! 🎉",
      react: WelcomeEmail({ userName, dashboardUrl }),
    });

    if (error) {
      console.error("[Email] Failed to send welcome email:", error);
      return { success: false, error: error.message };
    }

    console.log("[Email] Welcome email sent:", data?.id);
    return { success: true, messageId: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Email] Exception sending welcome email:", message);
    return { success: false, error: message };
  }
}
