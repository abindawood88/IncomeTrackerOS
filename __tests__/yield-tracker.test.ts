import assert from "node:assert/strict";
import { buildYieldTrackerData } from "../lib/yield-tracker";

{
  const data = buildYieldTrackerData([0, 0, 0, 850, 0, 0, 0, 0, 0, 0, 0, 0], 1200, 1000);
  assert.equal(data[4].estimated, 990);
}

{
  const data = buildYieldTrackerData(new Array(12).fill(0), 1200, 1000);
  assert.ok(data.every((entry) => entry.estimated === 1200));
}

{
  const actuals = [0, 900, 850, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const data = buildYieldTrackerData(actuals, 1200, 1000);
  assert.equal(data[2].estimated, 1020);
  assert.equal(data[3].estimated, 918);
}

{
  const data = buildYieldTrackerData(new Array(12).fill(0), 1200, 1000);
  assert.equal(data[0].estimated, 1200);
}

{
  const data = buildYieldTrackerData(new Array(12).fill(0), 1200, 1000);
  assert.equal(data[0].label, "Jan");
  assert.equal(data[11].label, "Dec");
}

{
  const monthlySeries = [600, 600, 900, 600, 600, 900, 600, 600, 900, 600, 600, 1200];
  const data = buildYieldTrackerData(new Array(12).fill(0), monthlySeries, 1000);
  assert.equal(data[2].estimated, 900);
  assert.equal(data[11].estimated, 1200);
}

{
  const monthlySeries = [600, 600, 900, 600, 600, 900, 600, 600, 900, 600, 600, 1200];
  const actuals = [0, 0, 990, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const data = buildYieldTrackerData(actuals, monthlySeries, 1000);
  assert.equal(data[2].estimated, 900);
  assert.equal(data[3].estimated, 636);
}
