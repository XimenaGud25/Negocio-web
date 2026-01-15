"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  // Form fields
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    phone: "",
    role: "USER" as "USER" | "ADMIN",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      // Validaciones básicas
      if (!formData.name || !formData.username || !formData.password) {
        throw new Error("Nombre, usuario y contraseña son requeridos");
      }

      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          username: formData.username,
          password: formData.password,
          email: formData.email || null,
          phone: formData.phone || null,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al crear usuario");
      }

      setSuccess(true);
      
      // Resetear formulario
      setFormData({
        name: "",
        username: "",
        email: "",
        password: "",
        phone: "",
        role: "USER",
      });

      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push("/admin/usuario");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Error al crear usuario");
    } finally {
      setLoading(false);
    }
  };

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

        {/* Mensajes de éxito o error */}
        {success && (
          <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded-lg">
            ✅ Usuario creado exitosamente. Redirigiendo...
          </div>
        )}
        
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ===================== FORMULARIO USUARIO ===================== */}
          <section className="bg-neutral-900/80 p-6 rounded-xl shadow-xl space-y-6 border border-yellow-700 mt-6">
            <h2 className="text-xl font-bold text-yellow-300">Datos del usuario</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1 text-yellow-200">
                  Nombre completo <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Ej. Juan Pérez"
                  disabled={loading}
                  className="w-full bg-neutral-800 text-white border border-yellow-800 rounded-lg px-4 py-2 placeholder-yellow-600 ring-1 ring-yellow-700/30 focus:ring-4 focus:ring-yellow-400/40 outline-none transition-shadow disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-yellow-200">
                  Nombre de usuario <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  placeholder="usuario123"
                  disabled={loading}
                  className="w-full bg-neutral-800 text-white border border-yellow-800 rounded-lg px-4 py-2 placeholder-yellow-600 ring-1 ring-yellow-700/30 focus:ring-4 focus:ring-yellow-400/40 outline-none transition-shadow disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-yellow-200">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="correo@email.com"
                  disabled={loading}
                  className="w-full bg-neutral-800 text-white border border-yellow-800 rounded-lg px-4 py-2 placeholder-yellow-600 ring-1 ring-yellow-700/30 focus:ring-4 focus:ring-yellow-400/40 outline-none transition-shadow disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-yellow-200">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+52 123 456 7890"
                  disabled={loading}
                  className="w-full bg-neutral-800 text-white border border-yellow-800 rounded-lg px-4 py-2 placeholder-yellow-600 ring-1 ring-yellow-700/30 focus:ring-4 focus:ring-yellow-400/40 outline-none transition-shadow disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-yellow-200">
                  Contraseña <span className="text-red-400">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="********"
                  disabled={loading}
                  className="w-full bg-neutral-800 text-white border border-yellow-800 rounded-lg px-4 py-2 placeholder-yellow-600 ring-2 ring-yellow-600/40 focus:ring-4 focus:ring-yellow-400/50 outline-none transition-shadow disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-yellow-200">
                  Rol <span className="text-red-400">*</span>
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="w-full bg-neutral-800 text-white border border-yellow-800 rounded-lg px-4 py-2 ring-1 ring-yellow-700/30 focus:ring-4 focus:ring-yellow-400/40 outline-none transition-shadow disabled:opacity-50"
                >
                  <option value="USER">Usuario</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
            </div>
          </section>

          {/* ===================== SELECCIÓN DE PLAN ===================== */}
          <section className="bg-neutral-900/70 p-6 rounded-xl shadow-xl border border-yellow-700">
            <h2 className="text-xl font-bold mb-4 text-yellow-300">Seleccionar plan (opcional)</h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {PLANES.map((plan) => {
                const isSelected = selectedPlan === plan.id;

                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedPlan(plan.id)}
                    disabled={loading}
                    className={`border rounded-xl p-4 text-left transition flex flex-col justify-between h-full disabled:opacity-50
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
            <h2 className="text-xl font-bold text-yellow-300">Archivos del plan (próximamente)</h2>
            <p className="text-sm text-yellow-200">La funcionalidad de carga de archivos estará disponible próximamente.</p>

            <div className="grid md:grid-cols-2 gap-6 opacity-50">
              <div>
                <label className="block text-sm font-medium mb-1 text-yellow-200">PDF de alimentación</label>
                <label htmlFor="file-alimentacion" className="inline-flex items-center gap-2 bg-yellow-400 text-black px-3 py-1.5 rounded-full text-sm font-medium hover:bg-yellow-500 transition cursor-not-allowed border border-yellow-600/20 border-dotted">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round" />
                    <polyline points="7 10 12 5 17 10" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="leading-none">Subir</span>
                </label>
                <input id="file-alimentacion" type="file" className="sr-only" disabled />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-yellow-200">PDF de entrenamiento</label>
                <label htmlFor="file-entrenamiento" className="inline-flex items-center gap-2 bg-yellow-400 text-black px-3 py-1.5 rounded-full text-sm font-medium hover:bg-yellow-500 transition cursor-not-allowed border border-yellow-600/20 border-dotted">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round" />
                    <polyline points="7 10 12 5 17 10" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="leading-none">Subir</span>
                </label>
                <input id="file-entrenamiento" type="file" className="sr-only" disabled />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-yellow-200">Foto inicial del usuario</label>
                <label htmlFor="file-foto" className="inline-flex items-center gap-2 bg-yellow-400 text-black px-3 py-1.5 rounded-full text-sm font-medium hover:bg-yellow-500 transition cursor-not-allowed border border-yellow-600/20 border-dotted">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round" />
                    <polyline points="7 10 12 5 17 10" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="leading-none">Subir</span>
                </label>
                <input id="file-foto" type="file" className="sr-only" disabled />
              </div>
            </div>
          </section>

          {/* ===================== COMENTARIOS ===================== */}
          <section className="bg-neutral-900/70 p-6 rounded-xl shadow-xl border border-yellow-700">
            <h2 className="text-xl font-bold mb-3 text-yellow-300">Comentarios (próximamente)</h2>
            <textarea
              rows={4}
              placeholder="Observaciones, recomendaciones iniciales..."
              disabled={loading}
              className="w-full bg-neutral-800 text-white border border-yellow-800 rounded-lg px-4 py-2 placeholder-yellow-600 disabled:opacity-50"
            />
          </section>

          {/* ===================== ACCIÓN ===================== */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push("/admin/usuario")}
              disabled={loading}
              className="bg-neutral-700 text-white px-8 py-3 rounded-xl font-bold hover:bg-neutral-600 transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-yellow-400 text-black px-8 py-3 rounded-xl font-bold hover:bg-yellow-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creando..." : "Crear usuario"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
