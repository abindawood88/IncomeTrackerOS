"use client";

import { useEffect, useState } from "react";
import { useDFPStore } from "@/lib/store";

export function useHydrated(): boolean {
  const api = (useDFPStore as typeof useDFPStore & { persist?: any }).persist;
  const [hydrated, setHydrated] = useState(Boolean(api?.hasHydrated?.()));

  useEffect(() => {
    if (!api) {
      setHydrated(true);
      return;
    }

    const unsubHydrate = api.onHydrate?.(() => setHydrated(false));
    const unsubFinish = api.onFinishHydration?.(() => setHydrated(true));
    setHydrated(Boolean(api.hasHydrated?.()));

    return () => {
      unsubHydrate?.();
      unsubFinish?.();
    };
  }, [api]);

  return hydrated;
}
