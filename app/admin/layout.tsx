"use client";

import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-gray-100">

      {/* SIDEBAR */}
      <aside className="w-64 bg-black text-white hidden md:flex flex-col">
        
        {/* TÍTULO */}
        <div className="p-6 font-extrabold text-lg border-b border-gray-800">
          Admin Panel
        </div>

        {/* NAVEGACIÓN */}
        <nav className="flex-1 p-4 space-y-4">
          <Link
            href="/admin"
            className="block px-4 py-2 rounded hover:bg-gray-800"
          >
            Inicio
          </Link>

          <Link
            href="/admin/usuarios"
            className="block px-4 py-2 rounded hover:bg-gray-800"
          >
            Usuarios
          </Link>
          <Link
            href="/admin/usuario/crear"
            className="block px-4 py-2 rounded hover:bg-gray-800"
          >
            Crear usuario
          </Link>

          <Link
            href="/admin/planes"
            className="block px-4 py-2 rounded hover:bg-gray-800"
          >
            Planes
          </Link>
        </nav>

        {/* FOOTER SIDEBAR */}
        <div className="p-4 border-t border-gray-800">
          <Link
            href="/"
            className="text-sm text-gray-400 hover:text-yellow-400"
          >
            Volver al sitio
          </Link>
        </div>

      </aside>

      {/* CONTENIDO */}
      <main className="flex-1 p-6">
        {children}
      </main>

    </div>
  );
}
