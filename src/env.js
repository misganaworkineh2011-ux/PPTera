import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    CLERK_SECRET_KEY: z.string(),
    CLERK_WEBHOOK_SECRET: z.string().optional(),
    POLAR_ACCESS_TOKEN: z.string(),
    POLAR_ENV: z.enum(["sandbox", "production"]).default("sandbox"),
    POLAR_WEBHOOK_SECRET: z.string(),
    POLAR_PRODUCT_STARTER: z.string().optional(),
    POLAR_PRODUCT_PRO: z.string().optional(),
    POLAR_PRODUCT_ENTERPRISE: z.string().optional(),
    POLAR_PRODUCT_STARTER_YEARLY: z.string().optional(),
    POLAR_PRODUCT_PRO_YEARLY: z.string().optional(),
    POLAR_PRODUCT_ENTERPRISE_YEARLY: z.string().optional(),
    OPENAI_API_KEY: z.string(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },
  client: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET,
    POLAR_ACCESS_TOKEN: process.env.POLAR_ACCESS_TOKEN,
    POLAR_ENV: process.env.POLAR_ENV,
    POLAR_WEBHOOK_SECRET: process.env.POLAR_WEBHOOK_SECRET,
    POLAR_PRODUCT_STARTER: process.env.POLAR_PRODUCT_STARTER,
    POLAR_PRODUCT_PRO: process.env.POLAR_PRODUCT_PRO,
    POLAR_PRODUCT_ENTERPRISE: process.env.POLAR_PRODUCT_ENTERPRISE,
    POLAR_PRODUCT_STARTER_YEARLY: process.env.POLAR_PRODUCT_STARTER_YEARLY,
    POLAR_PRODUCT_PRO_YEARLY: process.env.POLAR_PRODUCT_PRO_YEARLY,
    POLAR_PRODUCT_ENTERPRISE_YEARLY: process.env.POLAR_PRODUCT_ENTERPRISE_YEARLY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
