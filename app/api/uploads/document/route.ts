import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { S3Service } from "@/lib/s3";

/**
 * POST /api/uploads/document
 * Sube un archivo directamente a S3 (sin usar presigned URL)
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

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || 'documents';

    if (!file) {
      return NextResponse.json(
        { error: "No se proporcionó ningún archivo" },
        { status: 400 }
      );
    }

    console.log('[POST /api/uploads/document] Procesando archivo:', {
      name: file.name,
      size: file.size,
      type: file.type,
      folder
    });

    // Convertir el archivo a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Subir a S3
    const result = await S3Service.uploadDirect(
      buffer,
      file.name,
      file.type,
      folder
    );

    console.log('[POST /api/uploads/document] Archivo subido exitosamente:', result.key);

    return NextResponse.json(result);
  } catch (error) {
    console.error('[POST /api/uploads/document] Error:', error);
    
    if (error instanceof Error && error.message.includes('no permitido')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error al subir el archivo" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/uploads/document
 * Elimina un archivo de S3
 * Solo accesible para administradores
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json(
        { error: "Key es requerido" },
        { status: 400 }
      );
    }

    console.log('[DELETE /api/uploads/document] Eliminando archivo:', key);

    await S3Service.deleteFile(key);

    console.log('[DELETE /api/uploads/document] Archivo eliminado exitosamente');

    return NextResponse.json({ message: "Archivo eliminado exitosamente" });
  } catch (error) {
    console.error('[DELETE /api/uploads/document] Error:', error);
    
    return NextResponse.json(
      { error: "Error al eliminar el archivo" },
      { status: 500 }
    );
  }
}
