import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    // Better Auth session signing secret (required)
    BETTER_AUTH_SECRET: z.string(),
    // Canonical origin for auth callbacks (falls back to NEXT_PUBLIC_APP_URL)
    BETTER_AUTH_URL: z.string().url().optional(),
    // Google OAuth — optional; the Google button activates when both are set
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    POLAR_ACCESS_TOKEN: z.string(),
    POLAR_ENV: z.enum(["sandbox", "production"]).default("sandbox"),
    POLAR_WEBHOOK_SECRET: z.string(),
    POLAR_PRODUCT_PLUS: z.string().optional(),
    POLAR_PRODUCT_PRO: z.string().optional(),
    POLAR_PRODUCT_ULTRA: z.string().optional(),
    POLAR_PRODUCT_YEARLY_PLUS: z.string().optional(),
    POLAR_PRODUCT_YEARLY_PRO: z.string().optional(),
    POLAR_PRODUCT_YEARLY_ULTRA: z.string().optional(),
    POLAR_PRODUCT_LIFETIME: z.string().optional(),
    POLAR_TOPUP_500: z.string().optional(),
    POLAR_TOPUP_1000: z.string().optional(),
    POLAR_TOPUP_2500: z.string().optional(),
    CRON_SECRET: z.string().optional(),
    OPENAI_API_KEY: z.string(),
    PEXELS_API_KEY: z.string().optional(),
    GEMINI_API_KEY: z.string().optional(),
    // Tiered generation models: a stronger model for the creative outline/visual-strategy
    // step, a cheaper one for mechanical content expansion. Override via env to tune cost/latency.
    GEMINI_OUTLINE_MODEL: z.string().default("gemini-2.5-pro"),
    GEMINI_CONTENT_MODEL: z.string().default("gemini-2.5-flash-lite"),
    // Cloudinary configuration (optional, required for AI image uploads)
    CLOUDINARY_CLOUD_NAME: z.string().optional(),
    CLOUDINARY_UPLOAD_PRESET: z.string().optional(),
    // Resend email configuration
    RESEND_API_KEY: z.string().optional(),
    RESEND_FROM_EMAIL: z.string().optional(),
    RESEND_REPLY_TO_EMAIL: z.string().optional(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },
  client: {
    // "1" shows the Google sign-in buttons (set alongside the server creds)
    NEXT_PUBLIC_GOOGLE_AUTH_ENABLED: z.string().optional(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    POLAR_ACCESS_TOKEN: process.env.POLAR_ACCESS_TOKEN,
    POLAR_ENV: process.env.POLAR_ENV,
    POLAR_WEBHOOK_SECRET: process.env.POLAR_WEBHOOK_SECRET,
    POLAR_PRODUCT_PLUS: process.env.POLAR_PRODUCT_PLUS,
    POLAR_PRODUCT_PRO: process.env.POLAR_PRODUCT_PRO,
    POLAR_PRODUCT_ULTRA: process.env.POLAR_PRODUCT_ULTRA,
    POLAR_PRODUCT_YEARLY_PLUS: process.env.POLAR_PRODUCT_YEARLY_PLUS,
    POLAR_PRODUCT_YEARLY_PRO: process.env.POLAR_PRODUCT_YEARLY_PRO,
    POLAR_PRODUCT_YEARLY_ULTRA: process.env.POLAR_PRODUCT_YEARLY_ULTRA,
    POLAR_PRODUCT_LIFETIME: process.env.POLAR_PRODUCT_LIFETIME,
    POLAR_TOPUP_500: process.env.POLAR_TOPUP_500,
    POLAR_TOPUP_1000: process.env.POLAR_TOPUP_1000,
    POLAR_TOPUP_2500: process.env.POLAR_TOPUP_2500,
    CRON_SECRET: process.env.CRON_SECRET,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    PEXELS_API_KEY: process.env.PEXELS_API_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GEMINI_OUTLINE_MODEL: process.env.GEMINI_OUTLINE_MODEL,
    GEMINI_CONTENT_MODEL: process.env.GEMINI_CONTENT_MODEL,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_UPLOAD_PRESET: process.env.CLOUDINARY_UPLOAD_PRESET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
    RESEND_REPLY_TO_EMAIL: process.env.RESEND_REPLY_TO_EMAIL,
    NEXT_PUBLIC_GOOGLE_AUTH_ENABLED: process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
