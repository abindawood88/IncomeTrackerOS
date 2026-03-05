"use client";

import { project } from "@/lib/engine";

export default function DRIPSimulatorPanel({
  capital,
  monthly,
  cagr,
  yld,
  years,
}: {
  capital: number;
  monthly: number;
  cagr: number;
  yld: number;
  years: number;
}) {
  const withDrip = project({ capital, monthly, cagr, yld, years, drip: true, crash: 0, pause: 0 });
  const withoutDrip = project({ capital, monthly, cagr, yld, years, drip: false, crash: 0, pause: 0 });
  const checkpoints = [5, 10, 20, 30].filter((y) => y <= years);
  const freedomWith = withDrip.findIndex((row) => row.monthly > 0) + 1;
  const freedomWithout = withoutDrip.findIndex((row) => row.monthly > 0) + 1;

  return (
    <div className="rounded-2xl border border-border bg-bg-2 p-4" data-testid="drip-simulator-panel">
      <h2 className="text-lg font-semibold">DRIP Simulator</h2>
      <div className="mt-3 grid gap-2">
        {checkpoints.map((year) => {
          const drip = withDrip[year - 1];
          const noDrip = withoutDrip[year - 1];
          return (
            <div key={year} className="text-sm text-textDim">
              {year}y: DRIP ${drip.monthly.toLocaleString()} / No-DRIP ${noDrip.monthly.toLocaleString()}
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-sm text-textBright">
        Freedom achieved {Math.max(0, freedomWithout - freedomWith)} years earlier with DRIP.
      </p>
    </div>
  );
}
