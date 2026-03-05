"use client";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: string;
  text: string;
  type: ToastType;
}

const toneByType: Record<ToastType, string> = {
  success: "border-teal/60 bg-teal-dim text-teal-light",
  error: "border-danger/60 bg-danger/10 text-danger",
  warning: "border-gold/60 bg-gold/10 text-gold-light",
  info: "border-border bg-bg-2 text-textBright",
};

export default function Toast({ message, leaving }: { message: ToastMessage; leaving: boolean }) {
  return (
    <div
      className={`rounded-lg border px-3 py-2 text-sm shadow-lg transition-all duration-300 ${toneByType[message.type]} ${
        leaving ? "translate-x-6 opacity-0" : "translate-x-0 opacity-100"
      }`}
      role="status"
      aria-live="polite"
    >
      {message.text}
    </div>
  );
}
