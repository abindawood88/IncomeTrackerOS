import { ETF_DB } from "./etf-db";
import { clamp, normalizeTicker } from "./utils";

export type CSVImportRow = {
  ticker: string;
  shares: number;
  avgCost: number;
};

export type CSVImportResult = {
  valid: CSVImportRow[];
  rejected: Array<{ row: number; raw: string; reason: string }>;
};

function splitCsvLine(line: string, delimiter: string): string[] {
  const cols: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === "\"") {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === delimiter && !inQuotes) {
      cols.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }

  cols.push(current.trim());
  return cols;
}

export function parseHoldingsCSV(csvText: string): CSVImportResult {
  const valid: CSVImportRow[] = [];
  const rejected: Array<{ row: number; raw: string; reason: string }> = [];
  const trimmed = csvText.trim();
  if (!trimmed) {
    return {
      valid: [],
      rejected: [{ row: 0, raw: csvText, reason: "No data rows found" }],
    };
  }
  const lines = trimmed.split(/\r?\n/);

  const delimiter = lines[0].includes("\t") ? "\t" : ",";
  const headers = splitCsvLine(lines[0], delimiter).map((header) =>
    header.trim().toLowerCase().replace(/[^a-z_]/g, ""),
  );

  const tickerIdx = headers.findIndex((header) => header === "ticker" || header === "symbol");
  const sharesIdx = headers.findIndex(
    (header) => header === "shares" || header === "quantity" || header === "qty",
  );
  const costIdx = headers.findIndex(
    (header) => header.includes("cost") || header.includes("price") || header === "avgcost",
  );

  if (tickerIdx < 0) {
    return {
      valid: [],
      rejected: [{ row: 0, raw: lines[0], reason: "No 'ticker' or 'symbol' column found" }],
    };
  }

  if (lines.length < 2) {
    return {
      valid: [],
      rejected: [{ row: 0, raw: csvText, reason: "No data rows found" }],
    };
  }

  for (let i = 1; i < lines.length; i += 1) {
    const raw = lines[i].trim();
    if (!raw) continue;

    const cols = splitCsvLine(raw, delimiter).map((col) => col.replace(/^"|"$/g, ""));
    const ticker = normalizeTicker(cols[tickerIdx] ?? "");
    if (!ticker) {
      rejected.push({ row: i, raw, reason: "Empty ticker" });
      continue;
    }

    const shares = sharesIdx >= 0 ? clamp(parseFloat(cols[sharesIdx] ?? "0"), 0, 1_000_000) : 0;
    const avgCost = costIdx >= 0 ? clamp(parseFloat(cols[costIdx] ?? "0"), 0, 100_000) : 0;

    if (shares <= 0) {
      rejected.push({ row: i, raw, reason: `Zero or invalid shares for ${ticker}` });
      continue;
    }

    valid.push({
      ticker,
      shares,
      avgCost: avgCost || (ETF_DB[ticker]?.price ?? 0),
    });
  }

  return { valid, rejected };
}
