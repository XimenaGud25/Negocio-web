import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";

const createProgressSchema = z.object({
  weight: z.number().positive(),
  bodyFat: z.number().min(0).max(100).optional(),
  muscleMass: z.number().min(0).max(100).optional(),
  measurements: z.string().optional(),
  notes: z.string().optional(),
});

// POST /api/user/progress - Record biweekly progress
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    if (user.role === "ADMIN") {
      return NextResponse.json(
        { error: "Los administradores no pueden registrar progreso" },
        { status: 403 }
      );
    }

    // Get active enrollment
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: user.id,
        status: { in: ["ACTIVE", "EXPIRING"] },
      },
      include: {
        plan: true,
        progress: {
          orderBy: { recordDate: "desc" },
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "No tienes un plan activo" },
        { status: 404 }
      );
    }

    // Calculate days since start
    const now = new Date();
    const startDate = new Date(enrollment.startDate);
    const daysSinceStart = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    // Check if user can record progress (day 0, 15, 30, 45, etc. or last day)
    const isLastDay = daysSinceStart >= enrollment.plan.durationDays - 1;
    const canRecord = daysSinceStart === 0 || daysSinceStart % 15 === 0 || isLastDay;

    if (!canRecord) {
      const nextReviewDay = Math.ceil((daysSinceStart + 1) / 15) * 15;
      return NextResponse.json(
        {
          error: `Solo puedes registrar progreso cada 15 días. Tu próximo registro será el día ${nextReviewDay}`,
          nextReviewDay,
        },
        { status: 400 }
      );
    }

    // Check if progress was already recorded today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingProgress = enrollment.progress.find((p) => {
      const recordDate = new Date(p.recordDate);
      recordDate.setHours(0, 0, 0, 0);
      return recordDate.getTime() === today.getTime();
    });

    if (existingProgress) {
      return NextResponse.json(
        { error: "Ya registraste tu progreso hoy" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = createProgressSchema.parse(body);

    const progress = await prisma.progress.create({
      data: {
        enrollmentId: enrollment.id,
        recordDate: now,
        dayNumber: daysSinceStart,
        ...validatedData,
      },
    });

    return NextResponse.json(progress, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Error al registrar progreso" },
      { status: 500 }
    );
  }
}

// GET /api/user/progress - Get all progress records
export async function GET() {
  try {
    const user = await requireAuth();

    if (user.role === "ADMIN") {
      return NextResponse.json(
        { error: "Los administradores no tienen progreso" },
        { status: 403 }
      );
    }

    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: user.id,
        status: { in: ["ACTIVE", "EXPIRING"] },
      },
      include: {
        progress: {
          orderBy: { recordDate: "asc" },
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "No tienes un plan activo" },
        { status: 404 }
      );
    }

    return NextResponse.json(enrollment.progress);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error al cargar progreso" },
      { status: 500 }
    );
  }
}
