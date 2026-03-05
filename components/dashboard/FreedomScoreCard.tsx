"use client";

export default function FreedomScoreCard({
  freedomScore,
  freedomYear,
  yearsRemaining,
  income,
  expenses,
}: {
  freedomScore: number;
  freedomYear: number | null;
  yearsRemaining: number | null;
  income: number;
  expenses: number;
}) {
  const gap = Math.max(0, expenses - income);

  return (
    <section className="rounded-2xl border border-border bg-bg-2 p-4" data-testid="freedom-score-card">
      <h2 className="text-lg font-semibold text-textBright">Freedom Score</h2>
      <div className="mt-3 grid gap-2 text-sm">
        <div className="flex justify-between">
          <span className="text-textDim">Freedom Score (%)</span>
          <span className="font-semibold text-textBright">{freedomScore}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-textDim">Freedom Date</span>
          <span className="font-semibold text-textBright">
            {freedomYear ? `Year ${new Date().getFullYear() + freedomYear}` : "Not reachable within 30 years."}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-textDim">Years remaining</span>
          <span className="font-semibold text-textBright">{yearsRemaining ?? "N/A"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-textDim">Dividend income</span>
          <span className="font-semibold text-textBright">${Math.round(income).toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-textDim">Expenses</span>
          <span className="font-semibold text-textBright">${Math.round(expenses).toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-textDim">Gap</span>
          <span className="font-semibold text-textBright">${Math.round(gap).toLocaleString()}</span>
        </div>
      </div>
    </section>
  );
}
