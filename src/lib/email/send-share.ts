import { getResendClient, emailConfig, type EmailResult } from "./resend";
import { ShareNotification } from "./templates/share-notification";

interface SendShareNotificationParams {
  to: string;
  senderName: string;
  presentationTitle: string;
  presentationSlug: string;
  message?: string;
}

export async function sendShareNotification({
  to,
  senderName,
  presentationTitle,
  presentationSlug,
  message,
}: SendShareNotificationParams): Promise<EmailResult> {
  try {
    const resend = getResendClient();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://pptmaster.app";
    const presentationUrl = `${baseUrl}/presentation/${presentationSlug}`;

    const { data, error } = await resend.emails.send({
      from: emailConfig.from,
      to,
      replyTo: emailConfig.replyTo,
      subject: `${senderName} shared a presentation with you`,
      react: ShareNotification({
        senderName,
        presentationTitle,
        presentationUrl,
        message,
      }),
    });

    if (error) {
      console.error("[Email] Failed to send share notification:", error);
      return { success: false, error: error.message };
    }

    console.log("[Email] Share notification sent:", data?.id);
    return { success: true, messageId: data?.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[Email] Exception sending share notification:", msg);
    return { success: false, error: msg };
  }
}
