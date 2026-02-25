import { db } from "~/server/db";

/**
 * Validates an API key and returns the user or null if invalid.
 */
export async function validateApiKey(key: string) {
  if (!key || !key.startsWith("pptm_")) return null;

  try {
    const apiKeyRecord = await db.apiKey.findUnique({
      where: { key },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            subscriptionPlan: true,
            credits: true,
          },
        },
      },
    });

    if (!apiKeyRecord) return null;

    // Optional: Only allow Ultra users
    if (apiKeyRecord.user.subscriptionPlan !== "ultra") return null;

    // Update lastUsed
    await db.apiKey.update({
      where: { id: apiKeyRecord.id },
      data: { lastUsed: new Date() },
    });

    return apiKeyRecord.user;
  } catch (error) {
    console.error("API authentication error:", error);
    return null;
  }
}
