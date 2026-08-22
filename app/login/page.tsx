'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
        setError('PIN administrator tidak valid. Silakan periksa kembali.');
        setPin('');
        return;
      }

      router.replace('/admin');
      router.refresh();
    } catch {
      setError('Gagal menghubungkan ke server. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 relative">
      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Box */}
      <section className="glass-panel w-full max-w-md p-6 sm:p-8 relative z-10 border border-white/15">
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-white capitalize">
            login panel
          </h1>
          <p className="text-xs text-white/60 mt-1 font-sans">
            Suara Fajar Deliksari · GIA Deliksari Semarang
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-white/80 mb-2 text-center" htmlFor="pin">
              Masukkan PIN Akses
            </label>
            <input
              id="pin"
              name="pin"
              type="password"
              inputMode="numeric"
              maxLength={16}
              autoComplete="current-password"
              autoFocus
              required
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
              className="dawn-input text-center text-2xl tracking-[0.5em] py-3.5"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !pin.trim()}
            className="btn-gold w-full text-base py-3.5"
          >
            {isSubmitting ? 'Memeriksa...' : 'Masuk'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-white/10 text-center">
          <Link
            href="/"
            className="text-xs text-white/50 hover:text-amber-300 transition-colors"
          >
            ← Kembali ke Halaman Jemaat
          </Link>
        </div>
      </section>

      {/* Footer Credit */}
      <footer className="mt-8 text-center text-xs text-white/40">
        Multimedia GIA Deliksari Semarang · 2026
      </footer>
    </main>
  );
}
