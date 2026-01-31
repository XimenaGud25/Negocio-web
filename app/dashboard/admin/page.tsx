import MaxWidthWrapper from '@/components/max-width-wapper';
import Footer from '@/components/Footer';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import type { Session } from 'next-auth';

async function fetchAdminData() {
  try {
    const url = `${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/api/admin/stats`;
    console.log('[AdminPage] fetching admin stats from', url);
    const res = await fetch(url, { 
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    console.log('[AdminPage] admin stats response status', res.status);
    
    if (!res.ok) {
      console.error('[AdminPage] admin stats error:', res.status, res.statusText);
      return null;
    }
    
    const json = await res.json();
    console.log('[AdminPage] admin stats payload', json);
    
    // Transformar la respuesta para que coincida con el formato esperado
    return {
      summary: {
        total: json.total,
        active: json.active,
        expiring: json.expiring,
        expired: json.expired,
      }
    };
  } catch (e) {
    console.error('[AdminPage] fetchAdminData error', e);
    return null;
  }
}

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions as any) as Session | null;

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
  console.log('[AdminPage] fetched data', { totalUsers: data?.summary?.total ?? 0 });

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
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">No se pudo cargar la información del dashboard.</p>
              <p className="text-red-600 text-sm mt-2">
                Esto puede ocurrir si tu sesión expiró. Por favor, 
                <a href="/login" className="underline ml-1">inicia sesión nuevamente</a>.
              </p>
            </div>
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
