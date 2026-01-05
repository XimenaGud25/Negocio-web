import Image from "next/image";

export default function Home() {
  return (
    <main className="text-gray-900">

      {/* ================= HEADER ================= */}
      <header className="fixed top-0 w-full bg-white shadow-md z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          
          {/* Logo + nombre */}
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Fitness Para La Vida"
              width={50}
              height={50}
              priority
            />
            <span className="font-extrabold text-lg tracking-wide">
              FITNESS PARA LA VIDA
            </span>
          </div>

          {/* Menú */}
          <nav className="flex gap-6 font-medium">
            <a href="#servicios" className="hover:text-yellow-400 transition">
              Servicios
            </a>
            <a href="#planes" className="hover:text-yellow-400 transition">
              Planes
            </a>
            <a
              href="/dashboard/login"
              className="text-yellow-500 font-bold hover:text-yellow-600 transition"
            >
              Iniciar sesión
            </a>
          </nav>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section className="bg-black text-white pt-36 pb-28">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-yellow-400 mb-6">
            FITNESS PARA LA VIDA
          </h1>

          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-10">
            Transformamos tu cuerpo y tu mente con entrenamiento profesional,
            asesoría nutricional y planes diseñados para resultados reales.
          </p>

          <div className="flex justify-center gap-6">
            <a
              href="#servicios"
              className="bg-yellow-400 text-black px-8 py-3 rounded-xl font-bold hover:bg-yellow-500 transition"
            >
              Ver servicios
            </a>

            <a
              href="#planes"
              className="border border-yellow-400 text-yellow-400 px-8 py-3 rounded-xl font-bold hover:bg-yellow-400 hover:text-black transition"
            >
              Ver planes
            </a>
          </div>
        </div>
      </section>

      {/* ================= SERVICIOS ================= */}
<section id="servicios" className="py-24 bg-gray-50">
  <div className="max-w-7xl mx-auto px-6">
    <h2 className="text-4xl font-bold text-center mb-16">
      Nuestros <span className="text-yellow-400">Servicios</span>
    </h2>

    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-10">
      {[
        {
          title: "Asesoría nutricional",
          img: "/servicios/asesoria.jpg",
        },
        {
          title: "Entrenamiento personalizado",
          img: "/servicios/personalizado.jpg",
        },
        {
          title: "Entrenamiento deportivo",
          img: "/servicios/deportivo.jpg",
        },
        {
          title: "Preparador físico",
          img: "/servicios/preparador.jpg",
        },
        {
          title: "Entrenamiento en línea",
          img: "/servicios/online.jpg",
        },
      ].map((service, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl shadow hover:shadow-xl transition overflow-hidden group"
        >
          {/* Imagen */}
          <div className="relative w-full h-56">
            <Image
              src={service.img}
              alt={service.title}
              fill
              className="object-cover group-hover:scale-105 transition duration-300"
            />
          </div>

          {/* Título */}
          <div className="p-6 text-center">
            <h3 className="text-lg font-bold text-yellow-500">
              {service.title}
            </h3>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>


      {/* ================= PLANES FULL SCREEN ================= */}
<section id="planes">
  {[
   {
  name: "RETO FITNESS 2da EDICIÓN",
  duration: "12 semanas",
  price: "$1,699",
  image: "/planes/reto.jpg",
  isReto: true,
  bg: "dark",
  features: [
    "Plan de alimentación (revisiones cada 2 semanas)",
    "Plan de entrenamiento",
    "Entrenamiento personalizado grupal 1 vez a la semana",
    "Clases de hipopresivos grupal cada 2 semanas",
    "Playera con edición especial del #RETOFITNESSPARALAVIDA",
  ],
},
    {
      name: "Despegue Saludable",
      duration: "3 o 6 semanas",
      price: "$450",
      image: "/planes/despegue.jpg",
      bg: "light",
      features: [
        "Plan de entrenamiento o plan de alimentación (a elegir)",
        "Informe de composición corporal",
        "Guía de suplementación",
      ],
    },
    {
      name: "Transformación acelerada",
      duration: "6 semanas",
      price: "$1,000",
      image: "/planes/acelerada.jpg",
      bg: "dark",
      features: [
        "Plan de alimentación",
        "Plan de entrenamiento",
        "Valoración corporal",
        "Guía de suplementación",
        "2 informes de composición corporal",
        "Revisión a las 3 semenas para ajustar planes",
        "Masaje de descarga muscular con @hzfisioteo",
      ],
    },
    {
      name: "Fitness para la vida",
      duration: "12 semanas",
      price: "$2,400",
      image: "/planes/12sem.jpg",
      bg: "light",
      features: [
        "3 consultas nutricionales",
        "2 planes de entrenamiento",
        "6 informes de composición corporal",
        "3 revisiones para ajustar planes",
        "Masaje de descarga muscular + 1 clase de hipopresivos con @hzfisioteo",
        "Botas de presoterapia + 1 clase de hipopresivos con @hzfisioteo",
        "2 valoraciones posturales con @hzfisioteo",
      ],
    },
    {
      name: "Transformación integral",
      duration: "9 semanas",
      price: "$1,650",
      image: "/planes/transformacionin.jpg",
      bg: "dark",
      features: [
        "2 planes de alimentación",
        "Plan de entrenamiento",
        "Valoración corporal",
        "Guía de suplementación",
        "3 informes de composición corporal",
        "Revisión a las 3 semenas para ajustar planes",
        "Masaje de descarga muscular con @hzfisioteo",
        "50% de descuento en tu segundo masaje con @hzfisioteo",
      ],
    },
  ].map((plan, index) => (
    <div
      key={index}
      className={`min-h-screen flex items-center ${
        index % 2 === 0 ? "bg-black text-white" : "bg-gray-100 text-black"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">

        
        {/* Texto */}
        <div>
          <h3 className="text-5xl font-extrabold text-yellow-400 mb-4">
            {plan.name}
          </h3>

          <p className="text-lg mb-2 opacity-80">
            Duración: {plan.duration}
          </p>

          <p className="text-4xl font-bold text-yellow-500 mb-8">
            {plan.price}
          </p>

          <ul className="space-y-4 mb-10">
            {plan.features.map((feature, i) => (
              <li key={i} className="text-lg">
                ✔ {feature}
              </li>
            ))}
          </ul>

         <div className="flex flex-wrap gap-4">
 <a
  href={`https://wa.me/524461252310?text=${encodeURIComponent(
    `Hola me interesa el plan "${plan.name}" (${plan.duration}). ¿Me das más información por favor?`
  )}`}
  target="_blank"
  rel="noopener noreferrer"
  className="inline-block bg-yellow-400 text-black px-8 py-4 rounded-xl font-bold hover:bg-yellow-500 transition"
>
  Quiero este plan
</a>



  {plan.isReto && (
    <a
      href="/reto-fitness"
      className="inline-block border border-yellow-400 text-yellow-400 px-8 py-4 rounded-xl font-bold hover:bg-yellow-400 hover:text-black transition"
    >
      Más información
    </a>
  )}
</div>

        </div>

        {/* Imagen / Flyer */}
        <div
          className="relative w-full h-72 sm:h-96 md:h-[520px] flex items-center justify-center">
        <Image
         src={plan.image}
          alt={plan.name}
          fill
          className="object-contain"
        priority={index === 0}
  />
</div>


      </div>
    </div>
  ))}
</section>


      {/* ================= FOOTER ================= */}
      <footer className="bg-black text-gray-400 py-10">
        <div className="max-w-7xl mx-auto px-6 text-center">
        </div>
      </footer>
    </main>
  );
}
