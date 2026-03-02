export default function FrequencyBreakdown({
  weekly,
  monthly,
  quarterly,
  annual,
}: {
  weekly: number;
  monthly: number;
  quarterly: number;
  annual: number;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      <div className="rounded-xl border border-border bg-bg-2 p-4">
        <div className="text-xs text-textDim">Weekly Payers</div>
        <div className="text-2xl text-teal-light">{weekly}</div>
      </div>
      <div className="rounded-xl border border-border bg-bg-2 p-4">
        <div className="text-xs text-textDim">Monthly Payers</div>
        <div className="text-2xl text-gold-light">{monthly}</div>
      </div>
      <div className="rounded-xl border border-border bg-bg-2 p-4">
        <div className="text-xs text-textDim">Quarterly Payers</div>
        <div className="text-2xl text-purple-light">{quarterly}</div>
      </div>
      <div className="rounded-xl border border-border bg-bg-2 p-4">
        <div className="text-xs text-textDim">Annual Payers</div>
        <div className="text-2xl text-textBright">{annual}</div>
      </div>
    </div>
  );
}
