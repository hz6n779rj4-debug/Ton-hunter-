import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const reference = searchParams.get('reference');

  if (!reference) {
    return NextResponse.json(
      { ok: false, error: 'Missing reference' },
      { status: 400 }
    );
  }

  return NextResponse.json({
    ok: true,
    status: 'pending',
    reference,
  });
}
