import { env } from "~/env";
import { db } from "~/server/db";

const POLAR_API_URL = "https://api.polar.sh/v1";

interface PolarCustomer {
    id: string;
    email: string;
    name: string | null;
    external_id?: string;
}

/**
 * Create or get a customer in Polar by external ID
 * This ensures customers exist in Polar before sending usage events
 */
export async function ensurePolarCustomer(
    clerkId: string,
    email: string,
    name: string
): Promise<{ success: boolean; customerId?: string; error?: string }> {
    try {
        // Try to get customer by external ID first
        const getResponse = await fetch(
            `${POLAR_API_URL}/customers/external/${encodeURIComponent(clerkId)}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${env.POLAR_ACCESS_TOKEN}`,
                },
            }
        );

        if (getResponse.ok) {
            const customer = (await getResponse.json()) as PolarCustomer;
            console.log("[Polar Client] Customer already exists:", customer.id);
            return { success: true, customerId: customer.id };
        }

        // Customer doesn't exist, create it
        console.log("[Polar Client] Creating new customer in Polar");
        const createResponse = await fetch(`${POLAR_API_URL}/customers`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${env.POLAR_ACCESS_TOKEN}`,
            },
            body: JSON.stringify({
                external_id: clerkId,
                email,
                name,
            }),
        });

        if (!createResponse.ok) {
            const errorText = await createResponse.text();
            console.error("[Polar Client] Failed to create customer:", errorText);
            return {
                success: false,
                error: `Failed to create customer: ${createResponse.status} - ${errorText}`,
            };
        }

        const newCustomer = (await createResponse.json()) as PolarCustomer;
        console.log("[Polar Client] Customer created successfully:", newCustomer.id);

        // Update our database with the Polar customer ID
        // Note: This assumes the User model has a polarCustomerId field.
        // If not, this might fail or need a migration.
        try {
            await db.user.update({
                where: { clerkId },
                data: { polarCustomerId: newCustomer.id },
            });
        } catch (dbError) {
            console.warn("[Polar Client] Warning: Could not update user with polarCustomerId in DB. Migration might be missing.", dbError);
        }

        return { success: true, customerId: newCustomer.id };
    } catch (error) {
        console.error("[Polar Client] Error ensuring customer:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error),
        };
    }
}
