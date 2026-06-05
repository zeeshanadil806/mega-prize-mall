// Pre-import setup. Vitest's setupFiles hook runs before any test
// module is loaded, so this is where we plant the env vars that test
// targets read at module-load time (lib/mongodb.ts captures
// process.env.MONGODB_URI as a const at import).
//
// Tests that exercise route handlers reading CRON_SECRET at request
// time also rely on this file for a stable secret.

process.env.MONGODB_URI =
  process.env.MONGODB_URI ?? "mongodb://placeholder.local/test";
process.env.CRON_SECRET =
  process.env.CRON_SECRET ?? "test-cron-secret-1234567890abcdef";
