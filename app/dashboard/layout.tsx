"use client";

import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import { useSync } from "@/lib/sync";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  useSync();

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen bg-bg">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </ErrorBoundary>
  );
}
