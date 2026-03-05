import { NextResponse } from "next/server";

const limit = new Map<string, number>();

export async function POST(req: Request) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return NextResponse.json({ ok: false });

  const body = (await req.json().catch(() => ({}))) as { userId?: string };
  const userId = body.userId ?? "anon";
  const now = Date.now();
  const last = limit.get(userId) ?? 0;
  if (now - last < 5 * 60 * 1000) {
    return NextResponse.json({ ok: false });
  }
  limit.set(userId, now);
  return NextResponse.json({ ok: true, text: "Your income trajectory is improving steadily." });
}
