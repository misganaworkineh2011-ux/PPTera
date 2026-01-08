import { Webhook } from "svix";
import { headers } from "next/headers";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { env } from "~/env";
import { Prisma } from "@prisma/client";
import { sendWelcomeEmail } from "~/lib/email";

// Force dynamic rendering for webhook endpoint
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ============================================================================
// WEBHOOK HANDLER
// ============================================================================

export async function POST(req: Request) {
  // Step 1: Validate webhook secret
  const WEBHOOK_SECRET = env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    const status = env.NODE_ENV === "production" ? 500 : 200;
    return new Response("Webhook secret not configured", { status });
  }

  // Step 2: Get and validate headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  // Step 3: Parse and verify webhook payload
  let payload: unknown;
  let body: string;
  
  try {
    // Read the body as text first to handle potential issues
    const bodyText = await req.text();
    
    if (!bodyText || bodyText.trim().length === 0) {
      return new Response("Empty request body", { status: 400 });
    }
    
    // Parse the JSON
    try {
      payload = JSON.parse(bodyText);
    } catch (parseError) {
      return new Response("Invalid JSON payload", { status: 400 });
    }
    
    // Use the original text for signature verification
    body = bodyText;
  } catch (error) {
    return new Response("Failed to read request body", { status: 400 });
  }
  
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    return new Response("Webhook verification failed", { status: 400 });
  }

  // Step 4: Handle the event
  const eventType = evt.type;

  try {
    switch (eventType) {
      case "user.created":
        await handleUserCreated(evt.data);
        break;
      case "user.updated":
        await handleUserUpdated(evt.data);
        break;
      case "user.deleted":
        await handleUserDeleted(evt.data);
        break;
      default:
        // Unhandled event type - just acknowledge
        break;
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    // Return 500 to trigger Clerk retry
    return new Response("Internal server error", { status: 500 });
  }
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

interface ClerkUserEventData {
  id: string;
  email_addresses: Array<{
    email_address: string;
    verification?: { status: string } | null;
  }>;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
  username: string | null;
}

async function handleUserCreated(data: unknown) {
  try {
    // Validate data structure
    if (!data || typeof data !== "object") {
      throw new Error("Invalid user data: data is not an object");
    }

    const userData = data as ClerkUserEventData;
    
    // Validate required fields
    if (!userData.id) {
      throw new Error("Invalid user data: missing id");
    }

    if (!userData.email_addresses || !Array.isArray(userData.email_addresses) || userData.email_addresses.length === 0) {
      throw new Error("Invalid user data: missing or empty email_addresses array");
    }

    const { id, email_addresses, first_name, last_name, image_url, username } = userData;
    const email = email_addresses[0]?.email_address || "";
    const name = `${first_name || ""} ${last_name || ""}`.trim() || username || "User";
    const emailVerified = email_addresses[0]?.verification?.status === "verified";

    // Validate email is not empty (required field in database)
    if (!email || email.trim() === "") {
      throw new Error(`Invalid user data: email is required but was empty. Clerk ID: ${id}`);
    }

    // Step 1: Check if user already exists by clerkId (most common case)
    const existingByClerkId = await db.user.findUnique({
      where: { clerkId: id },
    });

    if (existingByClerkId) {
      await db.user.update({
        where: { id: existingByClerkId.id },
        data: { email, name, emailVerified, image: image_url },
      });
      return;
    }

    // Step 2: Check if user exists by email (might have been created before Clerk)
    if (email) {
      const existingByEmail = await db.user.findFirst({
        where: { email },
      });

      if (existingByEmail) {
        // Check if existing user already has a clerkId
        if (existingByEmail.clerkId && existingByEmail.clerkId !== id) {
          // Don't update - this is a conflict that needs manual resolution
          return;
        }

        await db.user.update({
          where: { id: existingByEmail.id },
          data: { clerkId: id, name, emailVerified, image: image_url },
        });
        return;
      }
    }

    // Step 3: Create new user with retry logic for race conditions
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const newUser = await db.user.create({
          data: {
            clerkId: id,
            email,
            name,
            emailVerified,
            image: image_url,
            credits: 200, // Free credits for new users
            subscriptionPlan: "Free",
          },
        });
        
        // Send welcome email (don't block on failure)
        if (email) {
          sendWelcomeEmail(email, name).catch((err) => {
            console.error("Failed to send welcome email:", err);
          });
        }
        
        return;
      } catch (error) {
        // Handle unique constraint violation (race condition)
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          // Check if user was created by another process
          const existingUser = await db.user.findUnique({
            where: { clerkId: id },
          });

          if (existingUser) {
            return;
          }

          // If still not found, retry with exponential backoff
          if (attempt < maxRetries) {
            const delay = Math.pow(2, attempt) * 100; // 200ms, 400ms, 800ms
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }
        }

        // If this is the last attempt, throw the error
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Otherwise, retry with exponential backoff
        const delay = Math.pow(2, attempt) * 100;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
    }
    
    // If we get here, all retries failed
    throw new Error(`Failed to create user after ${maxRetries} attempts. Clerk ID: ${id}`);
  } catch (error) {
    throw error;
  }
}

async function handleUserUpdated(data: unknown) {
  const userData = data as ClerkUserEventData;
  const { id, email_addresses, first_name, last_name, image_url, username } = userData;
  const email = email_addresses[0]?.email_address || "";
  const name = `${first_name || ""} ${last_name || ""}`.trim() || username || "User";
  const emailVerified = email_addresses[0]?.verification?.status === "verified";

  try {
    const user = await db.user.update({
      where: { clerkId: id },
      data: { email, name, emailVerified, image: image_url },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      // User not found - this can happen if webhook arrives before user.created
      await handleUserCreated(data);
    } else {
      throw error;
    }
  }
}

async function handleUserDeleted(data: unknown) {
  const userData = data as { id?: string };
  const { id } = userData;

  if (!id) {
    return;
  }

  try {
    await db.user.delete({
      where: { clerkId: id },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      // User not found - already deleted or never existed
      // This is fine, just return
    } else {
      throw error;
    }
  }
}
