"use client";

export interface Step1State {
  goalMode: "income" | "expenses";
  targetIncome: number;
  targetExpense: number;
  coveragePct: number;
  capital: number;
  monthlyContribution: number;
}

export default function WizardStep1({
  value,
  onChange,
}: {
  value: Step1State;
  onChange: (next: Step1State) => void;
}) {
  return (
    <section className="space-y-4 rounded-2xl border border-border bg-bg-2 p-4">
      <h2 className="text-lg font-semibold text-textBright">Step 1: Define your freedom target</h2>
      <label className="block text-sm text-textDim">
        Goal type
        <select
          className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-textBright"
          value={value.goalMode}
          onChange={(e) => onChange({ ...value, goalMode: e.target.value as Step1State["goalMode"] })}
        >
          <option value="income">Manual monthly income target</option>
          <option value="expenses">Cover monthly expenses</option>
        </select>
      </label>
      {value.goalMode === "income" ? (
        <label className="block text-sm text-textDim">
          Target monthly income
          <input
            className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-textBright"
            type="number"
            min={0}
            value={value.targetIncome}
            onChange={(e) => onChange({ ...value, targetIncome: Number(e.target.value) || 0 })}
          />
        </label>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block text-sm text-textDim">
            Monthly expenses to cover
            <input
              className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-textBright"
              type="number"
              min={0}
              value={value.targetExpense}
              onChange={(e) => onChange({ ...value, targetExpense: Number(e.target.value) || 0 })}
            />
          </label>
          <label className="block text-sm text-textDim">
            Coverage %
            <input
              className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-textBright"
              type="number"
              min={0}
              max={100}
              value={value.coveragePct}
              onChange={(e) => onChange({ ...value, coveragePct: Number(e.target.value) || 0 })}
            />
          </label>
        </div>
      )}
      <label className="block text-sm text-textDim">
        Starting capital
        <input
          className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-textBright"
          type="number"
          min={0}
          value={value.capital}
          onChange={(e) => onChange({ ...value, capital: Number(e.target.value) || 0 })}
        />
      </label>
      <label className="block text-sm text-textDim">
        Monthly contribution
        <input
          className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-textBright"
          type="number"
          min={0}
          value={value.monthlyContribution}
          onChange={(e) => onChange({ ...value, monthlyContribution: Number(e.target.value) || 0 })}
        />
      </label>
      <div className="flex flex-wrap gap-2 text-xs">
        {[1000, 3000, 5000].map((preset) => (
          <button
            key={preset}
            type="button"
            className="rounded-full border border-border px-3 py-1 text-textDim"
            onClick={() =>
              onChange(
                value.goalMode === "income"
                  ? { ...value, targetIncome: preset }
                  : { ...value, targetExpense: preset },
              )
            }
          >
            ${preset.toLocaleString()}/mo
          </button>
        ))}
      </div>
    </section>
  );
}
