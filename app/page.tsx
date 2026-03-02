"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useHydrated } from "@/lib/use-hydrated";

export default function HomePage() {
  const hydrated = useHydrated();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    router.replace("/onboard");
  }, [hydrated, router]);

  if (!hydrated) return null;
  return null;
}
