"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { isCacheValid, makeCacheEntry } from "./engine";
import type { CacheEntry, LiveData } from "./types";
import { STORAGE_KEYS, normalizeTicker } from "./utils";

function readLocalStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeLocalStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // No-op: storage can fail in private mode or quota limits.
  }
}

function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => readLocalStorage(key, initialValue));
  const latest = useRef({ key, value });

  useEffect(() => {
    latest.current = { key, value };
  }, [key, value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      writeLocalStorage(key, value);
    }, 300);
    return () => clearTimeout(timer);
  }, [key, value]);

  useEffect(
    () => () => {
      writeLocalStorage(latest.current.key, latest.current.value);
    },
    [],
  );

  return [value, setValue] as const;
}

export function useLiveCache() {
  const [cache, setCache] = useLocalStorage<Record<string, CacheEntry<LiveData>>>(
    STORAGE_KEYS.CACHE,
    {},
  );

  const get = useCallback(
    (ticker: string): LiveData | null => {
      const entry = cache[normalizeTicker(ticker)] ?? null;
      return isCacheValid(entry) ? (entry.data as LiveData) : null;
    },
    [cache],
  );

  const set = useCallback(
    (ticker: string, data: LiveData) =>
      setCache((prev) => ({
        ...prev,
        [normalizeTicker(ticker)]: makeCacheEntry(data),
      })),
    [setCache],
  );

  const clear = useCallback(() => setCache({}), [setCache]);

  const count = useMemo(
    () => Object.values(cache).filter((entry) => isCacheValid(entry)).length,
    [cache],
  );

  return { get, set, clear, count };
}
