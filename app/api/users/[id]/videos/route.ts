import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;

    // Verificar que el usuario solo puede subir videos para su propia cuenta o si es admin
    if (session.user.id !== id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    const formData = await request.formData();
    const videoFile = formData.get("video") as File | null;
    const title = formData.get("title") as string || "";
    const description = formData.get("description") as string || "";

    if (!videoFile) {
      return NextResponse.json({ error: "No se encontró archivo de video" }, { status: 400 });
    }

    // Validar tipo de archivo
    const allowedTypes = ["video/mp4", "video/avi", "video/mov", "video/quicktime", "video/x-msvideo"];
    if (!allowedTypes.includes(videoFile.type)) {
      return NextResponse.json({ 
        error: "Tipo de archivo no permitido. Solo se permiten videos MP4, AVI y MOV" 
      }, { status: 400 });
    }

    // Validar tamaño (máximo 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (videoFile.size > maxSize) {
      return NextResponse.json({ 
        error: "El archivo es demasiado grande. Máximo 100MB permitido" 
      }, { status: 400 });
    }

    // Crear directorio de videos si no existe
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "videos", id);
    await mkdir(uploadsDir, { recursive: true });

    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const fileExtension = path.extname(videoFile.name);
    const fileName = `video_${timestamp}${fileExtension}`;
    const filePath = path.join(uploadsDir, fileName);
    const relativePath = `/uploads/videos/${id}/${fileName}`;

    // Guardar archivo
    const bytes = await videoFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Guardar en base de datos
    const userVideo = await prisma.userVideo.create({
      data: {
        userId: id,
        fileName: videoFile.name,
        filePath: relativePath,
        fileSize: videoFile.size,
        mimeType: videoFile.type,
        title: title || videoFile.name,
        description: description || null,
      },
    });

    return NextResponse.json({
      message: "Video subido exitosamente",
      video: {
        id: userVideo.id,
        fileName: userVideo.fileName,
        title: userVideo.title,
        uploadedAt: userVideo.uploadedAt,
      },
    });

  } catch (error) {
    console.error("Error uploading video:", error);
    return NextResponse.json({ 
      error: "Error interno del servidor" 
    }, { status: 500 });
  }
}

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

    // Verificar permisos
    if (session.user.id !== id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    // Obtener videos del usuario
    const videos = await prisma.userVideo.findMany({
      where: { 
        userId: id,
        isVisible: true,
      },
      orderBy: { uploadedAt: "desc" },
      select: {
        id: true,
        fileName: true,
        filePath: true,
        fileSize: true,
        mimeType: true,
        title: true,
        description: true,
        uploadedAt: true,
      },
    });

    return NextResponse.json({ videos });

  } catch (error) {
    console.error("Error fetching videos:", error);
    return NextResponse.json({ 
      error: "Error interno del servidor" 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;

    // Verificar permisos
    if (session.user.id !== id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get("videoId");

    if (!videoId) {
      return NextResponse.json({ error: "ID del video es requerido" }, { status: 400 });
    }

    // Verificar que el video pertenece al usuario
    const video = await prisma.userVideo.findFirst({
      where: { 
        id: videoId,
        userId: id,
      },
    });

    if (!video) {
      return NextResponse.json({ error: "Video no encontrado" }, { status: 404 });
    }

    // Eliminar video de la base de datos
    await prisma.userVideo.delete({
      where: { id: videoId },
    });

    // Intentar eliminar archivo físico (opcional, puede fallar sin problemas)
    try {
      const fs = require('fs').promises;
      const fullPath = path.join(process.cwd(), "public", video.filePath);
      await fs.unlink(fullPath);
    } catch (error) {
      console.warn("Could not delete video file:", error);
    }

    return NextResponse.json({
      message: "Video eliminado exitosamente",
    });

  } catch (error) {
    console.error("Error deleting video:", error);
    return NextResponse.json({ 
      error: "Error interno del servidor" 
    }, { status: 500 });
  }
}