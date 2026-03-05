"use client";

export type PortfolioInputMode = "preset" | "manual";

export default function WizardStep3({
  mode,
  selectedProfileSummary,
  manualHoldings,
  manualValidCount,
  manualErrors,
  manualWarnings,
  onModeChange,
  onManualHoldingsChange,
}: {
  mode: PortfolioInputMode;
  selectedProfileSummary: { title: string; etfs: string[] } | null;
  manualHoldings: string;
  manualValidCount: number;
  manualErrors: string[];
  manualWarnings: string[];
  onModeChange: (value: PortfolioInputMode) => void;
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
        <div className="rounded-xl border border-gold/40 bg-gold/5 p-3">
          <div className="mb-1 text-xs text-textDim">Selected profile from Step 2</div>
          <div className="font-semibold text-textBright">
            {selectedProfileSummary?.title ?? "No profile selected"}
          </div>
          {selectedProfileSummary ? (
            <div className="mt-2 flex flex-wrap gap-1 text-xs text-textDim">
              {selectedProfileSummary.etfs.map((etf) => (
                <span key={etf} className="rounded-full border border-border px-2 py-0.5">
                  {etf}
                </span>
              ))}
            </div>
          ) : null}
          <div className="mt-2 text-xs text-textDim">These ETFs will be added to your portfolio.</div>
        </div>
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
