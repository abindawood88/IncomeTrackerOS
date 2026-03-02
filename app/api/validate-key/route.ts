import { NextRequest, NextResponse } from "next/server";

type ValidateResponse = {
  valid: boolean;
  testTicker: "SCHD";
  price?: number;
};

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    // StockAnalysis connectivity check (no API key required).
    const url = "https://stockanalysis.com/etf/schd/";
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      const fail: ValidateResponse = { valid: false, testTicker: "SCHD" };
      return NextResponse.json(fail);
    }

    const html = await res.text();
    const quoteMatch = html.match(/quote:\{[^}]*\bc:([0-9]+(?:\.[0-9]+)?)/);
    const price = quoteMatch ? Number(quoteMatch[1]) : null;

    if (typeof price === "number" && Number.isFinite(price) && price > 0) {
      const ok: ValidateResponse = { valid: true, testTicker: "SCHD", price };
      return NextResponse.json(ok);
    }

    const fail: ValidateResponse = { valid: false, testTicker: "SCHD" };
    return NextResponse.json(fail);
  } catch {
    const fail: ValidateResponse = { valid: false, testTicker: "SCHD" };
    return NextResponse.json(fail);
  }
}
