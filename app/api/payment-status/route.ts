import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get('reference') ?? '';

  if (!reference) {
    return NextResponse.json(
      { status: 'missing-reference' },
      { status: 400 }
    );
  }

  try {
    const { verifyPaymentRequest } = await import('../../../lib/payment');
    const result = await verifyPaymentRequest(reference);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
