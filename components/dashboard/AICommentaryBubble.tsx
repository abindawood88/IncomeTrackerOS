"use client";

import { useEffect, useState } from "react";
import FeatureGate from "@/components/ui/FeatureGate";

export default function AICommentaryBubble() {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    if (localStorage.getItem("ai_bubble_dismissed_until")) return;
    void fetch("/api/ai-commentary", { method: "POST" })
      .then(async (res) => res.json())
      .then((data: { ok: boolean; text?: string }) => {
        if (data.ok && data.text) setText(data.text);
      })
      .catch(() => undefined);
  }, []);

  if (!text) return null;

  return (
    <FeatureGate feature="ai_insights" title="AI commentary">
      <div className="rounded-xl border border-border bg-bg-2 p-3 text-sm" data-testid="ai-commentary-bubble">
        <div>{text}</div>
        <button
          className="mt-2 text-xs underline"
          onClick={() => {
            localStorage.setItem("ai_bubble_dismissed_until", String(Date.now() + 24 * 60 * 60 * 1000));
            setText(null);
          }}
        >
          Dismiss for 24h
        </button>
      </div>
    </FeatureGate>
  );
}
