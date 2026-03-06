import { NextResponse } from 'next/server';
import { validateProjectionInputs } from '@/lib/domain/projections/validate';

export async function POST(req: Request) {
  const body = await req.json();
  const { errors } = validateProjectionInputs(body);
  if (errors.length) return NextResponse.json({ errors }, { status: 400 });
  const { project } = await import('@/lib/engine');
  const rows = project(body);
  return NextResponse.json({ data: rows });
}
