// Browser-side Sentry init. Next.js auto-loads this file on the
// client at app startup (Next 15.3+ replaced the legacy
// sentry.client.config.ts pattern with instrumentation-client.ts).
//
// Gated on NEXT_PUBLIC_SENTRY_DSN: when absent, no client telemetry
// is shipped and no network requests are made to Sentry.

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,

    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,

    // Session replay is a paid Sentry feature; keep disabled by default.
    // Flip to a small sample (e.g. 0.05) once you're sure you want it
    // and your plan covers replays.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,

    debug: false,
    sendDefaultPii: false,
  });
}

// Required by Next 15.3+ for capturing client-side navigation errors.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
