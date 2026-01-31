import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { S3Service } from "@/lib/s3";

/**
 * POST /api/uploads/presign
 * Genera una URL pre-firmada para subir un archivo a S3
 * Solo accesible para administradores
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { filename, contentType, folder = 'documents' } = body;

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: "filename y contentType son requeridos" },
        { status: 400 }
      );
    }

    console.log('[POST /api/uploads/presign] Generando URL pre-firmada:', { filename, contentType, folder });

    const result = await S3Service.getPresignedUploadUrl(filename, contentType, folder);

    console.log('[POST /api/uploads/presign] URL generada exitosamente');

    return NextResponse.json(result);
  } catch (error) {
    console.error('[POST /api/uploads/presign] Error:', error);
    
    if (error instanceof Error && error.message.includes('no permitido')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error al generar URL pre-firmada" },
      { status: 500 }
    );
  }
}
