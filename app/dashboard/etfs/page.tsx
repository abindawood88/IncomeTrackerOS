"use client";

import EtfScreener from "@/components/screener/EtfScreener";

export default function EtfBrowserPage() {
  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-semibold text-textBright">ETF Browser</h1>
      <EtfScreener />
    </main>
  );
}
