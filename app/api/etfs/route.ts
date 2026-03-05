import { NextResponse } from "next/server";
import { ETF_DB } from "@/lib/etf-db";

export async function GET() {
  return NextResponse.json({ items: ETF_DB });
}
