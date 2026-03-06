import assert from "node:assert/strict";
import { checkMemoryRateLimit } from "../lib/rate-limit";

test('rate-limit.test', () => {
const cfg = { limit: 2, windowMs: 1_000, prefix: "test" };

const t0 = 1_000;
const first = checkMemoryRateLimit("ip-1", cfg, t0);
assert.equal(first.allowed, true);
assert.equal(first.remaining, 1);

const second = checkMemoryRateLimit("ip-1", cfg, t0 + 10);
assert.equal(second.allowed, true);
assert.equal(second.remaining, 0);

const third = checkMemoryRateLimit("ip-1", cfg, t0 + 20);
assert.equal(third.allowed, false);
assert.equal(third.remaining, 0);

const reset = checkMemoryRateLimit("ip-1", cfg, t0 + 2_000);
assert.equal(reset.allowed, true);
assert.equal(reset.remaining, 1);
});
