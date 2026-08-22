import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_SESSION_COOKIE, hasValidAdminSession } from '@/lib/admin-session';
import LiveFeedbackPanel from '@/components/LiveFeedbackPanel';
import BroadcasterStudio from '@/components/BroadcasterStudio';
import LiveListenerCounter from '@/components/LiveListenerCounter';
import Link from 'next/link';

export default function AdminPage() {
  const session = cookies().get(ADMIN_SESSION_COOKIE)?.value;
  if (!hasValidAdminSession(session)) redirect('/login');

  const roomName = process.env.NEXT_PUBLIC_ROOM_NAME || 'suara-fajar-deliksari';

  return (
    <main className="min-h-screen pb-12">
      {/* ── Admin Header ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0c080a]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-amber-950 font-serif font-black text-xl shadow-lg shadow-amber-500/20">
              🎙️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-serif font-bold text-white leading-tight">
                  Studio Operator & Admin
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ON-DUTY
                </span>
              </div>
              <p className="text-[11px] font-sans font-medium text-amber-200/70">
                Suara Fajar Deliksari · GIA Deliksari
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LiveListenerCounter />
            <Link
              href="/"
              target="_blank"
              className="text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-xl border border-white/10 hover:border-white/20 transition-colors hidden sm:inline-flex items-center gap-1.5"
            >
              <span>Lihat Halaman Jemaat</span>
              <span className="text-[10px]">↗</span>
            </Link>
            <form action="/api/auth/logout" method="post">
              <button
                type="submit"
                className="dawn-btn-danger text-xs py-1.5 px-3 rounded-xl"
              >
                Keluar
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* ── Studio & Moderation Workspace ────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* Studio Broadcaster Mic Panel */}
        <section aria-label="Studio Siaran Langsung">
          <BroadcasterStudio roomName={roomName} />
        </section>

        {/* Live Feedback & Prayer Moderation */}
        <section aria-label="Monitoring Doa & Reaksi">
          <LiveFeedbackPanel />
        </section>
      </div>
    </main>
  );
}
