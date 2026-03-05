"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/dashboard/overview", label: "Dashboard" },
  { href: "/dashboard/portfolio", label: "Portfolio" },
  { href: "/dashboard/projections", label: "Forecast" },
  { href: "/dashboard/calendar", label: "Calendar" },
];

export default function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-bg-1 px-2 py-2 md:hidden">
      <ul className="grid grid-cols-4 gap-1 text-center text-[11px]">
        {ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block rounded-md px-2 py-2 ${active ? "bg-gold-dim text-gold-light" : "text-textDim"}`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
