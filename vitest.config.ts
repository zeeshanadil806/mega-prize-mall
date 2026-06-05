import { defineConfig } from "vitest/config";
import path from "node:path";

// Vitest config — runs in Node env, matches the @/* alias from tsconfig
// so test files import the same way production code does.
//
// Pure unit tests live in tests/unit/* and run in milliseconds.
// Integration tests that need a real Mongo connection live in
// tests/integration/* and spin up mongodb-memory-server per suite.
export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["tests/**/*.test.ts"],
    setupFiles: ["./tests/setup.ts"],
    // Integration suites get extra time for mongodb-memory-server boot
    testTimeout: 30_000,
    hookTimeout: 30_000,
    // Run files sequentially. Integration suites each boot their own
    // mongodb-memory-server; parallel boots collide on shared binary
    // cache and Vitest 4 has a related worker-init quirk that surfaces
    // as "Cannot read properties of undefined (reading 'config')".
    fileParallelism: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["lib/**/*.ts", "app/api/**/*.ts", "features/**/*.ts"],
      exclude: ["**/*.test.ts", "**/__tests__/**"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
