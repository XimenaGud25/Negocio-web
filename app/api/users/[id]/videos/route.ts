import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { S3Service } from "@/lib/s3";

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

    // Subir a S3
    const bytes = await videoFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const { fileUrl, key } = await S3Service.uploadDirect(
      buffer,
      videoFile.name,
      videoFile.type,
      `videos/${id}` // Carpeta específica para el usuario
    );

    // Guardar en base de datos
    let userVideo: any;
    try {
      userVideo = await prisma.userVideo.create({
        data: {
          userId: id,
          fileName: videoFile.name,
          filePath: fileUrl, // URL de S3
          s3Key: key, // Guardar la key de S3 para poder eliminar después
          fileSize: videoFile.size,
          mimeType: videoFile.type,
          title: title || videoFile.name,
          description: description || null,
        },
      });
    } catch (err: any) {
      console.error("Error creating userVideo (first attempt):", err);
      // If the DB doesn't have the s3Key column yet (Prisma P2022), retry without s3Key
      if (err?.code === 'P2022' || (err?.message && err.message.includes('s3Key'))) {
        try {
          console.log('[videos.route] Retrying userVideo.create without s3Key due to missing column');
          userVideo = await prisma.userVideo.create({
            data: {
              userId: id,
              fileName: videoFile.name,
              filePath: fileUrl,
              fileSize: videoFile.size,
              mimeType: videoFile.type,
              title: title || videoFile.name,
              description: description || null,
            },
          });
        } catch (err2) {
          console.error('Error creating userVideo (retry without s3Key):', err2);
          throw err2;
        }
      } else {
        throw err;
      }
    }

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

    // Eliminar archivo de S3 si existe la key
    if (video.s3Key) {
      try {
        await S3Service.deleteFile(video.s3Key);
      } catch (error) {
        console.warn("Could not delete video file from S3:", error);
      }
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