'use client';

import { useEffect, useState } from 'react';
import AudioReceiver from '@/components/AudioReceiver';
import PrayerSection from '@/components/PrayerSection';
import ReactionButtons from '@/components/ReactionButtons';
import ScheduleCard from '@/components/ScheduleCard';
import LiveListenerCounter from '@/components/LiveListenerCounter';
import Link from 'next/link';

export default function AudiencePage() {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Generate LiveKit token for audience listener
    const generateToken = async () => {
      try {
        const roomName = process.env.NEXT_PUBLIC_ROOM_NAME || 'suara-fajar-deliksari';
        const participantName = `listener-${Math.random().toString(36).substring(7)}`;

        const response = await fetch(
          `/api/livekit?room=${roomName}&name=${participantName}&operator=false`
        );

        if (!response.ok) throw new Error('Failed to get token');

        const data = await response.json();
        setToken(data.token);
      } catch (error) {
        console.error('Error generating token:', error);
      } finally {
        setIsLoading(false);
      }
    };

    generateToken();
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* ── Top Header Navigation ─────────────────────────────────── */}
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0c080a]/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-amber-950 font-serif font-black text-xl shadow-lg shadow-amber-500/20">
              ✝
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-serif font-bold text-white leading-tight">
                Suara Fajar Deliksari
              </h1>
              <p className="text-[11px] font-sans font-medium text-amber-200/70">
                Gereja Isa Almasih Deliksari Semarang
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LiveListenerCounter />
            <Link
              href="/login"
              className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg border border-white/5 hover:border-white/10 transition-colors"
            >
              Studio
            </Link>
          </div>
        </div>
      </header>

      {/* ── Main Content Container ─────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex-1 w-full space-y-8">
        {/* Hero Audio Player */}
        <section aria-label="Pemutar Audio Live">
          {isLoading ? (
            <div className="glass-panel p-12 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-r-transparent mb-3" />
              <p className="text-sm font-medium text-slate-300">Menghubungkan ke pemancar audio...</p>
            </div>
          ) : token ? (
            <AudioReceiver
              token={token}
              serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL || ''}
            />
          ) : (
            <div className="glass-panel p-8 text-center border-rose-500/30">
              <p className="text-rose-400 font-semibold mb-2">Gagal Menghubungkan ke Live Stream</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Silakan muat ulang halaman atau periksa koneksi internet Anda.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="dawn-btn-secondary mt-4 text-xs py-2 px-4"
              >
                Muat Ulang
              </button>
            </div>
          )}
        </section>

        {/* Community Interactive Grid */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left: Prayer Wall & Request (7 cols on desktop) */}
          <div className="md:col-span-7">
            <PrayerSection />
          </div>

          {/* Right: Reactions & Schedule (5 cols on desktop) */}
          <div className="md:col-span-5 space-y-6">
            <ReactionButtons />
            <ScheduleCard />
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="w-full border-t border-white/10 py-6 mt-12 bg-black/40 text-center">
        <div className="max-w-5xl mx-auto px-4">
          <p className="text-xs text-slate-400">
            © 2026 <strong>GIA Deliksari Semarang</strong> · Multimedia & Broadcast Ministry
          </p>
          <p className="text-[11px] text-amber-200/60 mt-1 italic font-serif">
            &ldquo;Sebab di mana dua atau tiga orang berkumpul dalam Nama-Ku, di situ Aku ada di tengah-tengah mereka.&rdquo; — Matius 18:20
          </p>
        </div>
      </footer>
    </div>
  );
}
