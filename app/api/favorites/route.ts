import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET /api/favorites - Obtener todos los favoritos del usuario
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const includeProgress = searchParams.get("include") === "progress";

    const favorites = await prisma.favoriteExercise.findMany({
      where: { userId: session.user.id },
      include: {
        progressLogs: includeProgress
          ? {
              orderBy: { logDate: "desc" },
              take: 50,
            }
          : false,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(favorites);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json(
      { error: "Error al obtener favoritos" },
      { status: 500 }
    );
  }
}

// POST /api/favorites - Agregar un ejercicio a favoritos
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const {
      exerciseApiId,
      exerciseName,
      exerciseNameEs,
      bodyPart,
      bodyPartEs,
      equipment,
      equipmentEs,
      target,
      targetEs,
      gifUrl,
    } = body;

    if (!exerciseApiId || !exerciseName) {
      return NextResponse.json(
        { error: "Faltan datos del ejercicio" },
        { status: 400 }
      );
    }

    // Verificar si ya existe
    const existing = await prisma.favoriteExercise.findUnique({
      where: {
        userId_exerciseApiId: {
          userId: session.user.id,
          exerciseApiId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "El ejercicio ya está en favoritos" },
        { status: 409 }
      );
    }

    const favorite = await prisma.favoriteExercise.create({
      data: {
        userId: session.user.id,
        exerciseApiId,
        exerciseName,
        exerciseNameEs,
        bodyPart,
        bodyPartEs,
        equipment,
        equipmentEs,
        target,
        targetEs,
        gifUrl,
      },
    });

    return NextResponse.json(favorite, { status: 201 });
  } catch (error) {
    console.error("Error creating favorite:", error);
    return NextResponse.json(
      { error: "Error al agregar favorito" },
      { status: 500 }
    );
  }
}
