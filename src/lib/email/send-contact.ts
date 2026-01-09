import { getResendClient, emailConfig, type EmailResult } from "./resend";
import { ContactConfirmation } from "./templates/contact-confirmation";
import { ContactNotification } from "./templates/contact-notification";

interface SendContactEmailsParams {
  userName: string;
  userEmail: string;
  subject: string;
  message: string;
  category: string;
}

export async function sendContactEmails({
  userName,
  userEmail,
  subject,
  message,
  category,
}: SendContactEmailsParams): Promise<{ confirmation: EmailResult; notification: EmailResult }> {
  const resend = getResendClient();
  const submittedAt = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  // Send confirmation to user
  let confirmation: EmailResult;
  try {
    const { data, error } = await resend.emails.send({
      from: emailConfig.from,
      to: userEmail,
      replyTo: emailConfig.replyTo,
      subject: "We received your message - PPTMaster",
      react: ContactConfirmation({ userName, subject }),
    });

    if (error) {
      console.error("[Email] Failed to send contact confirmation:", error);
      confirmation = { success: false, error: error.message };
    } else {
      console.log("[Email] Contact confirmation sent:", data?.id);
      confirmation = { success: true, messageId: data?.id };
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[Email] Exception sending contact confirmation:", msg);
    confirmation = { success: false, error: msg };
  }

  // Send notification to support team
  let notification: EmailResult;
  try {
    const { data, error } = await resend.emails.send({
      from: emailConfig.from,
      to: emailConfig.replyTo, // Send to support email
      replyTo: userEmail, // Reply goes to the user
      subject: `[Contact] ${category}: ${subject}`,
      react: ContactNotification({
        userName,
        userEmail,
        subject,
        message,
        category,
        submittedAt,
      }),
    });

    if (error) {
      console.error("[Email] Failed to send contact notification:", error);
      notification = { success: false, error: error.message };
    } else {
      console.log("[Email] Contact notification sent:", data?.id);
      notification = { success: true, messageId: data?.id };
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[Email] Exception sending contact notification:", msg);
    notification = { success: false, error: msg };
  }

  return { confirmation, notification };
}
