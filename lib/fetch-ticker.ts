import type { ETFRecord } from "./types";

export type PayFrequency = "weekly" | "monthly" | "quarterly" | "annual";

export function sanitizeTicker(raw: string): string | null {
  const ticker = raw.trim().toUpperCase();
  if (!/^[A-Z0-9]{1,6}$/.test(ticker)) return null;
  return ticker;
}

export function parsePercentString(value: string | null): number | null {
  if (!value) return null;
  const n = Number(value.replace("%", "").trim());
  if (!Number.isFinite(n)) return null;
  return n / 100;
}

export function mapPayoutFrequency(raw: string | null): PayFrequency {
  if (!raw) return "quarterly";
  const v = raw.toLowerCase();
  if (v.includes("week")) return "weekly";
  if (v.includes("month")) return "monthly";
  if (v.includes("annual") || v.includes("year")) return "annual";
  return "quarterly";
}

export function unescapeHtml(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export type ExtractedTickerData = {
  price: number;
  yield: number;
  cagr: number;
  payFreq: PayFrequency;
  name: string;
};

export function extractTickerDataFromHtml(
  html: string,
  ticker: string,
  dbRecord?: ETFRecord,
): ExtractedTickerData | null {
  const quoteMatch = html.match(/quote:\{[^}]*\bc:([0-9]+(?:\.[0-9]+)?)/);
  const fallbackQuoteMatch = html.match(/quote:\{[^}]*\bp:([0-9]+(?:\.[0-9]+)?)/);
  const price = quoteMatch ? Number(quoteMatch[1]) : fallbackQuoteMatch ? Number(fallbackQuoteMatch[1]) : null;
  if (!price || price <= 0) return null;

  const yieldMatch = html.match(/dividendYield:"([0-9.]+)%"/);
  const yld = parsePercentString(yieldMatch?.[1] ?? null) ?? dbRecord?.yield ?? 0;
  const cagr = dbRecord?.cagr ?? 0;
  const freqMatch = html.match(/payoutFrequency:"([^"]+)"/);
  const payFreq = mapPayoutFrequency(freqMatch?.[1] ?? null) ?? dbRecord?.payFreq ?? "quarterly";
  const nameMatch = html.match(/"@type":"InvestmentFund","name":"([^"]+)"/);
  const name = (nameMatch ? unescapeHtml(nameMatch[1]) : dbRecord?.name) ?? ticker;

  return {
    price,
    yield: yld,
    cagr,
    payFreq,
    name,
  };
}
