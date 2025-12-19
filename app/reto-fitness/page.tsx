import Image from "next/image";

export default function RetoFitnessPage() {
  return (
    <main className="bg-black text-white">

      {/* ================= HERO ================= */}
      <section className="relative min-h-screen flex items-center justify-center bg-[url('/planes/avanzado.jpg')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/80"></div>

        <div className="relative z-10 text-center max-w-4xl px-6">
          <h1 className="text-5xl md:text-6xl font-extrabold text-yellow-400 mb-6">
            RETO FITNESS PARA LA VIDA
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Segunda edición · 12 semanas de transformación física y mental
          </p>
          <a
            href="/login"
            className="bg-yellow-400 text-black px-10 py-4 rounded-xl font-bold text-lg hover:bg-yellow-500 transition"
          >
            Inscribirme al reto
          </a>
        </div>
      </section>

      {/* ================= INFO GENERAL ================= */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-5xl mx-auto px-6 space-y-10">
          <h2 className="text-4xl font-bold text-yellow-400 text-center">
            Información general
          </h2>

          <ul className="text-lg text-gray-300 space-y-3">
            <li>• Duración total: <strong>12 semanas</strong></li>
            <li>• Inicio y cierre con evaluación corporal</li>
            <li>• Evaluaciones cada 15 días</li>
            <li>• Seguimiento personalizado durante todo el reto</li>
          </ul>
        </div>
      </section>

      {/* ================= QUÉ INCLUYE ================= */}
      <section className="py-24 bg-black">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16">
            ¿Qué incluye tu <span className="text-yellow-400">inscripción</span>?
          </h2>

          <div className="grid md:grid-cols-2 gap-12 text-gray-300 text-lg">
            <ul className="space-y-4">
              <li>✔ Plan de alimentación personalizado</li>
              <li>✔ Revisiones nutricionales cada 2 semanas</li>
              <li>✔ Plan de entrenamiento estructurado</li>
              <li>✔ Entrenamiento grupal 1 vez por semana</li>
            </ul>

            <ul className="space-y-4">
              <li>✔ Clases grupales de hipopresivos cada 2 semanas</li>
              <li>✔ Playera edición especial del reto</li>
              <li>✔ Acompañamiento y seguimiento constante</li>
              <li>✔ Comunidad de apoyo y motivación</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ================= EVALUACIONES ================= */}
      <section className="py-24 bg-gray-900">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-12">
            Evaluaciones y <span className="text-yellow-400">seguimiento</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-black p-8 rounded-2xl">
              <h3 className="text-yellow-400 font-bold mb-3">
                Evaluación corporal
              </h3>
              <p className="text-gray-400">
                Medición de grasa corporal, masa muscular y progreso físico
              </p>
            </div>

            <div className="bg-black p-8 rounded-2xl">
              <h3 className="text-yellow-400 font-bold mb-3">
                Comparativa visual
              </h3>
              <p className="text-gray-400">
                Fotos de inicio y cierre del reto
              </p>
            </div>

            <div className="bg-black p-8 rounded-2xl">
              <h3 className="text-yellow-400 font-bold mb-3">
                Constancia
              </h3>
              <p className="text-gray-400">
                Participación, compromiso y disciplina
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= PREMIACIÓN ================= */}
      <section className="py-24 bg-black">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12">
            Premiación
          </h2>

          <ul className="text-gray-300 text-lg space-y-4">
            <li>🏆 Kit de suplementación</li>
            <li>🏆 Reembolso de inscripción</li>
            <li>🏆 Masaje relajante</li>
            <li>🏆 Mes de entrenamiento personalizado</li>
          </ul>
        </div>
      </section>

      {/* ================= REGLAS ================= */}
      <section className="py-24 bg-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-yellow-400 text-center mb-12">
            Reglas importantes
          </h2>

          <ul className="text-gray-300 text-lg space-y-3">
            <li>• El participante debe asistir a evaluaciones programadas</li>
            <li>• Cumplir con el plan asignado</li>
            <li>• No faltar a entrenamientos sin justificación</li>
            <li>• Respetar fechas y dinámicas del reto</li>
          </ul>
        </div>
      </section>

      {/* ================= CTA FINAL ================= */}
      <section className="py-24 bg-black text-center">
        <h2 className="text-4xl font-extrabold mb-6">
          ¿Estás listo para el <span className="text-yellow-400">cambio</span>?
        </h2>

        <p className="text-gray-300 text-lg mb-10">
          Inscríbete hoy y forma parte del Reto Fitness Para La Vida
        </p>

        <a
          href="/login"
          className="bg-yellow-400 text-black px-12 py-4 rounded-xl font-bold text-lg hover:bg-yellow-500 transition"
        >
          Quiero participar
        </a>
      </section>

    </main>
  );
}
