"use client";

import { useEffect, useState } from "react";
import FeatureGate from "@/components/ui/FeatureGate";

const DISMISS_KEY = "dfp_ai_bubble_dismiss_until";
const DISMISS_WINDOW_MS = 24 * 60 * 60 * 1000;

export default function AICommentaryBubble() {
  const [text, setText] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const dismissUntil = Number(window.localStorage.getItem(DISMISS_KEY) ?? 0);
    if (Date.now() < dismissUntil) {
      setHidden(true);
      return;
    }

    void (async () => {
      const res = await fetch("/api/ai-commentary", { method: "POST" });
      const data = (await res.json()) as { ok?: boolean; text?: string };
      if (data.ok && data.text) {
        setText(data.text);
      }
    })();
  }, []);

  if (hidden || !text) return null;

  return (
    <FeatureGate feature="ai_insights" title="AI Commentary">
      <section className="rounded-2xl border border-border bg-bg-2 p-4" data-testid="ai-commentary-bubble">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-textBright">AI Commentary</h3>
            <p className="mt-1 text-sm text-textDim">{text}</p>
          </div>
          <button
            type="button"
            className="text-xs text-textDim"
            onClick={() => {
              window.localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_WINDOW_MS));
              setHidden(true);
            }}
          >
            Dismiss
          </button>
        </div>
      </section>
    </FeatureGate>
  );
}
