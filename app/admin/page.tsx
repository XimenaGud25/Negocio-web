"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Estado = "todos" | "ACTIVE" | "EXPIRING" | "EXPIRED";

interface User {
  id: string;
  name: string;
  email: string | null;
  username: string;
  phone: string | null;
  enrollment: {
    status: "ACTIVE" | "EXPIRING" | "EXPIRED";
    planName: string;
    endDate: string;
    daysRemaining: number | null;
  } | null;
}

interface Stats {
  total: number;
  active: number;
  expiring: number;
  expired: number;
}

export default function AdminInicioPage() {
  const [filtro, setFiltro] = useState<Estado>("todos");
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    active: 0,
    expiring: 0,
    expired: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/stats"),
      ]);

      if (usersRes.ok && statsRes.ok) {
        const usersData = await usersRes.json();
        const statsData = await statsRes.json();
        setUsers(usersData);
        setStats(statsData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const usuariosFiltrados =
    filtro === "todos"
      ? users
      : users.filter((u) => u.enrollment?.status === filtro);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Cargando...</p>
      </div>
    );
  }

  return (
    <section className="space-y-10">

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">
            Dashboard
          </h1>
          <p className="text-gray-600">
            Estado general de los usuarios
          </p>
        </div>
        <Link
          href="/admin/usuarios/crear"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
        >
          + Nuevo Usuario
        </Link>
      </div>

      {/* TARJETAS */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">

        <Card
          title="Total usuarios"
          value={stats.total}
          icon="👥"
          active={filtro === "todos"}
          color="gray"
          onClick={() => setFiltro("todos")}
        />

        <Card
          title="Activos"
          value={stats.active}
          icon="✅"
          active={filtro === "ACTIVE"}
          color="green"
          onClick={() => setFiltro("ACTIVE")}
        />

        <Card
          title="Por vencer"
          value={stats.expiring}
          icon="⏳"
          active={filtro === "EXPIRING"}
          color="yellow"
          onClick={() => setFiltro("EXPIRING")}
        />

        <Card
          title="Vencidos"
          value={stats.expired}
          icon="⚠️"
          active={filtro === "EXPIRED"}
          color="red"
          onClick={() => setFiltro("EXPIRED")}
        />

      </div>

      {/* LISTA */}
      <section className="bg-white rounded-xl shadow p-6 space-y-4">
        <h2 className="text-xl font-bold text-black">
          {filtro === "todos"
            ? "Todos los usuarios"
            : filtro === "ACTIVE"
            ? "Usuarios activos"
            : filtro === "EXPIRING"
            ? "Usuarios por vencer"
            : "Usuarios vencidos"}
        </h2>

        {usuariosFiltrados.length === 0 ? (
          <p className="text-gray-500">
            No hay usuarios en este estado.
          </p>
        ) : (
          <ul className="divide-y">
            {usuariosFiltrados.map((usuario) => (
              <li
                key={usuario.id}
                className="py-3 flex justify-between items-center hover:bg-gray-50 px-4 rounded transition"
              >
                <div>
                  <span className="font-medium text-gray-800 block">
                    {usuario.name}
                  </span>
                  <span className="text-sm text-gray-500">
                    {usuario.username}
                    {usuario.enrollment &&
                      ` • ${usuario.enrollment.planName}`}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {usuario.enrollment && (
                    <span
                      className={`px-3 py-1 text-sm font-bold rounded-full ${
                        usuario.enrollment.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : usuario.enrollment.status === "EXPIRING"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {usuario.enrollment.status === "ACTIVE"
                        ? "Activo"
                        : usuario.enrollment.status === "EXPIRING"
                        ? "Por vencer"
                        : "Vencido"}
                    </span>
                  )}
                  <Link
                    href={`/admin/usuarios/${usuario.id}`}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Ver detalles
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

    </section>
  );
}

/* ================= CARD ================= */

function Card({
  title,
  value,
  icon,
  color,
  active,
  onClick,
}: {
  title: string;
  value: number;
  icon: string;
  color: "gray" | "green" | "yellow" | "red";
  active: boolean;
  onClick: () => void;
}) {
  const colors = {
    gray: "border-gray-400 ring-gray-300",
    green: "border-green-500 ring-green-300",
    yellow: "border-yellow-400 ring-yellow-300",
    red: "border-red-500 ring-red-300",
  };

  return (
    <button
      onClick={onClick}
      className={`
        bg-white text-black border-l-8 ${colors[color]}
        rounded-2xl p-8 shadow-lg
        transition-transform transform
        hover:-translate-y-1 hover:shadow-2xl
        ${active ? "ring-4 scale-105" : ""}
      `}
    >
      <div className="flex items-center justify-between">
        <span className="text-5xl text-black">{icon}</span>
        <span className="text-5xl md:text-6xl font-extrabold text-black leading-none">
          {value}
        </span>
      </div>

      <p className="mt-4 text-black font-semibold text-sm md:text-base">
        {title}
      </p>
    </button>
  );
}
