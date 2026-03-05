import { NextResponse } from "next/server";
import etfs from "@/data/etfs.json";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").toLowerCase();
  const sort = url.searchParams.get("sort") ?? "ticker";

  let rows = etfs.filter((row) => row.ticker.toLowerCase().includes(q) || row.name.toLowerCase().includes(q));

  if (sort === "yield") {
    rows = [...rows].sort((a, b) => b.yield - a.yield);
  } else {
    rows = [...rows].sort((a, b) => a.ticker.localeCompare(b.ticker));
  }

  return NextResponse.json({ rows });
}
