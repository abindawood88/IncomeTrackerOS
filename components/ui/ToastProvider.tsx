"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import Toast, { type ToastMessage, type ToastType } from "@/components/ui/Toast";

type ToastContextShape = {
  toast: (text: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextShape | null>(null);
const DISMISS_MS = 4000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Array<ToastMessage & { leaving: boolean }>>([]);

  const toast = useCallback((text: string, type: ToastType = "info") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setItems((current) => [{ id, text, type, leaving: false }, ...current].slice(0, 3));

    setTimeout(() => {
      setItems((current) => current.map((item) => (item.id === id ? { ...item, leaving: true } : item)));
      setTimeout(() => {
        setItems((current) => current.filter((item) => item.id !== id));
      }, 320);
    }, DISMISS_MS);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(360px,90vw)] flex-col gap-2">
        {items.map((item) => (
          <Toast key={item.id} message={item} leaving={item.leaving} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToastContext(): ToastContextShape {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToastContext must be used inside ToastProvider");
  }
  return ctx;
}
