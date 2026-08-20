import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_SESSION_COOKIE, hasValidAdminSession } from '@/lib/admin-session';
import LiveFeedbackPanel from '@/components/LiveFeedbackPanel';

export default function AdminPage() {
  const session = cookies().get(ADMIN_SESSION_COOKIE)?.value;
  if (!hasValidAdminSession(session)) redirect('/login');

  return (
    <main className="app-shell min-h-screen p-5 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <p className="eyebrow text-xs uppercase tracking-widest text-red-400">Suara Fajar Deliksari</p>
            <h1 className="mt-2 text-3xl font-black italic sm:text-4xl">Administrator Panel</h1>
          </div>
          <form action="/api/auth/logout" method="post">
            <button className="button-danger px-5 py-3 text-sm font-bold bg-red-800/60 hover:bg-red-700 rounded-xl border border-red-500/30 transition" type="submit">Keluar</button>
          </form>
        </header>

        <section className="panel p-6 sm:p-8 border border-white/10 rounded-2xl bg-white/[0.03]">
          <div className="mb-6">
            <p className="eyebrow text-xs uppercase tracking-widest text-emerald-400">Status Sesi</p>
            <h2 className="mt-1 text-2xl font-bold italic">Panel Interaksi & Monitoring</h2>
            <p className="mt-1 text-sm text-white/70">Pantau permohonan doa jemaat dan statistik reaksi secara langsung (*realtime*).</p>
          </div>
          <LiveFeedbackPanel />
        </section>
      </div>
    </main>
  );
}
