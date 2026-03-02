"use client";

import { useState } from "react";
import Spinner from "../ui/Spinner";

export default function FMPKeyPanel({
  value,
  onChange,
  compact = false,
}: {
  value: string;
  onChange: (next: string) => void;
  compact?: boolean;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function validateKey() {
    setStatus("loading");
    setMsg("");
    try {
      const res = await fetch("/api/validate-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fmpKey: value }),
      });
      const data = (await res.json()) as { valid?: boolean; price?: number };
      if (data.valid) {
        setStatus("ok");
        setMsg(`Valid key (SCHD $${(data.price ?? 0).toFixed(2)})`);
      } else {
        setStatus("error");
        setMsg("Invalid key. StockAnalysis fallback is active.");
      }
    } catch {
      setStatus("error");
      setMsg("Validation failed");
    }
  }

  return (
    <div className={`rounded-2xl border border-border bg-bg-2 p-4 ${compact ? "" : "space-y-3"}`}>
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter FMP API key"
          className="min-w-[220px] flex-1 rounded-lg border border-border bg-bg-1 px-3 py-2 text-sm text-textBright"
        />
        <button
          type="button"
          onClick={validateKey}
          className="rounded-lg bg-teal px-3 py-2 text-sm font-medium text-bg"
        >
          Validate
        </button>
        {status === "loading" ? <Spinner /> : null}
      </div>
      {msg ? <div className={`text-xs ${status === "ok" ? "text-teal-light" : "text-danger"}`}>{msg}</div> : null}
    </div>
  );
}
