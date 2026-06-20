// Session + admin gate helpers for route handlers.
//
// Returns a discriminated-union result instead of throwing or
// returning a NextResponse directly. The caller uses an early-return
// pattern:
//
//   const auth = await requireAdmin();
//   if (!auth.ok) return auth.response;
//   // ...auth.user is now typed { id, email?, name? }
//
// Why a result union instead of "throw + catch in a wrapper":
//   - Route handlers already have a try/catch for their domain
//     errors; we'd be threading two error paths otherwise.
//   - The early-return shape composes cleanly with other gates
//     (rate-limit then auth then admin) without nesting.

import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import type { NextResponse } from "next/server";
import { forbidden, unauthorized } from "./responses";

export interface SessionUser {
  id: string;
  email?: string | null;
  name?: string | null;
}

export interface SessionUserWithRole extends SessionUser {
  role: string;
}

export type AllowedRole = "admin" | "support" | "customer";

export type GateResult<T> =
  | { ok: true; user: T }
  | { ok: false; response: NextResponse };

/** Assert an authenticated NextAuth session. Returns the user's id,
 *  email, and name. No DB hit. */
export async function requireSession(): Promise<GateResult<SessionUser>> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, response: unauthorized() };
  return {
    ok: true,
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    },
  };
}

/** Assert an authenticated session whose User document has role === "admin".
 *  Performs one DB read (UserModel.findById) to check the role. */
export async function requireAdmin(): Promise<GateResult<SessionUser>> {
  const sessionResult = await requireSession();
  if (!sessionResult.ok) return sessionResult;

  await connectToDatabase();
  const dbUser = await UserModel.findById(sessionResult.user.id).select("role");
  if (!dbUser || dbUser.role !== "admin") {
    return { ok: false, response: forbidden() };
  }
  return sessionResult;
}

/** Session-only role gate. No DB lookup — checks session.user.role
 *  against the allowed set. Returns 401 (matching the original inline
 *  pattern, which emitted 401 for both no-session and wrong-role).
 *
 *  Use this for routes that previously did:
 *    if (!session?.user || session.user.role !== "admin") { 401 }
 *    if (!session?.user || (role !== "admin" && role !== "support")) { 401 }
 *
 *  Use requireAdmin() (DB-backed) for routes that previously did:
 *    UserModel.findById(...) && role !== 'admin' → 403
 */
export async function requireSessionRoles(
  allowed: AllowedRole[],
): Promise<GateResult<SessionUserWithRole>> {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (
    !session?.user?.id ||
    !role ||
    !(allowed as string[]).includes(role)
  ) {
    return { ok: false, response: unauthorized() };
  }
  return {
    ok: true,
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role,
    },
  };
}
