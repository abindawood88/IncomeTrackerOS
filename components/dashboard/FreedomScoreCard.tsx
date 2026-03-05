"use client";

export default function FreedomScoreCard({
  score,
  freedomYear,
  targetMonthly,
  monthlyIncome,
}: {
  score: number;
  freedomYear: number | null;
  targetMonthly: number;
  monthlyIncome: number;
}) {
  const currentYear = new Date().getFullYear();
  const yearsRemaining = freedomYear ? Math.max(0, freedomYear - currentYear) : null;
  const gap = Math.max(0, targetMonthly - monthlyIncome);

  return (
    <div className="rounded-2xl border border-border bg-bg-2 p-4" data-testid="freedom-score-card">
      <h2 className="text-lg font-semibold text-textBright">Freedom Score</h2>
      <div className="mt-2 text-3xl font-bold text-gold">{score}%</div>
      <div className="mt-2 text-sm text-textDim">
        Freedom Date: {freedomYear ?? "Not reachable within 30 years."}
      </div>
      <div className="text-sm text-textDim">Years remaining: {yearsRemaining ?? "—"}</div>
      <div className="mt-2 text-sm text-textBright">
        Income ${Math.round(monthlyIncome).toLocaleString()} vs Expenses ${Math.round(targetMonthly).toLocaleString()} (Gap ${Math.round(gap).toLocaleString()})
      </div>
    </div>
  );
}
