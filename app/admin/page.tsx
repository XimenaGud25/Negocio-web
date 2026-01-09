"use client";

import { useState } from "react";

type Estado = "todos" | "activo" | "porVencer" | "vencido";

const usuariosMock = [
  { id: 1, nombre: "Ana López", estado: "activo" },
  { id: 2, nombre: "Carlos Pérez", estado: "porVencer" },
  { id: 3, nombre: "María Gómez", estado: "vencido" },
  { id: 4, nombre: "Luis Hernández", estado: "activo" },
  { id: 5, nombre: "Fernanda Ruiz", estado: "porVencer" },
];

export default function AdminInicioPage() {
  const [filtro, setFiltro] = useState<Estado>("todos");

  const resumen = {
    total: usuariosMock.length,
    activo: usuariosMock.filter(u => u.estado === "activo").length,
    porVencer: usuariosMock.filter(u => u.estado === "porVencer").length,
    vencido: usuariosMock.filter(u => u.estado === "vencido").length,
  };

  const usuariosFiltrados =
    filtro === "todos"
      ? usuariosMock
      : usuariosMock.filter(u => u.estado === filtro);

  return (
    <section className="space-y-10">

      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">
          Dashboard
        </h1>
        <p className="text-gray-600">
          Estado general de los usuarios
        </p>
      </div>

      {/* TARJETAS */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">

        <Card
          title="Total usuarios"
          value={resumen.total}
          icon="👥"
          active={filtro === "todos"}
          color="gray"
          onClick={() => setFiltro("todos")}
        />

        <Card
          title="Activos"
          value={resumen.activo}
          icon="✅"
          active={filtro === "activo"}
          color="green"
          onClick={() => setFiltro("activo")}
        />

        <Card
          title="Por vencer"
          value={resumen.porVencer}
          icon="⏳"
          active={filtro === "porVencer"}
          color="yellow"
          onClick={() => setFiltro("porVencer")}
        />

        <Card
          title="Vencidos"
          value={resumen.vencido}
          icon="⚠️"
          active={filtro === "vencido"}
          color="red"
          onClick={() => setFiltro("vencido")}
        />

      </div>

      {/* LISTA */}
      <section className="bg-white rounded-xl shadow p-6 space-y-4">
        <h2 className="text-xl font-bold text-black" style={{ color: '#000' }}>
          {filtro === "todos"
            ? "Todos los usuarios"
            : filtro === "activo"
            ? "Usuarios activos"
            : filtro === "porVencer"
            ? "Usuarios por vencer"
            : "Usuarios vencidos"}
        </h2>

        {usuariosFiltrados.length === 0 ? (
          <p className="text-gray-500">
            No hay usuarios en este estado.
          </p>
        ) : (
          <ul className="divide-y">
            {usuariosFiltrados.map(usuario => (
              <li
                key={usuario.id}
                className="py-3 flex justify-between items-center"
              >
                <span className="font-medium text-gray-800">
                  {usuario.nombre}
                </span>

                <span
                  className={`px-3 py-1 text-sm font-bold rounded-full ${
                    usuario.estado === "activo"
                      ? "bg-green-100 text-green-700"
                      : usuario.estado === "porVencer"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {usuario.estado === "activo"
                    ? "Activo"
                    : usuario.estado === "porVencer"
                    ? "Por vencer"
                    : "Vencido"}
                </span>
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
      style={{ color: '#000' }}
      className={`
        bg-white text-black border-l-8 ${colors[color]}
        rounded-2xl p-8 shadow-lg
        transition-transform transform
        hover:-translate-y-1 hover:shadow-2xl
        ${active ? "ring-6 scale-105" : ""}
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
