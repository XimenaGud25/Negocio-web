"use client";

import { useState } from "react";

/* ===================== PLANES ===================== */
const PLANES = [
  {
    id: "reto-12",
    name: "RETO FITNESS 2da EDICIÓN",
    durationWeeks: 12,
    price: 1699,
  },
  {
    id: "despegue",
    name: "Despegue Saludable",
    durationWeeks: 6,
    price: 450,
  },
  {
    id: "acelerada",
    name: "Transformación acelerada",
    durationWeeks: 6,
    price: 1000,
  },
  {
    id: "fitness-vida",
    name: "Fitness para la vida",
    durationWeeks: 12,
    price: 2400,
  },
  {
    id: "integral",
    name: "Transformación integral",
    durationWeeks: 9,
    price: 1650,
  },
];

export default function CrearUsuarioPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  return (
    <section className="relative max-w-5xl mx-auto space-y-10 px-6">

      {/* Fondo con logo grande y difuminado (colocar /public/logo.png) */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          aria-hidden
          className="rounded-full filter blur-3xl"
          style={{
            width: 900,
            height: 900,
            backgroundImage: "url('/logo.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: 'translateY(-10%)',
            opacity: 0.04,
          }}
        />
      </div>

      {/* Capa oscura ligera para mejor contraste */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40" />

      <div className="relative z-10">
        {/* ===================== TÍTULO ===================== */}
        <header>
          <h1 className="text-3xl font-extrabold text-yellow-400">Crear usuario</h1>
          <p className="text-yellow-200 mt-2">
            Registra un nuevo usuario y asígnale un plan de entrenamiento.
          </p>
        </header>

        {/* ===================== FORMULARIO USUARIO ===================== */}
        <section className="bg-neutral-900/80 p-6 rounded-xl shadow-xl space-y-6 border border-yellow-700 mt-6">
          <h2 className="text-xl font-bold text-yellow-300">Datos del usuario</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1 text-yellow-200">
                Nombre completo
              </label>
              <input
                type="text"
                placeholder="Ej. Juan Pérez"
                className="w-full bg-neutral-800 text-black border border-yellow-800 rounded-lg px-4 py-2 placeholder-yellow-400 ring-1 ring-yellow-700/30 focus:ring-4 focus:ring-yellow-400/40 outline-none transition-shadow"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-yellow-200">
                Correo electrónico
              </label>
              <input
                type="email"
                placeholder="correo@email.com"
                className="w-full bg-neutral-800 text-black border border-yellow-800 rounded-lg px-4 py-2 placeholder-yellow-400 ring-1 ring-yellow-700/30 focus:ring-4 focus:ring-yellow-400/40 outline-none transition-shadow"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-yellow-200">
                Contraseña
              </label>
              <input
                type="password"
                placeholder="********"
                className="w-full bg-neutral-800 text-black border border-yellow-800 rounded-lg px-4 py-2 placeholder-yellow-400 ring-2 ring-yellow-600/40 focus:ring-4 focus:ring-yellow-400/50 outline-none transition-shadow"
              />
            </div>
          </div>
        </section>

        {/* ===================== SELECCIÓN DE PLAN ===================== */}
        <section className="bg-neutral-900/70 p-6 rounded-xl shadow-xl border border-yellow-700">
          <h2 className="text-xl font-bold mb-4 text-yellow-300">Seleccionar plan</h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PLANES.map((plan) => {
              const isSelected = selectedPlan === plan.id;

              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`border rounded-xl p-4 text-left transition flex flex-col justify-between h-full
                    ${isSelected ? 'border-yellow-400 bg-yellow-900/10' : 'border-yellow-800/30 hover:border-yellow-500'}`}
                >
                  <div>
                    <h3 className="font-bold text-lg text-yellow-100">{plan.name}</h3>
                    <p className="text-sm text-yellow-200 mt-1">Duración: {plan.durationWeeks} semanas</p>
                  </div>

                  <div className="mt-4">
                    <p className="mt-2 font-semibold text-yellow-400">${plan.price}</p>
                    {isSelected && (
                      <p className="mt-3 text-sm font-bold text-yellow-300">✓ Plan seleccionado</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ===================== ARCHIVOS ===================== */}
        <section className="bg-neutral-900/70 p-6 rounded-xl shadow-xl space-y-4 border border-yellow-700">
          <h2 className="text-xl font-bold text-yellow-300">Archivos del plan</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1 text-yellow-200">PDF de alimentación</label>
              <label htmlFor="file-alimentacion" className="inline-flex items-center gap-2 bg-yellow-400 text-black px-3 py-1.5 rounded-full text-sm font-medium hover:bg-yellow-500 transition cursor-pointer border border-yellow-600/20 border-dotted">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="7 10 12 5 17 10" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="leading-none">Subir</span>
              </label>
              <input id="file-alimentacion" type="file" className="sr-only" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-yellow-200">PDF de entrenamiento</label>
              <label htmlFor="file-entrenamiento" className="inline-flex items-center gap-2 bg-yellow-400 text-black px-3 py-1.5 rounded-full text-sm font-medium hover:bg-yellow-500 transition cursor-pointer border border-yellow-600/20 border-dotted">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="7 10 12 5 17 10" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="leading-none">Subir</span>
              </label>
              <input id="file-entrenamiento" type="file" className="sr-only" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-yellow-200">Foto inicial del usuario</label>
              <label htmlFor="file-foto" className="inline-flex items-center gap-2 bg-yellow-400 text-black px-3 py-1.5 rounded-full text-sm font-medium hover:bg-yellow-500 transition cursor-pointer border border-yellow-600/20 border-dotted">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="7 10 12 5 17 10" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="leading-none">Subir</span>
              </label>
              <input id="file-foto" type="file" className="sr-only" />
            </div>
          </div>
        </section>

        {/* ===================== COMENTARIOS ===================== */}
        <section className="bg-neutral-900/70 p-6 rounded-xl shadow-xl border border-yellow-700">
          <h2 className="text-xl font-bold mb-3 text-yellow-300">Comentarios</h2>
          <textarea
            rows={4}
            placeholder="Observaciones, recomendaciones iniciales..."
            className="w-full bg-neutral-800 text-black border border-yellow-800 rounded-lg px-4 py-2 placeholder-yellow-400"
          />
        </section>

        {/* ===================== ACCIÓN ===================== */}
        <div className="flex justify-end">
          <button className="bg-yellow-400 text-black px-8 py-3 rounded-xl font-bold hover:bg-yellow-500 transition">
            Crear usuario
          </button>
        </div>
      </div>
    </section>
  );
}
