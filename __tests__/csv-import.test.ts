import assert from "node:assert/strict";
import { parseHoldingsCSV } from "../lib/csv-import";

{
  const result = parseHoldingsCSV("ticker,shares,avgCost\nSCHD,100,80.50\nVYM,50,115.00");
  assert.deepEqual(result.valid, [
    { ticker: "SCHD", shares: 100, avgCost: 80.5 },
    { ticker: "VYM", shares: 50, avgCost: 115 },
  ]);
}

{
  const result = parseHoldingsCSV("symbol\tqty\tcost_basis\nJEPI\t200\t55.00");
  assert.deepEqual(result.valid[0], { ticker: "JEPI", shares: 200, avgCost: 55 });
}

{
  const result = parseHoldingsCSV("ticker,shares,avgCost\nSCHD,0,80.00");
  assert.equal(result.valid.length, 0);
  assert.ok(result.rejected[0].reason.includes("Zero"));
}

{
  const result = parseHoldingsCSV("ticker,shares,avgCost\nMYCUSTOM,10,50.00");
  assert.equal(result.valid[0].ticker, "MYCUSTOM");
  assert.equal(result.valid[0].avgCost, 50);
}

{
  const result = parseHoldingsCSV("ticker,shares\nSCHD,100");
  assert.equal(result.valid[0].avgCost, 82.4);
}

{
  const result = parseHoldingsCSV('ticker,shares,avgCost\n"SCHD",100,"82.40"');
  assert.deepEqual(result.valid[0], { ticker: "SCHD", shares: 100, avgCost: 82.4 });
}

{
  const result = parseHoldingsCSV("ticker,shares,avgCost\nSCHD,100,82\n\nVYM,50,115");
  assert.equal(result.valid.length, 2);
}

{
  const result = parseHoldingsCSV("SCHD,100,82");
  assert.equal(result.valid.length, 0);
  assert.ok(result.rejected[0].reason.includes("ticker") || result.rejected[0].reason.includes("symbol"));
}
