// Client-side Sentry init. Runs in the browser runtime — covers
// React component rendering, client-side routing, and unhandled window errors.
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
    // of this size; captures client navigation and Core Web Vitals.
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,

    // Quiet console output. Client runtime errors are still captured and sent.
    debug: false,

    // Drop PII (cookies, form values, IP headers) by default to comply with privacy policies.
    sendDefaultPii: false,
  });
}

