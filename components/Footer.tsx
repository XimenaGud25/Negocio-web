import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-black text-gray-400">
      
      {/* CONTENIDO PRINCIPAL */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid gap-12 md:grid-cols-3 text-center md:text-left">

        {/* LOGO + FRASE */}
        <div className="flex flex-col items-center md:items-start gap-4">
          <Image
            src="/logo.png"
            alt="Fitness para la vida"
            width={60}
            height={60}
          />
          <h3 className="text-white font-extrabold text-lg tracking-wide">
            FITNESS PARA LA VIDA
          </h3>
          <p className="text-sm max-w-xs">
            Disciplina, constancia y resultados reales a través de entrenamiento
            y nutrición personalizada.
          </p>

          {/* CTA */}
          <a
            href="#planes"
            className="mt-4 inline-block bg-yellow-400 text-black px-6 py-2 rounded-lg font-bold hover:bg-yellow-500 transition"
          >
            Quiero mi plan
          </a>
        </div>

        {/* NAVEGACIÓN */}
        <div>
          <h4 className="text-white font-bold mb-5">Navegación</h4>
          <ul className="space-y-3">
            <li>
              <a href="/" className="hover:text-yellow-400 transition">
                Inicio
              </a>
            </li>
            <li>
              <a href="#servicios" className="hover:text-yellow-400 transition">
                Servicios
              </a>
            </li>
            <li>
              <a href="#planes" className="hover:text-yellow-400 transition">
                Planes
              </a>
            </li>
          </ul>
        </div>

        {/* CONTACTO + REDES */}
        <div>
          <h4 className="text-white font-bold mb-5">Contacto</h4>
          <ul className="space-y-3">
            <li>📍 Querétaro, México</li>

            <li>
              📲{" "}
              <a
                href="https://wa.me/524461252310"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-yellow-400 transition"
              >
                WhatsApp
              </a>
            </li>

            <li>
              📸{" "}
              <a
                href="https://instagram.com/chuchoblue100"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-yellow-400 transition"
              >
                Instagram
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* COPYRIGHT */}
      <div className="border-t border-gray-800 py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Fitness Para La Vida. Todos los derechos reservados.
      </div>
    </footer>
  );
}
