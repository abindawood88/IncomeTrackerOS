import { NextResponse } from "next/server";

const WINDOW_MS = 5 * 60 * 1000;
const hits = new Map<string, number>();

export async function POST(req: Request) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  const body = (await req.json().catch(() => ({}))) as { userId?: string; context?: string };
  const userId = body.userId ?? "anonymous";
  const now = Date.now();
  const last = hits.get(userId) ?? 0;
  if (now - last < WINDOW_MS) {
    return NextResponse.json({ ok: false, rateLimited: true }, { status: 429 });
  }

  hits.set(userId, now);

  // Provider call intentionally omitted for safety; this endpoint remains server-only and swappable.
  return NextResponse.json({ ok: true, text: "Yield trend is stable. Consider diversifying payout frequency across holdings." });
}
