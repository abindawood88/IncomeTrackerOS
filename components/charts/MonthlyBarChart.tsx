import GlassCard from "../ui/GlassCard";

export default function MonthlyBarChart({
  payments,
}: {
  payments: { mo: string; amount: number }[];
}) {
  const max = Math.max(...payments.map((p) => p.amount), 1);

  return (
    <GlassCard>
      <div className="grid grid-cols-12 gap-2">
        {payments.map((p, i) => {
          const h = Math.max(8, Math.round((p.amount / max) * 120));
          const quarterly = i % 3 === 2;
          return (
            <div key={p.mo} className="flex flex-col items-center gap-2">
              <div
                className={`w-full rounded-md ${quarterly ? "bg-gold" : "bg-teal"}`}
                style={{ height: `${h}px` }}
                title={`${p.mo}: $${p.amount.toLocaleString()}`}
              />
              <div className="text-[10px] text-textDim">{p.mo}</div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}