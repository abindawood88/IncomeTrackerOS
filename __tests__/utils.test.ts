import assert from "node:assert/strict";
import { clamp, isEtfDataStale, normalizeTicker, roundTo } from "../lib/utils";

test('utils.test', () => {
assert.equal(normalizeTicker("  schd  "), "SCHD");
assert.equal(normalizeTicker("VoO"), "VOO");
assert.equal(normalizeTicker(""), "");

assert.equal(roundTo(3.000300030003, 4), 3.0003);
assert.equal(roundTo(1000 / 489.3, 4), 2.0437);
assert.equal(roundTo(1.005, 2), 1.01);

assert.equal(clamp(-5, 0, 100), 0);
assert.equal(clamp(150, 0, 100), 100);
assert.equal(clamp(Number.NaN, 0, 100, 0), 0);
assert.equal(clamp(50, 0, 100), 50);

assert.equal(isEtfDataStale("2020-01-01"), true);
assert.equal(isEtfDataStale(new Date().toISOString().split("T")[0]), false);
assert.equal(isEtfDataStale("2020-01-01", 9999), false);
});
