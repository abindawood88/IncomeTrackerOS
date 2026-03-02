import ProgressBar from "../ui/ProgressBar";

export default function MilestoneStack({
  milestones,
}: {
  milestones: { id: string; label: string; target: number; icon: string; pct: number; reached: boolean }[];
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-border bg-bg-2 p-4">
      {milestones.map((m) => (
        <div key={m.id} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-textBright">
              {m.icon} {m.label}
            </span>
            <span className="text-textDim">
              ${Math.round(m.target).toLocaleString()} {m.reached ? "✓" : ""}
            </span>
          </div>
          <ProgressBar value={m.pct} color={m.reached ? "teal" : "gold"} animated />
        </div>
      ))}
    </div>
  );
}