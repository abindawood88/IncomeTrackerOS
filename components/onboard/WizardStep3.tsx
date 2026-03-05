"use client";

export type PortfolioInputMode = "preset" | "manual";

export type PresetPortfolioKey =
  | "income-core"
  | "balanced-growth"
  | "high-yield"
  | "covered-call";

const PRESET_LABELS: Record<PresetPortfolioKey, string> = {
  "income-core": "Income Core (SCHD, DGRO, VYM)",
  "balanced-growth": "Balanced Growth (VTI, VOO, SCHD)",
  "high-yield": "High Yield (JEPI, JEPQ, QYLD)",
  "covered-call": "Covered Call Focus (JEPI, JEPQ, XYLD)",
};

export default function WizardStep3({
  mode,
  preset,
  manualHoldings,
  manualValidCount,
  manualErrors,
  manualWarnings,
  onModeChange,
  onPresetChange,
  onManualHoldingsChange,
}: {
  mode: PortfolioInputMode;
  preset: PresetPortfolioKey;
  manualHoldings: string;
  manualValidCount: number;
  manualErrors: string[];
  manualWarnings: string[];
  onModeChange: (value: PortfolioInputMode) => void;
  onPresetChange: (value: PresetPortfolioKey) => void;
  onManualHoldingsChange: (value: string) => void;
}) {
  return (
    <section className="space-y-4 rounded-2xl border border-border bg-bg-2 p-4">
      <h2 className="text-lg font-semibold text-textBright">Step 3: Portfolio setup</h2>
      <label className="block text-sm text-textDim">
        Portfolio input
        <select
          className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-textBright"
          value={mode}
          onChange={(e) => onModeChange(e.target.value as PortfolioInputMode)}
        >
          <option value="preset">Use a pre-selected portfolio</option>
          <option value="manual">Enter my current holdings</option>
        </select>
      </label>
      {mode === "preset" && (
        <label className="block text-sm text-textDim">
          Pick a pre-selected portfolio
          <select
            className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-textBright"
            value={preset}
            onChange={(e) => onPresetChange(e.target.value as PresetPortfolioKey)}
          >
            {Object.entries(PRESET_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
      )}
      {mode === "manual" && (
        <div className="space-y-2">
          <label className="block text-sm text-textDim">
            Enter holdings (one per line): TICKER,SHARES[,AVG_COST]
            <textarea
              className="mt-1 h-40 w-full rounded-lg border border-border bg-bg px-3 py-2 font-mono text-sm text-textBright"
              value={manualHoldings}
              onChange={(e) => onManualHoldingsChange(e.target.value)}
              placeholder={"SCHD,120,78\nVTI,45,240\nJEPI,60"}
            />
          </label>
          <div className="text-xs text-textDim">{manualValidCount} valid holding(s) parsed</div>
          {manualWarnings.length > 0 ? (
            <ul className="space-y-1 text-xs text-gold-light">
              {manualWarnings.map((warning, idx) => (
                <li key={`${warning}-${idx}`}>• {warning}</li>
              ))}
            </ul>
          ) : null}
          {manualErrors.length > 0 ? (
            <ul className="space-y-1 text-xs text-danger">
              {manualErrors.map((error, idx) => (
                <li key={`${error}-${idx}`}>• {error}</li>
              ))}
            </ul>
          ) : null}
        </div>
      )}
    </section>
  );
}
