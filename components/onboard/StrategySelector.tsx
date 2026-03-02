"use client";

import { useMemo } from "react";
import MetricCard from "../ui/MetricCard";
import type { Strategy } from "@/lib/types";

type Opt = {
  key: Strategy;
  label: string;
  cagr: number;
  yld: number;
  desc: string;
};

const OPTIONS: Opt[] = [
  { key: "income", label: "Income", cagr: 0.062, yld: 0.072, desc: "Higher yield, steadier growth." },
  { key: "growth", label: "Growth", cagr: 0.095, yld: 0.035, desc: "Lower yield, stronger CAGR." },
  { key: "hyper", label: "Hyper", cagr: 0.18, yld: 0.12, desc: "Aggressive hypothetical profile." },
];

export default function StrategySelector({
  value,
  onChange,
}: {
  value: Strategy;
  onChange: (next: Strategy) => void;
}) {
  const cards = useMemo(() => OPTIONS, []);
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {cards.map((opt, i) => (
        <button
          key={opt.key}
          data-testid={`strategy-${opt.key}`}
          type="button"
          onClick={() => onChange(opt.key)}
          className={`rounded-2xl border p-1 text-left ${value === opt.key ? "border-gold bg-gold-dim" : "border-border bg-bg-2"}`}
        >
          <MetricCard
            label={opt.label}
            val={`${(opt.yld * 100).toFixed(1)}% / ${(opt.cagr * 100).toFixed(1)}%`}
            sub={opt.desc}
            color={value === opt.key ? "gold" : "teal"}
            animIndex={i + 1}
          />
        </button>
      ))}
    </div>
  );
}