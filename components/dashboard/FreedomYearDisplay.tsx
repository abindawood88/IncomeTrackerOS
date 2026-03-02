import MetricCard from "../ui/MetricCard";

export default function FreedomYearDisplay({
  year,
  years,
}: {
  year: number | null;
  years: number;
}) {
  return (
    <MetricCard
      label="Freedom Year"
      val={year ? String(year) : `Not reached`}
      sub={year ? "Target reached" : `Not reached in ${years} years`}
      color={year ? "gold" : undefined}
    />
  );
}