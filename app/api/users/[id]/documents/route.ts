import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;

    // Verificar permisos - usuario puede ver sus propios documentos, admin puede ver todos
    if (session.user.id !== id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    // Obtener enrollments del usuario para buscar documentos asociados
    const userEnrollments = await prisma.enrollment.findMany({
      where: { userId: id },
      select: { id: true },
    });

    const enrollmentIds = userEnrollments.map(e => e.id);

    // Obtener documentos del usuario (por userId O por enrollmentId)
    const documents = await prisma.document.findMany({
      where: { 
        OR: [
          { userId: id },
          { enrollmentId: { in: enrollmentIds } },
        ],
        isActive: true,
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        type: true,
        fileName: true,
        filename: true, // Campo legacy
        filePath: true,
        url: true, // Campo legacy
        fileSize: true,
        description: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ documents });

  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json({ 
      error: "Error interno del servidor" 
    }, { status: 500 });
  }
}