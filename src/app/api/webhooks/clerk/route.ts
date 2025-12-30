import { Webhook } from "svix";
import { headers } from "next/headers";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { env } from "~/env";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Missing CLERK_WEBHOOK_SECRET");
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error: Verification failed", { status: 400 });
  }

  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name, image_url, username } = evt.data;
    const email = email_addresses[0]?.email_address || "";

    try {
      // Check if user with this email already exists to prevent duplicates
      // Only check if email is present
      const existingUser = email ? await db.user.findFirst({
        where: { email: email }
      }) : null;

      if (existingUser) {
        // Update existing user with new Clerk ID
        await db.user.update({
          where: { id: existingUser.id },
          data: {
            clerkId: id,
            name: `${first_name || ""} ${last_name || ""}`.trim() || username || "User",
            emailVerified: email_addresses[0]?.verification?.status === "verified",
            image: image_url,
          },
        });
        console.log(`[Clerk Webhook] User updated (linked to existing email): ${id}`);
      } else {
        // Create user in database
        await db.user.create({
          data: {
            clerkId: id,
            email: email,
            name: `${first_name || ""} ${last_name || ""}`.trim() || username || "User",
            emailVerified: email_addresses[0]?.verification?.status === "verified",
            image: image_url,
            credits: 200, // Free credits for new users
            subscriptionPlan: "Free", // Default to free plan
          },
        });
        console.log(`[Clerk Webhook] User created: ${id}`);
      }
    } catch (error) {
      console.error("[Clerk Webhook] Error creating/updating user:", error);
      return new Response("Error creating/updating user", { status: 500 });
    }
  }

  if (eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url, username } = evt.data;

    try {
      // Update user in database
      await db.user.update({
        where: { clerkId: id },
        data: {
          email: email_addresses[0]?.email_address || "",
          name: `${first_name || ""} ${last_name || ""}`.trim() || username || "User",
          emailVerified: email_addresses[0]?.verification?.status === "verified",
          image: image_url,
        },
      });

      console.log(`[Clerk Webhook] User updated: ${id}`);
    } catch (error) {
      console.error("[Clerk Webhook] Error updating user:", error);
      // Don't fail if user doesn't exist
    }
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;

    try {
      // Delete user from database
      await db.user.delete({
        where: { clerkId: id || "" },
      });

      console.log(`[Clerk Webhook] User deleted: ${id}`);
    } catch (error) {
      console.error("[Clerk Webhook] Error deleting user:", error);
      // Don't fail if user doesn't exist
    }
  }

  return new Response("", { status: 200 });
}
