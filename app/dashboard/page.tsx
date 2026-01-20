import MaxWidthWrapper from "@/components/max-width-wapper";
import Footer from "@/components/Footer";
import Image from "next/image";

type Plan = {
  id: string;
  name: string;
  description: string;
  durationDays: number;
  price: number;
  features: string[];
};

async function getPlans(): Promise<Plan[]> {
  try {
    const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const res = await fetch(`${base}/api/plans`);
    if (!res.ok) return [];
    return (await res.json()) as Plan[];
  } catch (e) {
    return [];
  }
}

export default async function DashboardPublicPage() {
  const plans = await getPlans();

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <MaxWidthWrapper className="py-16">
          <section className="grid gap-12 md:grid-cols-2 items-center">
            <div>
              <h2 className="text-4xl font-extrabold">Quiénes somos</h2>
              <p className="mt-4 text-gray-600">
                Somos un equipo de entrenadores y nutricionistas dedicados a guiarte
                hacia resultados reales con planes personalizados, seguimiento
                quincenal y soporte por WhatsApp.
              </p>
              <p className="mt-4 text-gray-600">
                Visión: Crear cambios sostenibles a través de la disciplina y la
                educación en entrenamiento y nutrición.
              </p>
            </div>

            <div className="rounded-lg overflow-hidden shadow-md">
              <Image src="/servicios/hero.jpg" alt="servicios" width={800} height={500} className="object-cover w-full h-64 md:h-72" />
            </div>
          </section>

          <section id="planes" className="mt-20">
            <h3 className="text-3xl font-bold">Planes</h3>
            <p className="mt-2 text-gray-600">Elige el plan que mejor se adapte a tus objetivos. (Máx. 5 planes visibles)</p>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {plans.length === 0 ? (
                <div className="col-span-full text-center text-gray-500">No hay planes disponibles</div>
              ) : (
                plans.map((p) => (
                  <article key={p.id} className="border rounded-lg p-6 shadow-sm hover:shadow-md transition">
                    <h4 className="font-bold text-lg">{p.name}</h4>
                    <p className="text-sm text-gray-600 mt-2">Duración: {p.durationDays} días</p>
                    <p className="mt-3 text-gray-700 text-sm">{p.description}</p>
                    <ul className="mt-4 list-disc list-inside text-sm text-gray-600">
                      {Array.isArray(p.features) ? p.features.slice(0,4).map((f, i) => <li key={i}>{f}</li>) : null}
                    </ul>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="font-bold">${p.price}</span>
                      <a href="/login" className="text-sm bg-yellow-400 text-black px-3 py-1 rounded">Contratar</a>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          <section id="auth-info" className="mt-20">
            <h3 className="text-2xl font-bold">Autenticación</h3>
            <p className="mt-2 text-gray-600">No existe registro público. Los administradores crean las cuentas y comparten usuario y contraseña por WhatsApp.</p>
          </section>
        </MaxWidthWrapper>
      </main>

      <Footer />
    </div>
  );
}
