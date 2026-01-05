import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";

const createExerciseLogSchema = z.object({
  exerciseId: z.string(),
  sets: z.number().int().positive(),
  reps: z.number().int().positive(),
  weight: z.number().positive().optional(),
  notes: z.string().optional(),
  completed: z.boolean().default(true),
});

// POST /api/user/exercises - Log exercise performance
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    if (user.role === "ADMIN") {
      return NextResponse.json(
        { error: "Los administradores no pueden registrar ejercicios" },
        { status: 403 }
      );
    }

    // Get active enrollment
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: user.id,
        status: { in: ["ACTIVE", "EXPIRING"] },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "No tienes un plan activo" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = createExerciseLogSchema.parse(body);

    const exerciseLog = await prisma.exerciseLog.create({
      data: {
        enrollmentId: enrollment.id,
        ...validatedData,
        logDate: new Date(),
      },
      include: {
        exercise: true,
      },
    });

    return NextResponse.json(exerciseLog, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Error al registrar ejercicio" },
      { status: 500 }
    );
  }
}

// GET /api/user/exercises - Get exercise logs
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    if (user.role === "ADMIN") {
      return NextResponse.json(
        { error: "Los administradores no tienen ejercicios" },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "50");

    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: user.id,
        status: { in: ["ACTIVE", "EXPIRING"] },
      },
      include: {
        exerciseLogs: {
          include: {
            exercise: true,
          },
          orderBy: { logDate: "desc" },
          take: limit,
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "No tienes un plan activo" },
        { status: 404 }
      );
    }

    return NextResponse.json(enrollment.exerciseLogs);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error al cargar ejercicios" },
      { status: 500 }
    );
  }
}
