export default function WeeklyPaydayGrid({
  data,
}: {
  data: { label: string; amount: number }[];
}) {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      {data.map((w) => (
        <div key={w.label} className="rounded-xl border border-border bg-bg-2 p-4">
          <div className="text-xs text-textDim">{w.label}</div>
          <div className="mt-2 text-xl font-semibold text-teal-light">${w.amount.toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
}