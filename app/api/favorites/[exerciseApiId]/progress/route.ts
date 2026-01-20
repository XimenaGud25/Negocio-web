import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// POST /api/favorites/[exerciseApiId]/progress - Registrar progreso
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ exerciseApiId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { exerciseApiId } = await params;
    const body = await request.json();
    const { sets, reps, weight, duration, notes } = body;

    if (!sets || !reps) {
      return NextResponse.json(
        { error: "Series y repeticiones son requeridos" },
        { status: 400 }
      );
    }

    // Buscar el favorito
    const favorite = await prisma.favoriteExercise.findUnique({
      where: {
        userId_exerciseApiId: {
          userId: session.user.id,
          exerciseApiId,
        },
      },
    });

    if (!favorite) {
      return NextResponse.json(
        { error: "Favorito no encontrado" },
        { status: 404 }
      );
    }

    // Crear el registro de progreso
    const progressLog = await prisma.favoriteExerciseProgress.create({
      data: {
        favoriteExerciseId: favorite.id,
        sets: parseInt(sets),
        reps: parseInt(reps),
        weight: weight ? parseFloat(weight) : null,
        duration: duration ? parseInt(duration) : null,
        notes: notes || null,
      },
    });

    return NextResponse.json(progressLog, { status: 201 });
  } catch (error) {
    console.error("Error creating progress log:", error);
    return NextResponse.json(
      { error: "Error al registrar progreso" },
      { status: 500 }
    );
  }
}

// GET /api/favorites/[exerciseApiId]/progress - Obtener historial de progreso
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ exerciseApiId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { exerciseApiId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");

    // Buscar el favorito
    const favorite = await prisma.favoriteExercise.findUnique({
      where: {
        userId_exerciseApiId: {
          userId: session.user.id,
          exerciseApiId,
        },
      },
    });

    if (!favorite) {
      return NextResponse.json(
        { error: "Favorito no encontrado" },
        { status: 404 }
      );
    }

    const progressLogs = await prisma.favoriteExerciseProgress.findMany({
      where: { favoriteExerciseId: favorite.id },
      orderBy: { logDate: "desc" },
      take: limit,
    });

    return NextResponse.json(progressLogs);
  } catch (error) {
    console.error("Error fetching progress logs:", error);
    return NextResponse.json(
      { error: "Error al obtener progreso" },
      { status: 500 }
    );
  }
}
