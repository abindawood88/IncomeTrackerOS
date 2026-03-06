import assert from "node:assert/strict";
import { buildHoldingSeeds, normalizeAllocations } from "../lib/apply-portfolio";

test('apply-portfolio.test', () => {
{
  const result = normalizeAllocations([
    { ticker: "SCHD", weight: 40 },
    { ticker: "VYM", weight: 60 },
  ]);
  assert.deepEqual(result.dropped, []);
  assert.equal(result.normalized[0].weight, 0.4);
  assert.equal(result.normalized[1].weight, 0.6);
}

{
  const result = normalizeAllocations([
    { ticker: "FAKE", weight: 50 },
    { ticker: "SCHD", weight: 50 },
  ]);
  assert.equal(result.normalized.length, 1);
  assert.equal(result.normalized[0].ticker, "SCHD");
  assert.equal(result.normalized[0].weight, 1);
  assert.deepEqual(result.dropped, [{ ticker: "FAKE", reason: "not_in_db" }]);
}

{
  const result = normalizeAllocations([
    { ticker: "SCHD", weight: 0 },
    { ticker: "VYM", weight: 50 },
  ]);
  assert.equal(result.normalized.length, 1);
  assert.equal(result.normalized[0].ticker, "VYM");
  assert.deepEqual(result.dropped, [{ ticker: "SCHD", reason: "zero_weight" }]);
}

{
  const result = normalizeAllocations([
    { ticker: "FAKE", weight: 0 },
    { ticker: "SCHD", weight: 50 },
  ]);
  assert.equal(result.dropped[0].reason, "not_in_db");
}

{
  const result = normalizeAllocations([
    { ticker: "FAKE1", weight: 10 },
    { ticker: "FAKE2", weight: 10 },
  ]);
  assert.equal(result.normalized.length, 0);
  assert.equal(result.dropped.length, 2);
}

{
  const result = normalizeAllocations([{ ticker: "schd", weight: 100 } as never]);
  assert.equal(result.normalized[0].ticker, "SCHD");
  assert.equal(result.normalized[0].weight, 1);
}

{
  const result = normalizeAllocations([{ ticker: "SCHD", weight: "33.5" as never }]);
  assert.equal(result.normalized[0].weight, 1);
}

{
  const result = buildHoldingSeeds([{ ticker: "SCHD", weight: 1 }], 10_000);
  assert.equal(result.seeds[0].shares, 121);
  assert.equal(result.skipped.length, 0);
}

{
  const result = buildHoldingSeeds([{ ticker: "VOO", weight: 1 }], 1_000, true);
  assert.equal(result.seeds[0].shares, 2.0437);
  assert.equal(result.skipped.length, 0);
}

{
  const result = buildHoldingSeeds([{ ticker: "VOO", weight: 0.05 }], 500);
  assert.equal(result.seeds.length, 0);
  assert.equal(result.skipped[0].ticker, "VOO");
}

{
  const result = buildHoldingSeeds([{ ticker: "SCHD", weight: 0.2 }], 500);
  assert.equal(result.seeds[0].shares, 1);
}

{
  const result = buildHoldingSeeds([{ ticker: "SCHD", weight: 1 }], 0);
  assert.equal(result.seeds.length, 0);
  assert.equal(result.skipped.length, 1);
}

});
