"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDFPStore } from "@/lib/store";

const TITLES: Record<string, string> = {
  "/dashboard/overview": "Overview",
  "/dashboard/portfolio": "Portfolio",
  "/dashboard/rebalance": "Rebalance",
  "/dashboard/calendar": "Payday Calendar",
  "/dashboard/scenarios": "Scenario Lab",
  "/dashboard/projections": "Projections",
};

export default function TopBar() {
  const pathname = usePathname();
  const holdings = useDFPStore((s) => s.holdings);
  const title = TITLES[pathname] ?? "Dashboard";
  const live = holdings.some((h) => h.fetchStatus === "ok");

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-bg-1/80 px-4 py-3 backdrop-blur-glass">
      <h1 className="text-xl font-semibold text-textBright">{title}</h1>
      <div className="flex items-center gap-3">
        <span className={`rounded-full border px-3 py-1 text-xs ${live ? "border-teal/40 bg-teal-dim text-teal-light" : "border-gold/40 bg-gold-dim text-gold-light"}`}>
          {live ? "StockAnalysis live" : "offline"}
        </span>
        <Link href="/onboard" className="rounded-lg border border-border bg-bg-2 px-3 py-1 text-sm text-textDim hover:text-textBright">
          Settings
        </Link>
      </div>
    </header>
  );
}
