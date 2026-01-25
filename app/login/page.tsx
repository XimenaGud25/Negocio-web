"use client";

import Image from "next/image";
import { signIn } from "next-auth/react";
import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  // No verificar estado del servidor hasta que ocurra un error
  const router = useRouter();

  const handleRetry = () => {
    if (username && password) {
      setError("");
      setConnectionError(false);
      // Reintentar envío
      handleSubmit({ preventDefault: () => {} } as any);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setConnectionError(false);
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Verificar si es un error de conectividad
        if (result.error.includes("temporalmente no disponible") || 
            result.error.includes("Error de conexión") || 
            result.error.includes("Servicio temporalmente")) {
          setConnectionError(true);
        }
        setError(result.error);
      } else if (result?.ok) {
        // Obtener la sesión para verificar el rol
        const response = await fetch("/api/auth/session");
        const session = await response.json();
        
        if (session?.user?.role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/dashboard/client");
        }
      } else {
        setError("No se pudo iniciar sesión. Verifica tus credenciales.");
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setConnectionError(true);
      setError("Error de conexión. Por favor intenta más tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-5xl bg-[#0f0f0f] rounded-2xl shadow-2xl overflow-hidden grid md:grid-cols-2">

        {/* ===== FORMULARIO ===== */}
        <div className="flex flex-col justify-center px-8 py-14 text-white">
          <h1 className="text-3xl font-extrabold mb-2 text-yellow-400">
            Bienvenido
          </h1>

          <p className="text-gray-400 mb-10">
            Inicia sesión para consultar tu plan y tu progreso
          </p>

          {/* Estado del servidor: ahora solo mostramos errores al fallar el submit */}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Mensaje de error */}
            {error && (
              <div className="bg-red-500/20 border border-red-400 text-red-300 px-4 py-3 rounded-lg text-sm font-medium">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
                {connectionError && (
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="mt-2 text-xs text-blue-300 hover:text-blue-200 underline"
                  >
                    Intentar nuevamente
                  </button>
                )}
              </div>
            )}

            {/* Usuario */}
            <div>
              <label className="block text-sm mb-2">Usuario</label>
              <input
                type="text"
                placeholder="nombre de usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                required
                className="w-full px-4 py-3 rounded-lg bg-black border border-gray-700 text-white focus:outline-none focus:border-yellow-400 disabled:opacity-50"
              />
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm mb-2">Contraseña</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                className="w-full px-4 py-3 rounded-lg bg-black border border-gray-700 text-white focus:outline-none focus:border-yellow-400 disabled:opacity-50"
              />
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-400 text-black py-3 rounded-lg font-bold hover:bg-yellow-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </form>

          <p className="text-xs text-gray-500 mt-8">
            El acceso es otorgado por el entrenador según tu plan activo
          </p>
        </div>

        {/* ===== LOGO GRANDE ===== */}
        <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black p-10">
          <div className="text-center">
            <Image
              src="/logo.png"
              alt="Fitness Para La Vida"
              width={220}
              height={220}
              priority
            />
            <h2 className="mt-6 text-2xl font-extrabold text-white tracking-wide">
              FITNESS PARA LA VIDA
            </h2>
            <p className="text-gray-400 mt-2">
              Tu proceso, tu disciplina, tu transformación
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}
