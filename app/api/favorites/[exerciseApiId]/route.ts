import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// DELETE /api/favorites/[exerciseApiId] - Eliminar de favoritos
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ exerciseApiId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { exerciseApiId } = await params;

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

    // Eliminar (esto también elimina los progressLogs por cascade)
    await prisma.favoriteExercise.delete({
      where: { id: favorite.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting favorite:", error);
    return NextResponse.json(
      { error: "Error al eliminar favorito" },
      { status: 500 }
    );
  }
}

// GET /api/favorites/[exerciseApiId] - Obtener un favorito específico
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

    const favorite = await prisma.favoriteExercise.findUnique({
      where: {
        userId_exerciseApiId: {
          userId: session.user.id,
          exerciseApiId,
        },
      },
      include: {
        progressLogs: {
          orderBy: { logDate: "desc" },
        },
      },
    });

    if (!favorite) {
      return NextResponse.json(
        { error: "Favorito no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(favorite);
  } catch (error) {
    console.error("Error fetching favorite:", error);
    return NextResponse.json(
      { error: "Error al obtener favorito" },
      { status: 500 }
    );
  }
}
