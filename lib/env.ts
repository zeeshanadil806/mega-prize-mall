// Boot-time validation of environment variables. Runs once at module
// load. A missing or malformed required var throws here instead of
// surfacing as a cryptic stack trace from the first request that
// happens to touch the misconfigured code path.
//
// Required vars are ones the app cannot start without (database, auth,
// storage, transactional email, cron auth). Optional vars are feature
// gates (Google OAuth, TikTok pixel, Meta pixel, support phone). A
// missing optional var disables the corresponding integration but the
// rest of the app keeps running.
//
// Existing `process.env.X` usages throughout the codebase keep working
// unchanged. Importing this module triggers validation as a side effect;
// `instrumentation.ts` imports it so the failure happens at startup.

import { z } from "zod";

const schema = z.object({
  // Core infrastructure — boot fails without these
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  NEXTAUTH_SECRET: z.string().min(16, "NEXTAUTH_SECRET must be at least 16 chars"),
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL must be a valid URL"),

  // Cloudflare R2 — required for image uploads, product images, etc.
  CLOUDFLARE_ACCOUNT_ID: z.string().min(1),
  CLOUDFLARE_R2_ACCESS_KEY: z.string().min(1),
  CLOUDFLARE_R2_SECRET_KEY: z.string().min(1),
  CLOUDFLARE_R2_BUCKET: z.string().min(1),
  CLOUDFLARE_R2_PUBLIC_ENDPOINT: z.string().url().optional(),

  // Transactional email (Gmail SMTP via Nodemailer)
  GMAIL_USER: z.string().email("GMAIL_USER must be a valid email"),
  GMAIL_APP_PASSWORD: z.string().min(1, "GMAIL_APP_PASSWORD is required"),
  ADMIN_EMAIL: z.string().email().optional(),

  // Cron / scheduled jobs
  CRON_SECRET: z.string().min(16, "CRON_SECRET must be at least 16 chars"),

  // Upstash Redis — distributed rate limiter. Optional so `npm run dev`
  // works without provisioning Upstash; the limiter falls back to an
  // in-process LRU when these are absent (see lib/rate-limit.ts).
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Sentry — error monitoring. All optional; SDK no-ops when DSN missing.
  // SENTRY_AUTH_TOKEN / ORG / PROJECT are only consumed at build time for
  // source-map upload; production runtime only needs NEXT_PUBLIC_SENTRY_DSN.
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),

  // Optional feature integrations — gated by presence
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  TIKTOK_ACCESS_TOKEN: z.string().optional(),
  TIKTOK_API_VERSION: z.string().optional(),
  TIKTOK_TEST_EVENT_CODE: z.string().optional(),
  TIKTOK_PURCHASE_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_TIKTOK_PIXEL_ID: z.string().optional(),
  NEXT_PUBLIC_TIKTOK_TEST_MODE: z.string().optional(),

  META_ACCESS_TOKEN: z.string().optional(),
  META_API_VERSION: z.string().optional(),
  NEXT_PUBLIC_META_PIXEL_ID: z.string().optional(),
  NEXT_PUBLIC_META_TEST_MODE: z.string().optional(),

  // Misc
  SUPPORT_PHONE: z.string().optional(),
  NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION: z.string().optional(),

  // Set by Next.js automatically; included so schema is exhaustive
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
    .join("\n");
  // Throwing at module load is intentional. Next.js will surface this
  // in the server log and refuse to serve requests until fixed.
  throw new Error(
    `Invalid environment configuration:\n${issues}\n\n` +
      `Check your .env.local (development) or deployment env vars (production).`,
  );
}

export const env = parsed.data;
export type Env = typeof env;
