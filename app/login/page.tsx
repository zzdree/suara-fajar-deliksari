'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/login', {
        body: JSON.stringify({ pin }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });

      if (!response.ok) {
        setError('PIN tidak valid. Periksa lalu coba lagi.');
        setPin('');
        return;
      }

      router.replace('/admin');
      router.refresh();
    } catch {
      setError('Koneksi gagal. Coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="app-shell flex min-h-screen items-center justify-center p-5 sm:p-8">
      <section className="panel w-full max-w-xl p-6 sm:p-10" aria-labelledby="login-title">
        <p className="eyebrow">Suara Fajar Deliksari</p>
        <h1 id="login-title" className="mt-3 text-4xl font-black italic sm:text-5xl">login panel</h1>
        <p className="mt-3 text-sm text-white/[.67] sm:text-base">Gereja Isa Almasih Deliksari Semarang</p>

        <form className="mt-10 space-y-4" onSubmit={handleSubmit}>
          <label className="block" htmlFor="pin">
            <span className="mb-2 block text-sm font-semibold text-white/80">PIN administrator</span>
            <input
              autoComplete="current-password"
              autoFocus
              className="input-surface w-full px-5 py-4 text-center text-2xl tracking-[0.45em] outline-none"
              id="pin"
              inputMode="numeric"
              maxLength={32}
              name="pin"
              onChange={(event) => setPin(event.target.value)}
              required
              type="password"
              value={pin}
            />
          </label>
          {error && <p className="text-sm font-medium text-red-200" role="alert">{error}</p>}
          <button className="button-gold w-full px-5 py-4 text-lg font-bold" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Memeriksa...' : 'Masuk'}
          </button>
        </form>
      </section>
      <footer className="absolute bottom-5 text-center text-xs text-white/50">Multimedia GIA Deliksari Semarang · 2026</footer>
    </main>
  );
}
