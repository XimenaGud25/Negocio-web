import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { planId } = body;

    if (!planId) {
      return NextResponse.json({ error: "planId es requerido" }, { status: 400 });
    }

    const enrollment = await prisma.enrollment.findUnique({ where: { id } });
    if (!enrollment) {
      return NextResponse.json({ error: "Enrollment no encontrado" }, { status: 404 });
    }

    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) {
      return NextResponse.json({ error: "Plan no encontrado" }, { status: 404 });
    }

    // Recalcular endDate basado en startDate + durationDays
    const start = new Date(enrollment.startDate);
    const newEnd = addDays(start, plan.durationDays - 1);

    const now = new Date();
    const diffMs = newEnd.getTime() - now.getTime();
    const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

    const updated = await prisma.enrollment.update({
      where: { id },
      data: {
        planId,
        endDate: newEnd,
        daysRemaining,
        updatedAt: new Date(),
      },
      include: { plan: true },
    });

    return NextResponse.json({ message: "Enrollment actualizado", enrollment: updated });
  } catch (error) {
    console.error("Error updating enrollment:", error);
    return NextResponse.json({ error: "Error al actualizar enrollment" }, { status: 500 });
  }
}
