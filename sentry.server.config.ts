// Server-side Sentry init. Runs in the Node.js runtime — covers
// route handlers, server components, server actions, cron routes.
// Imported by instrumentation.ts via the nodejs runtime branch.
//
// Gated on NEXT_PUBLIC_SENTRY_DSN: when the DSN is missing,
// Sentry.init() is skipped entirely so dev/local runs ship zero
// telemetry and never attempt outbound HTTP to ingest.sentry.io.

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,

    // 10% of transactions sent in prod is plenty for an ecommerce site
    // of this size; you can dial up later if you need more granularity
    // and you're under the free-tier quota.
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,

    // Quiet console output. Server errors are still captured and sent.
    debug: false,

    // Drop PII (cookies, headers, request body) by default. Sentry
    // captures them when set to true, which collides with privacy
    // policies. Re-enable per-event via `Sentry.setUser()` if needed.
    sendDefaultPii: false,
  });
}
