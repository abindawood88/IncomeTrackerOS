import clsx from "clsx";
import GlassCard from "./GlassCard";
import type { CSSProperties } from "react";

export default function MetricCard({
  label,
  val,
  sub,
  color,
  animIndex,
}: {
  label: string;
  val: string;
  sub?: string;
  color?: "gold" | "teal" | "purple";
  animIndex?: number;
}) {
  return (
    <GlassCard
      className={clsx(
        "transition duration-300 hover:-translate-y-0.5",
        animIndex ? "animate-fade-up" : "",
      )}
      style={{ animationDelay: animIndex ? `${animIndex * 50}ms` : undefined } as CSSProperties}
    >
      <div className="mb-2 text-xs uppercase tracking-wide text-textDim">{label}</div>
      <div
        className={clsx("text-2xl font-semibold", {
          "text-gold-light": color === "gold",
          "text-teal-light": color === "teal",
          "text-purple-light": color === "purple",
          "text-textBright": !color,
        })}
      >
        {val}
      </div>
      {sub ? <div className="mt-1 text-xs text-textDim">{sub}</div> : null}
    </GlassCard>
  );
}
