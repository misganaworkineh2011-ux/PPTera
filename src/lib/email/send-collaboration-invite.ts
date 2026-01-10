import { getResendClient, emailConfig, type EmailResult } from "./resend";
import { CollaborationInvite } from "./templates/collaboration-invite";

interface SendCollaborationInviteParams {
  to: string;
  senderName: string;
  presentationTitle: string;
  presentationId: string;
  inviteToken: string;
  role: string;
}

export async function sendCollaborationInvite({
  to,
  senderName,
  presentationTitle,
  presentationId,
  inviteToken,
  role,
}: SendCollaborationInviteParams): Promise<EmailResult> {
  try {
    const resend = getResendClient();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const inviteUrl = `${baseUrl}/invitations/${presentationId}?token=${inviteToken}`;

    const { data, error } = await resend.emails.send({
      from: emailConfig.from,
      to,
      replyTo: emailConfig.replyTo,
      subject: `${senderName} invited you to collaborate on a presentation`,
      react: CollaborationInvite({
        senderName,
        presentationTitle,
        inviteUrl,
        role,
      }),
    });

    if (error) {
      console.error("[Email] Failed to send collaboration invite:", error);
      return { success: false, error: error.message };
    }

    console.log("[Email] Collaboration invite sent:", data?.id);
    return { success: true, messageId: data?.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[Email] Exception sending collaboration invite:", msg);
    return { success: false, error: msg };
  }
}
