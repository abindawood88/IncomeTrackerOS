"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useDFPStore } from "@/lib/store";
import { STORAGE_KEYS } from "@/lib/utils";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard/overview",      label: "Dashboard",    icon: "⌂" },
      { href: "/dashboard/portfolio",     label: "Portfolio",    icon: "◈" },
      { href: "/dashboard/rebalance",     label: "Rebalance",    icon: "⇄" },
      { href: "/dashboard/tracker",       label: "Tracker",      icon: "◎" },
    ],
  },
  {
    label: "Income",
    items: [
      { href: "/dashboard/yield-tracker", label: "Yield",        icon: "%" },
      { href: "/dashboard/calendar",      label: "Calendar",     icon: "▦" },
    ],
  },
  {
    label: "Tools",
    items: [
      { href: "/dashboard/etfs",          label: "ETF Browser",  icon: "≡" },
      { href: "/dashboard/templates",     label: "Templates",    icon: "⊞" },
      { href: "/dashboard/projections",   label: "Projections",  icon: "↗" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const holdings = useDFPStore((s) => s.holdings);
  const strategy = useDFPStore((s) => s.goal.strategy);
  const monthlyIncome = useDFPStore((s) => {
    // Compute rough monthly income for sidebar badge
    return 0; // will be computed in derived metrics
  });

  useEffect(() => {
    const saved = window.localStorage.getItem("dfp_sidebar_collapsed");
    if (saved === "1") setCollapsed(true);
    if (window.innerWidth < 768) setCollapsed(true);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("dfp_sidebar_collapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  return (
    <aside
      className={`sticky top-0 h-screen border-r border-border bg-bg-1/85 p-3 backdrop-blur-glass transition-all ${
        collapsed ? "w-16" : "w-[220px]"
      }`}
    >
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        className="mb-4 w-full rounded-lg border border-border bg-bg-2 px-2 py-1 text-xs text-textDim"
      >
        {collapsed ? "›" : "Collapse"}
      </button>
      <nav className="space-y-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <div className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-textDim/60">
                {group.label}
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg border-l-2 px-3 py-2 text-sm transition ${
                      active
                        ? "border-gold bg-gold-dim text-gold-light"
                        : "border-transparent text-textDim hover:bg-bg-2"
                    }`}
                  >
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-border text-xs shrink-0">
                      {item.icon}
                    </span>
                    {!collapsed ? <span>{item.label}</span> : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-6 space-y-2 border-t border-border pt-4 text-xs">
        <div className="rounded-lg bg-bg-2 p-2 text-textDim">
          Live:{" "}
          <span className="text-teal-light">{holdings.filter((h) => h.fetchStatus === "ok").length}</span>
          {" / "}
          <span className="text-textBright">{holdings.length}</span>
        </div>
        <button
          type="button"
          onClick={() => window.localStorage.removeItem(STORAGE_KEYS.CACHE)}
          className="w-full rounded-lg border border-border px-2 py-1 text-textDim hover:text-textBright"
        >
          Clear cache
        </button>
        {!collapsed ? (
          <div className="rounded-lg bg-bg-2 p-2 text-gold-light uppercase tracking-wider">
            {strategy}
          </div>
        ) : null}
      </div>
    </aside>
  );
}
