"use client";

import { findFreedomYear, project } from "@/lib/engine";

function getMonthlyAt(rows: Array<{ year: number; monthly: number }>, year: number): number {
  return rows.find((row) => row.year === year)?.monthly ?? 0;
}

export default function DRIPSimulatorPanel({
  capital,
  monthly,
  cagr,
  yld,
  years,
  target,
}: {
  capital: number;
  monthly: number;
  cagr: number;
  yld: number;
  years: number;
  target: number;
}) {
  const withDrip = project({ capital, monthly, cagr, yld, drip: true, years });
  const withoutDrip = project({ capital, monthly, cagr, yld, drip: false, years });

  const checkpoints = [5, 10, 20, 30].map((year) => {
    const withValue = getMonthlyAt(withDrip, year);
    const withoutValue = getMonthlyAt(withoutDrip, year);
    return { year, withValue, withoutValue, delta: withValue - withoutValue };
  });

  const freedomWithDrip = findFreedomYear(withDrip, target);
  const freedomWithoutDrip = findFreedomYear(withoutDrip, target);
  const yearsEarlier =
    freedomWithDrip && freedomWithoutDrip ? Math.max(0, freedomWithoutDrip - freedomWithDrip) : null;

  return (
    <section className="rounded-2xl border border-border bg-bg-2 p-4" data-testid="drip-simulator-panel">
      <h2 className="text-lg font-semibold text-textBright">DRIP Simulator</h2>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead className="text-left text-xs uppercase text-textDim">
            <tr>
              <th className="py-2">Year</th>
              <th className="py-2">With DRIP</th>
              <th className="py-2">Without DRIP</th>
              <th className="py-2">Delta</th>
            </tr>
          </thead>
          <tbody>
            {checkpoints.map((row) => (
              <tr key={row.year} className="border-t border-border">
                <td className="py-2">{row.year}</td>
                <td className="py-2">${Math.round(row.withValue).toLocaleString()}</td>
                <td className="py-2">${Math.round(row.withoutValue).toLocaleString()}</td>
                <td className="py-2 text-teal-light">+${Math.round(row.delta).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm text-textDim">
        {yearsEarlier !== null
          ? `Freedom achieved ${yearsEarlier} years earlier with DRIP.`
          : "Freedom timing delta is unavailable for the current assumptions."}
      </p>
    </section>
  );
}
