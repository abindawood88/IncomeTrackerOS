import { NextResponse } from 'next/server';
import { loadEtfRegistry } from '@/lib/etf-db';

export async function GET() {
  try {
    const etfs = loadEtfRegistry();
    return NextResponse.json({ data: etfs, source: 'local' });
  } catch {
    return NextResponse.json({ error: 'Failed to load ETF registry' }, { status: 500 });
  }
}
