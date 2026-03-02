"use client";

import { useMemo } from "react";

export default function AllocationEditor({
  allocs,
  setAllocs,
}: {
  allocs: { ticker: string; w: number }[];
  setAllocs: (allocs: { ticker: string; w: number }[]) => void;
}) {
  const total = useMemo(() => allocs.reduce((s, a) => s + a.w, 0), [allocs]);

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-bg-2 p-4">
      <table className="w-full text-sm">
        <thead className="text-left text-xs uppercase text-textDim">
          <tr>
            <th className="py-2">Ticker</th>
            <th className="py-2">Weight %</th>
            <th className="py-2">Est. Value</th>
            <th className="py-2">DB Yield</th>
            <th className="py-2">Delete</th>
          </tr>
        </thead>
        <tbody>
          {allocs.map((a, i) => (
            <tr key={`${a.ticker}-${i}`} className="border-t border-border">
              <td className="py-2">{a.ticker}</td>
              <td className="py-2">
                <input
                  type="number"
                  value={a.w}
                  onChange={(e) => {
                    const next = [...allocs];
                    next[i] = { ...next[i], w: Number(e.target.value) };
                    setAllocs(next);
                  }}
                  className="w-24 rounded border border-border bg-bg-1 px-2 py-1"
                />
              </td>
              <td className="py-2 text-textDim">-</td>
              <td className="py-2 text-textDim">-</td>
              <td className="py-2">
                <button
                  type="button"
                  onClick={() => setAllocs(allocs.filter((_, idx) => idx !== i))}
                  className="rounded border border-danger/30 px-2 py-1 text-danger"
                >
                  x
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setAllocs([...allocs, { ticker: "", w: 0 }])}
          className="rounded border border-border px-3 py-1 text-sm"
        >
          Add row
        </button>
        <div className={`text-sm ${Math.round(total) === 100 ? "text-teal-light" : "text-danger"}`}>Total: {total.toFixed(1)}%</div>
      </div>
    </div>
  );
}