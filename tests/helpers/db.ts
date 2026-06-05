// Integration-test database helper.
//
// Boots an in-memory MongoDB per test suite via mongodb-memory-server,
// points Mongoose at it, exposes hooks for resetting collections
// between tests. Callers wire setup/teardown into their suite via:
//
//   beforeAll(setupTestDb);
//   afterAll(teardownTestDb);
//   afterEach(clearCollections);
//
// The in-memory server boots once per suite (~3-5 seconds), then every
// test runs against a clean state in milliseconds.

import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";

let memoryServer: MongoMemoryReplSet | undefined;

export async function setupTestDb(): Promise<void> {
  if (memoryServer) return;
  // Replica-set mode (single-node) is required because some route
  // handlers we test use mongoose transactions (sessionDb.withTransaction
  // / startTransaction), which standalone mongod refuses. Boot cost is
  // ~5-10s per suite vs ~3s for standalone; still acceptable.
  memoryServer = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  const uri = memoryServer.getUri();
  await mongoose.connect(uri, {
    dbName: "megaprize-test",
  });
  // Wait for the replica set to fully elect a primary. Without this,
  // the first transaction in a suite can race election and fail with
  // "Unable to acquire IX lock within 5ms" (replica-set state churn).
  await memoryServer.waitUntilRunning();
  await mongoose.connection.db?.admin().ping();
}

export async function teardownTestDb(): Promise<void> {
  // No-op by design. mongodb-memory-server's replica-set stop() leaves
  // the underlying mongod process in a half-cleaned state on Windows
  // ("Cannot cleanup because instance.mongodProcess is still defined"),
  // and tearing down between test files within the same worker causes
  // the next file's first query to hang waiting on the prior server
  // to fully release ports/locks.
  //
  // Instead the replica set is shared across every test file in a
  // worker (setupTestDb is idempotent), and the worker process exit
  // reclaims everything. clearCollections() in afterEach keeps each
  // test fully isolated at the data level.
}

export async function clearCollections(): Promise<void> {
  const { collections } = mongoose.connection;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
}
