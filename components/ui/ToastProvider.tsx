"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import Toast, { type ToastMessage } from "@/components/ui/Toast";

type ToastType = "success" | "error" | "warning" | "info";

type ToastContextType = {
  toast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setMessages((prev) => [...prev, { id, text: message, type }].slice(-3));
    setTimeout(() => {
      setMessages((prev) => prev.filter((item) => item.id !== id));
    }, 4000);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[100] flex w-80 max-w-[90vw] flex-col gap-2">
        {messages.map((message) => (
          <Toast key={message.id} message={message} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
