import type { EnrichedHolding, RawHolding } from '../../types';
import { ETF_DB } from '../../etf-db';
import { getHealth } from '../../engine';

export function enrichHolding(
  raw: RawHolding,
  liveCache: Record<string, { data: { price: number; yield: number; cagr: number; name: string; payFreq: string } }>,
  totalPortfolioValue: number,
): EnrichedHolding & { marketValue: number; costBasis: number; gainLoss: number; gainLossPct: number; weight: number } {
  const db = ETF_DB[raw.ticker];
  const live = liveCache[raw.ticker]?.data;
  const price = raw.manualPriceOverride ?? live?.price ?? db?.price ?? 0;
  const yld = live?.yield ?? db?.yield ?? 0;
  const cagr = raw.cagrOvr ?? live?.cagr ?? db?.cagr ?? null;
  const name = live?.name ?? db?.name ?? raw.ticker;
  const payFreq = (live?.payFreq ?? db?.payFreq ?? 'quarterly') as EnrichedHolding['payFreq'];
  const leveraged = db?.leveraged ?? false;
  const sparkline = db?.sparkline ?? [];
  const health = getHealth(yld, cagr);

  const value = raw.shares * price;
  const costBasis = raw.shares * raw.avgCost;
  const gainLoss = value - costBasis;
  const gainLossPct = costBasis > 0 ? gainLoss / costBasis : 0;
  const weight = totalPortfolioValue > 0 ? value / totalPortfolioValue : 0;

  return {
    ticker: raw.ticker,
    shares: raw.shares,
    avgCost: raw.avgCost,
    price,
    value,
    yld,
    cagr,
    src: live ? 'live' : db ? 'local' : 'manual',
    payFreq,
    sparkline,
    health,
    leveraged,
    name,
    marketValue: value,
    costBasis,
    gainLoss,
    gainLossPct,
    weight,
  };
}
