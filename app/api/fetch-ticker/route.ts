import { NextRequest, NextResponse } from "next/server";
import { ETF_DB } from "@/lib/etf-db";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  extractTickerDataFromHtml,
  type PayFrequency,
  sanitizeTicker,
} from "@/lib/fetch-ticker";

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

const RATE_LIMIT = {
  limit: 10,
  windowMs: 60_000,
  prefix: "fetch-ticker",
};

const FETCH_TIMEOUT_MS = 6_000;
const MAX_ATTEMPTS = 2;

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

async function fetchWithTimeout(input: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

function shouldRetry(status: number): boolean {
  return status === 408 || status === 425 || status === 429 || (status >= 500 && status <= 599);
}

async function fetchViaStockAnalysis(ticker: string): Promise<LiveResult | null> {
  const url = `https://stockanalysis.com/etf/${ticker.toLowerCase()}/`;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const res = await fetchWithTimeout(
        url,
        {
          cache: "no-store",
          headers: {
            "user-agent": "Mozilla/5.0",
            accept: "text/html,application/xhtml+xml",
          },
        },
        FETCH_TIMEOUT_MS,
      );

      if (!res.ok) {
        if (attempt < MAX_ATTEMPTS && shouldRetry(res.status)) {
          continue;
        }
        return null;
      }

      const html = await res.text();
      const db = ETF_DB[ticker];
      const extracted = extractTickerDataFromHtml(html, ticker, db);
      if (!extracted) return null;

      return {
        ticker,
        ...extracted,
        source: "live",
      };
    } catch {
      if (attempt >= MAX_ATTEMPTS) {
        return null;
      }
    }
  }

  return null;
}

async function fetchTickerResult(ticker: string): Promise<LiveResult> {
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
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const limit = await checkRateLimit(ip, RATE_LIMIT);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded", resetAt: limit.resetAt }, { status: 429 });
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
    const raw = rawTicker.trim().toUpperCase();
    if (!/^[A-Z]{1,6}$/.test(raw)) {
      return NextResponse.json({ error: `Invalid ticker: ${rawTicker}` }, { status: 400 });
    }
    const sanitized = sanitizeTicker(raw);
    if (!sanitized) {
      return NextResponse.json({ error: `Invalid ticker: ${rawTicker}` }, { status: 400 });
    }
    normalizedTickers.push(sanitized);
  }

  const uniqueTickers = [...new Set(normalizedTickers)];
  const settled = await Promise.allSettled(uniqueTickers.map((ticker) => fetchTickerResult(ticker)));

  const uniqueResults = new Map<string, LiveResult>();
  settled.forEach((item, index) => {
    const ticker = uniqueTickers[index];
    if (item.status === "fulfilled") {
      uniqueResults.set(ticker, item.value);
      return;
    }

    uniqueResults.set(ticker, {
      ticker,
      name: ticker,
      price: 0,
      yield: 0,
      cagr: 0,
      payFreq: "quarterly",
      source: "error",
      error: "All sources failed",
    });
  });

  const results = normalizedTickers.map((ticker) => {
    const result = uniqueResults.get(ticker);
    return (
      result ?? {
        ticker,
        name: ticker,
        price: 0,
        yield: 0,
        cagr: 0,
        payFreq: "quarterly",
        source: "error",
        error: "All sources failed",
      }
    );
  });

  return NextResponse.json({ results });
}
