"use client";

export default function LivePreviewPane({ monthlyIncome, freedomScore, freedomDate }: { monthlyIncome: number; freedomScore: number; freedomDate: number | null; }) {
  return <div className="rounded-xl border border-border bg-bg-2 p-4"><div>Projected monthly income: ${Math.round(monthlyIncome).toLocaleString()}</div><div>Freedom Score: {freedomScore}%</div><div>Freedom Date: {freedomDate ?? "Not reachable within 30 years."}</div></div>;
}
