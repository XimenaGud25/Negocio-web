import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

const createEnrollmentSchema = z.object({
  userId: z.string(),
  planId: z.string(),
  startDate: z.string().datetime(),
});

// POST /api/admin/enrollments - Create enrollment (assign plan to user)
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { userId, planId, startDate } = createEnrollmentSchema.parse(body);

    // Get plan to calculate end date
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json(
        { error: "Plan no encontrado" },
        { status: 404 }
      );
    }

    // Calculate end date
    const start = new Date(startDate);
    const endDate = new Date(start);
    endDate.setDate(endDate.getDate() + plan.durationDays);

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        planId,
        startDate: start,
        endDate,
        status: "ACTIVE",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
          },
        },
        plan: {
          select: {
            id: true,
            name: true,
            durationDays: true,
          },
        },
      },
    });

    return NextResponse.json(enrollment, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Error al crear inscripción" },
      { status: 500 }
    );
  }
}
