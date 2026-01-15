import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
    const totalUsers = await prisma.user.count({ where: { role: "USER" } });
    const activeCount = await prisma.enrollment.count({ where: { status: "ACTIVE" } });
    const expiringCount = await prisma.enrollment.count({ where: { status: "EXPIRING" } });
    const expiredCount = await prisma.enrollment.count({ where: { status: "EXPIRED" } });
    return NextResponse.json({
      total: totalUsers,
      active: activeCount,
      expiring: expiringCount,
      expired: expiredCount,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ error: "Error al obtener estadísticas" }, { status: 500 });
  }
}
