import { Resend } from "resend";

// Use process.env directly to avoid t3-env caching issues
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL;
const RESEND_REPLY_TO_EMAIL = process.env.RESEND_REPLY_TO_EMAIL;

// Lazy initialization to avoid errors when RESEND_API_KEY is not set
let resendClient: Resend | null = null;

export function getResendClient(): Resend {
  if (!RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  if (!resendClient) {
    resendClient = new Resend(RESEND_API_KEY);
  }

  return resendClient;
}

export const emailConfig = {
  // For automated emails (welcome, notifications) - no reply
  fromNoReply: "PPT Master <noreply@pptmaster.app>",
  // For emails that should allow replies (contact, support)
  from: RESEND_FROM_EMAIL
    ? `PPT Master <${RESEND_FROM_EMAIL}>`
    : "PPT Master <hello@pptmaster.app>",
  replyTo: RESEND_REPLY_TO_EMAIL ?? "pptmaster.app@gmail.com",
} as const;

export type EmailResult = {
  success: boolean;
  messageId?: string;
  error?: string;
};
