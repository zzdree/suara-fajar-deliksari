import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_SESSION_COOKIE, hasValidAdminSession } from '@/lib/admin-session';
import AdminWorkspace from '@/components/AdminWorkspace';

export default function AdminPage() {
  const session = cookies().get(ADMIN_SESSION_COOKIE)?.value;
  if (!hasValidAdminSession(session)) redirect('/login');

  return <AdminWorkspace />;
}
