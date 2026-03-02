"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ProjectionRow } from "@/lib/types";
import GlassCard from "../ui/GlassCard";

export default function ProjectionChart({
  projData,
  target,
  color = "#00d4be",
}: {
  projData: ProjectionRow[];
  target: number;
  color?: string;
}) {
  return (
    <GlassCard className="h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={projData} margin={{ left: 6, right: 6, top: 10, bottom: 4 }}>
          <defs>
            <linearGradient id="projectionFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.35} />
              <stop offset="95%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
          <XAxis dataKey="year" tick={{ fill: "#c8ddf0", fontSize: 11 }} />
          <YAxis tick={{ fill: "#c8ddf0", fontSize: 11 }} />
          <Tooltip
            contentStyle={{ background: "#0f1a2e", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12 }}
            formatter={(value: number, name: string) => [
              `$${Number(value).toLocaleString()}`,
              name === "monthly" ? "Monthly income" : "Portfolio value",
            ]}
            labelFormatter={(label) => `Year ${label}`}
          />
          <ReferenceLine y={target} stroke="#f0c842" strokeDasharray="6 4" />
          <Area type="monotone" dataKey="monthly" stroke={color} fill="url(#projectionFill)" strokeWidth={2.5} />
        </AreaChart>
      </ResponsiveContainer>
    </GlassCard>
  );
}