import { sparklineTrend } from "@/lib/engine";
import Sparkline from "../ui/Sparkline";

export default function SparklineCell({ data }: { data: number[] }) {
  const trend = sparklineTrend(data);
  return (
    <div className="flex items-center gap-2">
      <Sparkline data={data} width={90} height={28} />
      <span className="text-xs uppercase text-textDim">{trend}</span>
    </div>
  );
}