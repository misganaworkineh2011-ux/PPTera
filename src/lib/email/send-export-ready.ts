import { getResendClient, emailConfig, type EmailResult } from "./resend";
import { ExportReady } from "./templates/export-ready";

interface SendExportReadyParams {
  to: string;
  presentationTitle: string;
  format: "pdf" | "pptx" | "images";
  downloadUrl: string;
  expiresIn: string;
  fileSize?: string;
}

export async function sendExportReadyEmail({
  to,
  presentationTitle,
  format,
  downloadUrl,
  expiresIn,
  fileSize,
}: SendExportReadyParams): Promise<EmailResult> {
  try {
    const resend = getResendClient();

    const { data, error } = await resend.emails.send({
      from: emailConfig.fromNoReply,
      to,
      subject: `Your ${format.toUpperCase()} export is ready - ${presentationTitle}`,
      react: ExportReady({
        presentationTitle,
        format,
        downloadUrl,
        expiresIn,
        fileSize,
      }),
    });

    if (error) {
      console.error("[Email] Export ready email error:", error);
      return { success: false, error: error.message };
    }

    console.log("[Email] Export ready email sent:", data?.id);
    return { success: true, id: data?.id };
  } catch (error) {
    console.error("[Email] Export ready email exception:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
