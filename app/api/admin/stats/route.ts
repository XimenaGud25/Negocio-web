import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Mejorar el manejo de autenticación
    if (!session) {
      console.log('[AdminStats] No session found');
      return NextResponse.json({ error: "Sesión no válida" }, { status: 401 });
    }
    
    if (!session.user || session.user.role !== "ADMIN") {
      console.log('[AdminStats] User not admin or missing user data:', session.user);
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    console.log('[AdminStats] Admin access granted for user:', session.user.id);

    const [totalUsers, activeCount, expiringCount, expiredCount] = await Promise.all([
      prisma.user.count({ where: { role: "USER" } }),
      prisma.enrollment.count({ where: { status: "ACTIVE" } }),
      prisma.enrollment.count({ where: { status: "EXPIRING" } }),
      prisma.enrollment.count({ where: { status: "EXPIRED" } }),
    ]);

    const stats = {
      total: totalUsers,
      active: activeCount,
      expiring: expiringCount,
      expired: expiredCount,
    };

    console.log('[AdminStats] Stats calculated:', stats);
    return NextResponse.json(stats);
  } catch (error) {
    console.error("[AdminStats] Error fetching stats:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
