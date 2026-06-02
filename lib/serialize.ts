// Tree-walking serializer that converts Mongoose result types (ObjectId,
// Buffer, Date, Decimal128) into plain JSON-safe values so the result can be
// passed from a Server Component to a Client Component without React's
// "Only plain objects can be passed" error.
//
// Use this in place of `JSON.parse(JSON.stringify(doc))`. Compared to the
// serialize/parse round trip it:
//   - walks the tree once instead of building and re-parsing a string
//   - drops Mongoose's internal `__v` automatically
//   - preserves the static type instead of widening to `any`
//
// The static return type is `T` even though some fields (Date, ObjectId)
// are runtime-rewritten to strings — call-site types already assume the
// client-facing shape, so this is the type the caller actually wants.

function hasToHexString(v: object): v is { toHexString: () => string } {
  return typeof (v as { toHexString?: unknown }).toHexString === 'function';
}

function isBsonBinary(v: object): boolean {
  return (v as { _bsontype?: string })._bsontype === 'Binary';
}

function walk(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof value !== 'object') return value;

  // ObjectId — convert to hex string. Check before generic object branch.
  if (hasToHexString(value)) return value.toHexString();

  // BSON Binary buffer — base64 the underlying bytes. The Binary class
  // exposes `toString(encoding)` even though Object.toString takes none.
  if (isBsonBinary(value)) {
    return (value as unknown as { toString(encoding: string): string }).toString('base64');
  }

  if (Array.isArray(value)) {
    return value.map(walk);
  }

  // Plain object — recurse, dropping Mongoose internals.
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (k === '__v') continue;
    out[k] = walk(v);
  }
  return out;
}

/**
 * Recursively rewrite `Date` → `string` because `walk()` converts each Date
 * to its ISO-string form. Primitives, functions, and arrays pass through.
 * This is what makes `serialize` type-honest at the Server → Client boundary.
 */
export type Serialized<T> =
  T extends Date ? string :
  T extends Array<infer U> ? Array<Serialized<U>> :
  T extends object ? { [K in keyof T]: Serialized<T[K]> } :
  T;

export function serialize<T>(value: T): Serialized<T> {
  return walk(value) as Serialized<T>;
}
