"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Dumbbell, Heart, BarChart3, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Mi Perfil",
    href: "/dashboard/client",
    icon: User,
  },
  {
    label: "Ejercicios",
    href: "/dashboard/client/exercises",
    icon: Dumbbell,
  },
  {
    label: "Favoritos",
    href: "/dashboard/client/favorites",
    icon: Heart,
  },
  {
    label: "Mi Progreso",
    href: "/dashboard/client/progress",
    icon: BarChart3,
  },
];

export default function ClientNavbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-[#0f0f0f] border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <Link href="/dashboard/client" className="flex items-center gap-2">
            <span className="text-yellow-400 font-bold text-lg">
              FITNESS PARA LA VIDA
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== "/dashboard/client" && pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-yellow-400 text-black"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}

            {/* Logout Button */}
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-red-400 hover:bg-gray-800 hover:text-red-300 transition-colors ml-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
