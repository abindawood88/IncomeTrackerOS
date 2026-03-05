"use client";

type ToastType = "success" | "error" | "warning" | "info";

export type ToastMessage = {
  id: string;
  text: string;
  type: ToastType;
};

const toneMap: Record<ToastType, string> = {
  success: "border-teal/50 bg-teal-dim text-teal-light",
  error: "border-danger/50 bg-danger/20 text-danger",
  warning: "border-gold/50 bg-gold-dim text-gold-light",
  info: "border-border bg-bg-2 text-textBright",
};

export default function Toast({ message }: { message: ToastMessage }) {
  return (
    <div
      data-testid={`toast-${message.type}`}
      className={`animate-toast-in rounded-lg border px-4 py-3 text-sm shadow-lg ${toneMap[message.type]}`}
    >
      {message.text}
    </div>
  );
}
