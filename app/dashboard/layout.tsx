"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import BottomTabBar from "@/components/layout/BottomTabBar";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import { loadTier } from "@/lib/subscription/loadTier";
import { useDFPStore } from "@/lib/store";
import { useSync } from "@/lib/sync";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { userId } = useAuth();
  const setTier = useDFPStore((s) => s.setTier);
  useSync();

  useEffect(() => {
    if (!userId) return;
    void loadTier(userId).then((tier) => {
      setTier(tier);
    });
  }, [userId, setTier]);

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen bg-bg">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          <main className="flex-1 p-4 pb-20 md:p-6">{children}</main>
        </div>
        <BottomTabBar />
      </div>
    </ErrorBoundary>
  );
}
