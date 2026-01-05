import MaxWidthWrapper from '@/components/max-width-wapper';
import Footer from '@/components/Footer';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

async function fetchAdminData() {
  try {
    const url = `${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/api/admin/dashboard`;
    console.log('[AdminPage] fetching admin dashboard from', url);
    const res = await fetch(url, { cache: 'no-store' });
    console.log('[AdminPage] admin dashboard response status', res.status);
    if (!res.ok) return null;
    const json = await res.json();
    console.log('[AdminPage] admin dashboard payload keys', Object.keys(json || {}));
    return json;
  } catch (e) {
    console.log('[AdminPage] fetchAdminData error', e);
    return null;
  }
}

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions as any);
  console.log('[AdminPage] session retrieved', { user: session?.user });

  if (!session || session.user?.role !== 'ADMIN') {
    console.log('[AdminPage] access denied - not admin or no session');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-8 bg-white rounded shadow">
          <h2 className="text-xl font-bold">Acceso denegado</h2>
          <p className="mt-2">Necesitas iniciar sesión como administrador para ver este panel.</p>
        </div>
      </div>
    );
  }

  const data = await fetchAdminData();
  console.log('[AdminPage] fetched data', { usersCount: data?.users?.length ?? 0 });

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-black text-white">
        <MaxWidthWrapper className="py-6 flex items-center justify-between">
          <h1 className="font-extrabold">Panel Admin</h1>
          <div>Bienvenido, {session.user?.name ?? session.user?.username}</div>
        </MaxWidthWrapper>
      </header>

      <main className="flex-1">
        <MaxWidthWrapper className="py-12">
          <h2 className="text-2xl font-bold">Resumen</h2>
          {!data ? (
            <p className="mt-4 text-gray-600">No se pudo cargar la información del dashboard.</p>
          ) : (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="p-4 border rounded">Total usuarios: {data.summary?.total ?? 0}</div>
              <div className="p-4 border rounded">Activos: {data.summary?.active ?? 0}</div>
              <div className="p-4 border rounded">Por vencer: {data.summary?.expiring ?? 0}</div>
              <div className="p-4 border rounded">Vencidos: {data.summary?.expired ?? 0}</div>
            </div>
          )}
        </MaxWidthWrapper>
      </main>

      <Footer />
    </div>
  );
}
