import assert from "node:assert/strict";
import {
  extractTickerDataFromHtml,
  mapPayoutFrequency,
  parsePercentString,
  sanitizeTicker,
} from "../lib/fetch-ticker";

assert.equal(sanitizeTicker(" schd "), "SCHD");
assert.equal(sanitizeTicker("brk.b"), null);

assert.equal(parsePercentString("12.5%"), 0.125);
assert.equal(parsePercentString("bad"), null);

assert.equal(mapPayoutFrequency("Paid Monthly"), "monthly");
assert.equal(mapPayoutFrequency("Paid Weekly"), "weekly");
assert.equal(mapPayoutFrequency(""), "quarterly");

const html = `
  <script>
    quote:{c:123.45,p:120.00}
    dividendYield:"3.40%"
    payoutFrequency:"Paid Monthly"
    "@type":"InvestmentFund","name":"AT&amp;T Income Fund"
  </script>
`;

const extracted = extractTickerDataFromHtml(html, "TEST", {
  ticker: "TEST",
  name: "Fallback",
  price: 99,
  yield: 0.01,
  cagr: 0.12,
  leveraged: false,
  payFreq: "quarterly",
  sparkline: [],
  health: "NEUTRAL",
  source: "local",
  lastUpdated: "2026-02-01",
  categories: [],
});

assert.ok(extracted);
assert.equal(extracted?.price, 123.45);
assert.equal(extracted?.yield, 0.034);
assert.equal(extracted?.payFreq, "monthly");
assert.equal(extracted?.name, "AT&T Income Fund");
assert.equal(extracted?.cagr, 0.12);
