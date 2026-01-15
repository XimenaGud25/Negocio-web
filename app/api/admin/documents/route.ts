import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const formData = await request.formData();
    const enrollmentId = formData.get("enrollmentId") as string;
    const dietFile = formData.get("dietFile") as File | null;
    const routineFile = formData.get("routineFile") as File | null;

    if (!enrollmentId) {
      return NextResponse.json({ error: "enrollmentId es requerido" }, { status: 400 });
    }

    // Verificar que la inscripción existe
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
    });

    if (!enrollment) {
      return NextResponse.json({ error: "Inscripción no encontrada" }, { status: 404 });
    }

    const uploadedDocuments = [];

    // Procesar archivo de dieta
    if (dietFile) {
      const bytes = await dietFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Crear directorio si no existe
      const uploadsDir = path.join(process.cwd(), "public", "uploads", "documents");
      await mkdir(uploadsDir, { recursive: true });

      // Generar nombre único para el archivo
      const timestamp = Date.now();
      const filename = `diet_${enrollmentId}_${timestamp}.pdf`;
      const filepath = path.join(uploadsDir, filename);

      // Guardar archivo
      await writeFile(filepath, buffer);

      // Guardar en BD
      const document = await prisma.document.create({
        data: {
          enrollmentId,
          type: "DIET",
          filename: dietFile.name,
          url: `/uploads/documents/${filename}`,
          fileSize: dietFile.size,
        },
      });

      uploadedDocuments.push(document);
    }

    // Procesar archivo de rutina
    if (routineFile) {
      const bytes = await routineFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadsDir = path.join(process.cwd(), "public", "uploads", "documents");
      await mkdir(uploadsDir, { recursive: true });

      const timestamp = Date.now();
      const filename = `routine_${enrollmentId}_${timestamp}.pdf`;
      const filepath = path.join(uploadsDir, filename);

      await writeFile(filepath, buffer);

      const document = await prisma.document.create({
        data: {
          enrollmentId,
          type: "ROUTINE",
          filename: routineFile.name,
          url: `/uploads/documents/${filename}`,
          fileSize: routineFile.size,
        },
      });

      uploadedDocuments.push(document);
    }

    return NextResponse.json(
      { message: "Documentos subidos exitosamente", documents: uploadedDocuments },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error uploading documents:", error);
    return NextResponse.json({ error: "Error al subir documentos" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const enrollmentId = searchParams.get("enrollmentId");

    if (!enrollmentId) {
      return NextResponse.json({ error: "enrollmentId es requerido" }, { status: 400 });
    }

    const documents = await prisma.document.findMany({
      where: { enrollmentId },
      orderBy: { uploadedAt: "desc" },
    });

    return NextResponse.json({ documents }, { status: 200 });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json({ error: "Error al obtener documentos" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get("documentId");

    if (!documentId) {
      return NextResponse.json({ error: "documentId es requerido" }, { status: 400 });
    }

    await prisma.document.delete({
      where: { id: documentId },
    });

    return NextResponse.json({ message: "Documento eliminado exitosamente" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json({ error: "Error al eliminar documento" }, { status: 500 });
  }
}
