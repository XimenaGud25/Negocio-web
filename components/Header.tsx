"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { LogOut, User, LayoutDashboard } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession();

  // Determinar la URL del dashboard según el rol
  const getDashboardUrl = () => {
    if (session?.user?.role === "ADMIN") {
      return "/dashboard/admin";
    }
    return "/dashboard/client";
  };

  // Obtener iniciales del nombre
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

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
        <nav className="hidden md:flex gap-6 font-medium items-center">
          <Link href="/#servicios" className="hover:text-yellow-400 transition">
            Servicios
          </Link>
          <Link href="/#planes" className="hover:text-yellow-400 transition">
            Planes
          </Link>

          {status === "loading" ? (
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
          ) : session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 border-2 border-yellow-400">
                    <AvatarFallback className="bg-yellow-400 text-black font-bold">
                      {getInitials(session.user.name || "U")}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{session.user.name}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {session.user.email || session.user.username}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={getDashboardUrl()} className="cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Mi Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/client" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Mi Perfil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-red-600 focus:text-red-600"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href="/login"
              className="text-yellow-500 font-bold hover:text-yellow-600 transition"
            >
              Iniciar sesión
            </Link>
          )}
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

            {session?.user ? (
              <>
                <Link
                  href={getDashboardUrl()}
                  onClick={() => setOpen(false)}
                  className="text-yellow-500 font-bold flex items-center gap-2"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Mi Dashboard
                </Link>
                <button
                  onClick={() => {
                    setOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  className="text-red-500 font-bold flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="text-yellow-500 font-bold"
              >
                Iniciar sesión
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
