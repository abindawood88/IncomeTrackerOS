import clsx from "clsx";

function toPoints(data: number[], width: number, height: number): string {
  if (data.length === 0) return "";
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  return data
    .map((n, i) => {
      const x = (i / Math.max(1, data.length - 1)) * width;
      const y = height - ((n - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");
}

export default function Sparkline({
  data,
  width = 72,
  height = 24,
}: {
  data: number[];
  width?: number;
  height?: number;
}) {
  const first = data[0] ?? 0;
  const last = data[data.length - 1] ?? 0;
  const trend = last > first ? "up" : last < first ? "down" : "flat";
  const stroke = trend === "up" ? "#00d4be" : trend === "down" ? "#e05252" : "#c8ddf0";

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        points={toPoints(data, width, height)}
        className={clsx(data.length ? "opacity-100" : "opacity-30")}
      />
    </svg>
  );
}