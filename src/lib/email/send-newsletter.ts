import { getResendClient, emailConfig, type EmailResult } from "./resend";
import { NewsletterConfirmation } from "./templates/newsletter-confirmation";

interface SendNewsletterConfirmationParams {
  to: string;
  confirmToken: string;
}

export async function sendNewsletterConfirmation({
  to,
  confirmToken,
}: SendNewsletterConfirmationParams): Promise<EmailResult> {
  try {
    const resend = getResendClient();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://pptera.com";
    const confirmUrl = `${baseUrl}/api/newsletter/confirm?token=${confirmToken}`;

    const { data, error } = await resend.emails.send({
      from: emailConfig.from,
      to,
      subject: "Confirm your PPTera newsletter subscription",
      react: NewsletterConfirmation({ confirmUrl }),
    });

    if (error) {
      console.error("[Email] Failed to send newsletter confirmation:", error);
      return { success: false, error: error.message };
    }

    console.log("[Email] Newsletter confirmation sent:", data?.id);
    return { success: true, messageId: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Email] Exception sending newsletter confirmation:", message);
    return { success: false, error: message };
  }
}
