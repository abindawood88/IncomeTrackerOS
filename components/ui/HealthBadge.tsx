import clsx from "clsx";

const HEALTH_STYLES = {
  CRITICAL: "border-danger/40 bg-danger/15 text-danger",
  WARNING: "border-gold/40 bg-gold-dim text-gold-light",
  STABLE: "border-teal/40 bg-teal-dim text-teal-light",
  NEUTRAL: "border-border bg-bg-3 text-textDim",
} as const;

export default function HealthBadge({
  health,
}: {
  health: "CRITICAL" | "WARNING" | "STABLE" | "NEUTRAL";
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold",
        HEALTH_STYLES[health],
      )}
    >
      {health}
    </span>
  );
}