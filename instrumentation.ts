// Next.js calls register() once per server runtime at startup, before
// any request is served.
//
// Two things happen here:
//   1. Env-var validation (lib/env) — throws on misconfigured prod
//      before the server accepts traffic.
//   2. Sentry init — server config on nodejs runtime, edge config on
//      edge runtime. Both no-op when NEXT_PUBLIC_SENTRY_DSN is unset.
//
// onRequestError forwards Server Component / route handler errors to
// Sentry. It's a Next 15+ instrumentation export and runs regardless
// of whether Sentry actually has a DSN — captureRequestError no-ops
// safely when init wasn't called.

import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./lib/env");
    const { initLogger } = await import("./lib/logger");
    await initLogger();
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
