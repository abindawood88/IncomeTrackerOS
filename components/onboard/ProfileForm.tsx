"use client";

import Toggle from "../ui/Toggle";
import type { UserGoal } from "@/lib/types";

export default function ProfileForm({
  goal,
  onChange,
}: {
  goal: UserGoal;
  onChange: (patch: Partial<UserGoal>) => void;
}) {
  const targetDisplay = goal.targetPeriod === "yearly" ? goal.targetIncome * 12 : goal.targetIncome;

  return (
    <div className="grid gap-3 rounded-2xl border border-border bg-bg-2 p-4 md:grid-cols-2">
      <label className="text-sm text-textDim">
        Target income
        <input
          data-testid="target-income"
          type="number"
          value={targetDisplay}
          onChange={(e) => {
            const raw = Number(e.target.value);
            const monthly = goal.targetPeriod === "yearly" ? raw / 12 : raw;
            onChange({ targetIncome: Math.max(0, monthly) });
          }}
          className="mt-1 w-full rounded-lg border border-border bg-bg-1 px-3 py-2 text-textBright"
        />
        <select
          value={goal.targetPeriod}
          onChange={(e) => onChange({ targetPeriod: e.target.value as UserGoal["targetPeriod"] })}
          className="mt-2 w-full rounded-lg border border-border bg-bg-1 px-3 py-2 text-textBright"
        >
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </label>
      <label className="text-sm text-textDim">
        Capital
        <input
          data-testid="capital"
          type="number"
          value={goal.capital}
          onChange={(e) => onChange({ capital: Number(e.target.value) })}
          className="mt-1 w-full rounded-lg border border-border bg-bg-1 px-3 py-2 text-textBright"
        />
      </label>
      <label className="text-sm text-textDim">
        Monthly contribution
        <input
          data-testid="monthly"
          type="number"
          value={goal.monthly}
          onChange={(e) => onChange({ monthly: Number(e.target.value) })}
          className="mt-1 w-full rounded-lg border border-border bg-bg-1 px-3 py-2 text-textBright"
        />
      </label>
      <label className="text-sm text-textDim">
        Years
        <input
          type="number"
          value={goal.years}
          onChange={(e) => onChange({ years: Number(e.target.value) })}
          className="mt-1 w-full rounded-lg border border-border bg-bg-1 px-3 py-2 text-textBright"
        />
      </label>
      <label className="text-sm text-textDim">
        Risk tolerance
        <select
          value={goal.riskTolerance}
          onChange={(e) => onChange({ riskTolerance: e.target.value as UserGoal["riskTolerance"] })}
          className="mt-1 w-full rounded-lg border border-border bg-bg-1 px-3 py-2 text-textBright"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </label>
      <div className="md:col-span-2">
        <Toggle checked={goal.drip} onChange={(next) => onChange({ drip: next })} label="Enable DRIP" />
      </div>
    </div>
  );
}
