import MetricCard from "../ui/MetricCard";
import FreedomYearDisplay from "./FreedomYearDisplay";

export default function KPIGrid({
  monthlyIncome,
  coverage,
  totalVal,
  score,
  strategy,
  bCagr,
  bYield,
  freedomYr,
  years,
}: {
  monthlyIncome: number;
  coverage: number;
  totalVal: number;
  score: number;
  strategy: string;
  bCagr: number;
  bYield: number;
  freedomYr: number | null;
  years: number;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      <MetricCard animIndex={1} label="Monthly Income" val={`$${monthlyIncome.toLocaleString()}`} color="teal" />
      <MetricCard animIndex={2} label="Coverage %" val={`${coverage}%`} color="gold" />
      <MetricCard animIndex={3} label="Portfolio Value" val={`$${Math.round(totalVal).toLocaleString()}`} color="teal" />
      <MetricCard animIndex={4} label="Risk Score" val={score.toFixed(1)} color="purple" />

      <MetricCard animIndex={5} label="Strategy" val={strategy.toUpperCase()} />
      <MetricCard animIndex={6} label="Blended CAGR" val={`${(bCagr * 100).toFixed(2)}%`} />
      <MetricCard animIndex={7} label="Blended Yield" val={`${(bYield * 100).toFixed(2)}%`} />
      <div style={{ animationDelay: "400ms" }} className="animate-fade-up">
        <FreedomYearDisplay year={freedomYr} years={years} />
      </div>
    </div>
  );
}