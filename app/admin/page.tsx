import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_SESSION_COOKIE, hasValidAdminSession } from '@/lib/admin-session';

export default function AdminPage() {
  const session = cookies().get(ADMIN_SESSION_COOKIE)?.value;
  if (!hasValidAdminSession(session)) redirect('/login');

  return (
    <main className="app-shell min-h-screen p-5 sm:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <p className="eyebrow">Suara Fajar Deliksari</p>
            <h1 className="mt-2 text-3xl font-black italic sm:text-4xl">administrator panel</h1>
          </div>
          <form action="/api/auth/logout" method="post">
            <button className="button-danger px-5 py-3 text-sm font-bold" type="submit">Keluar</button>
          </form>
        </header>

        <section className="panel p-6 sm:p-8">
          <p className="eyebrow">Fase 1</p>
          <h2 className="mt-3 text-2xl font-bold italic">Login aman siap</h2>
          <p className="mt-3 max-w-2xl text-white/[.67]">Sesi administrator aktif. Kontrol siaran, feedback realtime, dan media dibangun pada tahap berikutnya.</p>
        </section>
      </div>
    </main>
  );
}
