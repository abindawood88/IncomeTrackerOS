import clsx from "clsx";

export default function ProgressBar({
  value,
  color = "teal",
  height = 8,
  animated = true,
}: {
  value: number;
  color?: "teal" | "gold" | "purple" | "danger";
  height?: number;
  animated?: boolean;
}) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="w-full rounded-full bg-bg-3" style={{ height }}>
      <div
        className={clsx("h-full rounded-full", {
          "bg-teal": color === "teal",
          "bg-gold": color === "gold",
          "bg-purple": color === "purple",
          "bg-danger": color === "danger",
          "transition-all duration-500": animated,
        })}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}