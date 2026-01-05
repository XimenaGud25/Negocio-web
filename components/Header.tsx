"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Fitness Para La Vida"
            width={45}
            height={45}
            priority
          />
          <span className="font-extrabold text-lg tracking-wide">
            FITNESS PARA LA VIDA
          </span>
        </Link>

        {/* Menu desktop */}
        <nav className="hidden md:flex gap-6 font-medium">
          <Link href="/#servicios" className="hover:text-yellow-400 transition">
            Servicios
          </Link>
          <Link href="/#planes" className="hover:text-yellow-400 transition">
            Planes
          </Link>
          <Link
            href="/dashboard/login"
            className="text-yellow-500 font-bold hover:text-yellow-600 transition"
          >
            Iniciar sesión
          </Link>
        </nav>

        {/* Botón hamburguesa */}
        <button
          className="md:hidden text-3xl"
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>
      </div>

      {/* Menu mobile */}
      {open && (
        <div className="md:hidden bg-white border-t shadow-lg">
          <nav className="flex flex-col items-center gap-6 py-6 font-medium">
            <Link
              href="/#servicios"
              onClick={() => setOpen(false)}
              className="hover:text-yellow-400"
            >
              Servicios
            </Link>

            <Link
              href="/#planes"
              onClick={() => setOpen(false)}
              className="hover:text-yellow-400"
            >
              Planes
            </Link>

            <Link
              href="/dashboard/login"
              onClick={() => setOpen(false)}
              className="text-yellow-500 font-bold"
            >
              Iniciar sesión
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
