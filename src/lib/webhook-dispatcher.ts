import { db } from "~/server/db";
import crypto from "crypto";

/**
 * Dispatches an event to all configured webhooks for a user.
 * 
 * Each payload is signed with the user's secret using HMAC-SHA256.
 */
export async function dispatchWebhook(userId: string, event: string, payload: any) {
  try {
    const webhooks = await db.webhookConfig.findMany({
      where: {
        userId,
        active: true,
        events: { has: event },
      },
    });

    if (webhooks.length === 0) return;

    for (const webhook of webhooks) {
      const body = JSON.stringify({
        event,
        created: new Date().toISOString(),
        data: payload,
      });

      const signature = crypto
        .createHmac("sha256", webhook.secret)
        .update(body)
        .digest("hex");

      try {
        // Log the attempt (could be a DB table if needed, but console for now)
        console.log(`Dispatching webhook ${event} to ${webhook.url}`);
        
        const res = await fetch(webhook.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-PPTM-Signature": signature,
            "User-Agent": "PPTera-Webhooks/1.0",
          },
          body,
          // Add a short timeout to prevent blocking
          signal: AbortSignal.timeout(10000), 
        });

        if (!res.ok) {
          console.error(`Webhook recipient responded with status ${res.status}`);
        }
      } catch (err) {
        console.error(`Failed to deliver webhook to ${webhook.url}:`, err);
      }
    }
  } catch (error) {
    console.error("Webhook dispatcher error:", error);
  }
}
