// Email client and config
export { getResendClient, emailConfig, type EmailResult } from "./resend";

// Email sender functions
export { sendWelcomeEmail } from "./send-welcome";
export { sendContactEmails } from "./send-contact";
export { sendNewsletterConfirmation } from "./send-newsletter";
export { sendShareNotification } from "./send-share";
export { sendCollaborationInvite } from "./send-collaboration-invite";
export { sendExportReadyEmail } from "./send-export-ready";

// Email templates (for testing/preview)
export { WelcomeEmail } from "./templates/welcome-email";
export { ContactConfirmation } from "./templates/contact-confirmation";
export { ContactNotification } from "./templates/contact-notification";
export { NewsletterConfirmation } from "./templates/newsletter-confirmation";
export { ShareNotification } from "./templates/share-notification";
export { CollaborationInvite } from "./templates/collaboration-invite";
export { ExportReady } from "./templates/export-ready";
