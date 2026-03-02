import { NextRequest, NextResponse } from "next/server";
import { ETF_DB } from "@/lib/etf-db";

type PayFrequency = "weekly" | "monthly" | "quarterly" | "annual";

type LiveResult = {
  ticker: string;
  name: string;
  price: number;
  yield: number;
  cagr: number;
  payFreq: PayFrequency;
  source: "live" | "error";
  error?: string;
};

type RateBucket = {
  count: number;
  resetAt: number;
};

const RATE_LIMIT = {
  maxRequests: 10,
  windowMs: 60_000,
};

const rateBuckets = new Map<string, RateBucket>();

export const runtime = "nodejs";

function clientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(ip);

  if (!bucket || now >= bucket.resetAt) {
    rateBuckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT.windowMs });
    return true;
  }

  if (bucket.count >= RATE_LIMIT.maxRequests) {
    return false;
  }

  bucket.count += 1;
  rateBuckets.set(ip, bucket);
  return true;
}

function sanitizeTicker(raw: string): string | null {
  const ticker = raw.trim().toUpperCase();
  if (!/^[A-Z0-9]{1,6}$/.test(ticker)) return null;
  return ticker;
}

function parsePercentString(value: string | null): number | null {
  if (!value) return null;
  const n = Number(value.replace("%", "").trim());
  if (!Number.isFinite(n)) return null;
  return n / 100;
}

function mapPayoutFrequency(raw: string | null): PayFrequency {
  if (!raw) return "quarterly";
  const v = raw.toLowerCase();
  if (v.includes("week")) return "weekly";
  if (v.includes("month")) return "monthly";
  if (v.includes("annual") || v.includes("year")) return "annual";
  return "quarterly";
}

function unescapeHtml(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

async function fetchViaStockAnalysis(ticker: string): Promise<LiveResult | null> {
  const url = `https://stockanalysis.com/etf/${ticker.toLowerCase()}/`;
  const res = await fetch(url, {
    cache: "no-store",
    headers: {
      "user-agent": "Mozilla/5.0",
      accept: "text/html,application/xhtml+xml",
    },
  });
  if (!res.ok) return null;

  const html = await res.text();
  const quoteMatch = html.match(/quote:\{[^}]*\bc:([0-9]+(?:\.[0-9]+)?)/);
  const fallbackQuoteMatch = html.match(/quote:\{[^}]*\bp:([0-9]+(?:\.[0-9]+)?)/);
  const price = quoteMatch ? Number(quoteMatch[1]) : fallbackQuoteMatch ? Number(fallbackQuoteMatch[1]) : null;
  if (!price || price <= 0) return null;

  const db = ETF_DB[ticker];
  const yieldMatch = html.match(/dividendYield:"([0-9.]+)%"/);
  const yld = parsePercentString(yieldMatch?.[1] ?? null) ?? db?.yield ?? 0;
  const cagr = db?.cagr ?? 0;
  const freqMatch = html.match(/payoutFrequency:"([^"]+)"/);
  const payFreq = mapPayoutFrequency(freqMatch?.[1] ?? null) ?? db?.payFreq ?? "quarterly";
  const nameMatch = html.match(/"@type":"InvestmentFund","name":"([^"]+)"/);
  const name = (nameMatch ? unescapeHtml(nameMatch[1]) : db?.name) ?? ticker;

  return {
    ticker,
    name,
    price,
    yield: yld,
    cagr,
    payFreq,
    source: "live",
  };
}

async function fetchTickerResult(ticker: string): Promise<LiveResult> {
  try {
    const fromStockAnalysis = await fetchViaStockAnalysis(ticker);
    if (fromStockAnalysis) return fromStockAnalysis;

    const db = ETF_DB[ticker];
    if (db) {
      return {
        ticker,
        name: db.name,
        price: db.price,
        yield: db.yield,
        cagr: db.cagr ?? 0,
        payFreq: db.payFreq,
        source: "live",
      };
    }

    return { ticker, name: ticker, price: 0, yield: 0, cagr: 0, payFreq: "quarterly", source: "error", error: "All sources failed" };
  } catch {
    return { ticker, name: ticker, price: 0, yield: 0, cagr: 0, payFreq: "quarterly", source: "error", error: "All sources failed" };
  }
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { tickers } = body as { tickers?: unknown };

  if (!Array.isArray(tickers) || tickers.length < 1 || tickers.length > 20) {
    return NextResponse.json({ error: "tickers must be an array of 1-20 strings" }, { status: 400 });
  }

  const normalizedTickers: string[] = [];
  for (const rawTicker of tickers) {
    if (typeof rawTicker !== "string") {
      return NextResponse.json({ error: "tickers must contain only strings" }, { status: 400 });
    }
    const sanitized = sanitizeTicker(rawTicker);
    if (!sanitized) {
      return NextResponse.json({ error: `Invalid ticker: ${rawTicker}` }, { status: 400 });
    }
    normalizedTickers.push(sanitized);
  }

  const settled = await Promise.allSettled(
    normalizedTickers.map((ticker) => fetchTickerResult(ticker)),
  );

  const results = settled.map((item, index): LiveResult => {
    const ticker = normalizedTickers[index];
    if (item.status === "fulfilled") return item.value;
    return {
      ticker,
      name: ticker,
      price: 0,
      yield: 0,
      cagr: 0,
      payFreq: "quarterly",
      source: "error",
      error: "All sources failed",
    };
  });

  return NextResponse.json({ results });
}
