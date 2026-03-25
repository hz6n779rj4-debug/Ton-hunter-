'use client';

import { useEffect, useState } from 'react';

export function PaymentWatcher({ reference, tokenAddress }: { reference: string; tokenAddress: string }) {
  const [message, setMessage] = useState('Waiting for payment confirmation...');
  const [paid, setPaid] = useState(false);
  const [loading, setLoading] = useState(false);

  const check = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/payment-status?reference=${encodeURIComponent(reference)}`, { cache: 'no-store' });
      const data = await response.json();
      if (data.status === 'paid') {
        setPaid(true);
        setMessage('Payment found. Your listing or promotion is now active. Redirecting...');
        setTimeout(() => {
          window.location.href = `/token/${tokenAddress}`;
        }, 1800);
      } else if (data.status === 'pending') {
        setMessage('Payment not found yet. Keep the memo exact and wait a few seconds, then the page will retry automatically.');
      } else if (data.status === 'error') {
        setMessage(data.message || 'Verification failed for now.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    check();
    const timer = setInterval(() => {
      check();
    }, 12000);
    return () => clearInterval(timer);
  }, [reference]);

  return <div className="mt-6 rounded-2xl border border-stroke/70 bg-slate-950/25 p-4">
    <div className="text-sm text-slate-300">{message}</div>
    <form action="#" onSubmit={(e) => { e.preventDefault(); void check(); }} className="mt-3">
      <button className="rounded-full border border-stroke px-4 py-2 text-sm hover:border-cyan-400/40" disabled={loading || paid}>{loading ? 'Checking...' : paid ? 'Confirmed' : 'Refresh status'}</button>
    </form>
  </div>;
}
