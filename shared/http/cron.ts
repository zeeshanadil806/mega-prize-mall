// Cron / server-to-server auth helper.
//
// Two flavors used in the codebase:
//   - Bearer header:  Authorization: Bearer <CRON_SECRET>
//       (wallet/expire, lucky-draw/entries/auto-create)
//   - Query secret:   ?secret=<CRON_SECRET>
//       (cron/bargain-expiry)
//
// Both return the standard 401 Unauthorized on mismatch so caller
// shapes stay byte-equivalent to the original inline checks.

import type { NextRequest } from "next/server";
import { unauthorized } from "./responses";
import type { GateResult } from "./auth";

/** Verify `Authorization: Bearer <CRON_SECRET>` matches process.env. */
export function requireCronBearer(
  request: NextRequest,
): GateResult<{ source: "cron" }> {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return { ok: false, response: unauthorized() };
  }
  return { ok: true, user: { source: "cron" } };
}

/** Verify `?secret=<CRON_SECRET>` query param matches process.env.
 *  Used by the legacy GET-style cron endpoints. */
export function requireCronQuerySecret(
  request: NextRequest,
): GateResult<{ source: "cron" }> {
  const cronSecret = process.env.CRON_SECRET;
  const secret = request.nextUrl.searchParams.get("secret");
  if (!cronSecret || secret !== cronSecret) {
    return { ok: false, response: unauthorized() };
  }
  return { ok: true, user: { source: "cron" } };
}
