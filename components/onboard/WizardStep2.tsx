"use client";

export type FreedomFocus = "growth" | "income";
export type PortfolioProfileKey =
  | "growth-regular"
  | "growth-mix"
  | "growth-leveraged"
  | "income-conservative"
  | "income-blend"
  | "income-highyield";

export type PortfolioProfileDef = {
  key: PortfolioProfileKey;
  focus: FreedomFocus;
  title: string;
  description: string;
  etfs: string[];
};

export const PROFILE_DEFS: PortfolioProfileDef[] = [
  {
    key: "growth-regular",
    focus: "growth",
    title: "Regular Growth",
    description: "4 core growth ETFs tracking different index families.",
    etfs: ["VOO", "QQQ", "IWF", "VUG"],
  },
  {
    key: "growth-mix",
    focus: "growth",
    title: "Growth Mix",
    description: "3 leveraged growth ETFs + 3 regular growth ETFs.",
    etfs: ["TQQQ", "UPRO", "SOXL", "VOO", "QQQ", "IWF"],
  },
  {
    key: "growth-leveraged",
    focus: "growth",
    title: "Leveraged Growth",
    description: "Only leveraged ETFs for max upside and volatility.",
    etfs: ["TQQQ", "UPRO", "SOXL"],
  },
  {
    key: "income-conservative",
    focus: "income",
    title: "Conservative Income",
    description: "Dividend quality and stability first.",
    etfs: ["SCHD", "DGRO", "HDV", "VYM"],
  },
  {
    key: "income-blend",
    focus: "income",
    title: "Income Blend",
    description: "Mix of high-yield ETFs and dividend-growth ETFs.",
    etfs: ["SCHD", "DGRO", "JEPI", "JEPQ", "VYM"],
  },
  {
    key: "income-highyield",
    focus: "income",
    title: "High Yield",
    description: "High yield from established dividend ETF issuers.",
    etfs: ["JEPI", "JEPQ", "SPYI", "QQQI", "XYLD"],
  },
];

const FOCUS_OPTIONS: Array<{ key: FreedomFocus; label: string; testId: string }> = [
  { key: "growth", label: "Growth", testId: "focus-card-growth" },
  { key: "income", label: "Income", testId: "focus-card-income" },
];

export function defaultProfileForFocus(focus: FreedomFocus): PortfolioProfileKey {
  return focus === "growth" ? "growth-regular" : "income-conservative";
}

export default function WizardStep2({
  focus,
  profile,
  onFocusChange,
  onProfileChange,
}: {
  focus: FreedomFocus;
  profile: PortfolioProfileKey;
  onFocusChange: (next: FreedomFocus) => void;
  onProfileChange: (next: PortfolioProfileKey) => void;
}) {
  const focusProfiles = PROFILE_DEFS.filter((item) => item.focus === focus);

  return (
    <section className="space-y-4 rounded-2xl border border-border bg-bg-2 p-4">
      <h2 className="text-lg font-semibold text-textBright">Step 2: Choose your freedom target</h2>

      <div className="grid gap-3 md:grid-cols-2">
        {FOCUS_OPTIONS.map((option) => (
          <button
            key={option.key}
            type="button"
            data-testid={option.testId}
            onClick={() => onFocusChange(option.key)}
            className={`rounded-xl border p-3 text-left ${
              focus === option.key ? "border-gold bg-gold/10" : "border-border"
            }`}
          >
            <div className="font-semibold text-textBright">{option.label}</div>
          </button>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {focusProfiles.map((card) => (
          <button
            key={card.key}
            type="button"
            data-testid={`profile-card-${card.key}`}
            onClick={() => onProfileChange(card.key)}
            className={`rounded-xl border p-3 text-left ${
              profile === card.key ? "border-gold bg-gold/10" : "border-border"
            }`}
          >
            <div className="font-semibold text-textBright">{card.title}</div>
            <div className="mt-1 text-xs text-textDim">{card.description}</div>
            <div className="mt-2 flex flex-wrap gap-1 text-xs text-textDim">
              {card.etfs.map((etf) => (
                <span key={etf} className="rounded-full border border-border px-2 py-0.5">
                  {etf}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
