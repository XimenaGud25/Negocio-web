import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { DocumentType } from "@prisma/client";
import { S3Service } from "@/lib/s3";

export async function POST(request: NextRequest) {
  try {
    console.log("[POST /api/admin/documents] Starting S3 upload...");
    
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      console.log("[POST /api/admin/documents] Unauthorized");
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const formData = await request.formData();
    console.log("[POST /api/admin/documents] FormData keys:", Array.from(formData.keys()));
    
    const enrollmentId = formData.get("enrollmentId") as string;
    const dietFile = formData.get("dietFile") as File | null;
    const routineFile = formData.get("routineFile") as File | null;
    const reportFile = formData.get("reportFile") as File | null;

    console.log("[POST /api/admin/documents] enrollmentId:", enrollmentId);
    console.log("[POST /api/admin/documents] Files:", {
      diet: !!dietFile,
      routine: !!routineFile,
      report: !!reportFile
    });

    if (!enrollmentId) {
      console.log("[POST /api/admin/documents] Missing enrollmentId");
      return NextResponse.json({ error: "enrollmentId es requerido" }, { status: 400 });
    }

    // Verificar que la inscripción existe
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
    });

    if (!enrollment) {
      console.log("[POST /api/admin/documents] Enrollment not found:", enrollmentId);
      return NextResponse.json({ error: "Inscripción no encontrada" }, { status: 404 });
    }

    console.log("[POST /api/admin/documents] Enrollment found:", enrollment.id);

    const uploadedDocuments = [];

    // Procesar archivo de dieta
    if (dietFile) {
      console.log("[POST /api/admin/documents] Processing diet file:", dietFile.name, dietFile.size);
      const bytes = await dietFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Subir a S3
      const { fileUrl, key } = await S3Service.uploadDirect(
        buffer,
        dietFile.name,
        dietFile.type,
        'documents'
      );
      console.log("[POST /api/admin/documents] Diet file uploaded to S3:", key);

      // Guardar en BD: actualizar si existe registro del mismo tipo para esta inscripción
      const existingDiet = await prisma.document.findFirst({ 
        where: { enrollmentId, type: DocumentType.DIET } 
      });
      
      const document = existingDiet
        ? await prisma.document.update({
            where: { id: existingDiet.id },
            data: { 
              filename: dietFile.name, 
              url: fileUrl, 
              fileSize: dietFile.size, 
              updatedAt: new Date() 
            },
          })
        : await prisma.document.create({
            data: {
              enrollmentId,
              type: DocumentType.DIET,
              filename: dietFile.name,
              url: fileUrl,
              fileSize: dietFile.size,
            },
          });

      console.log("[POST /api/admin/documents] Diet document saved to DB:", document.id);
      uploadedDocuments.push(document);
    }

    // Procesar archivo de rutina
    if (routineFile) {
      console.log("[POST /api/admin/documents] Processing routine file:", routineFile.name, routineFile.size);
      const bytes = await routineFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Subir a S3
      const { fileUrl, key } = await S3Service.uploadDirect(
        buffer,
        routineFile.name,
        routineFile.type,
        'documents'
      );
      console.log("[POST /api/admin/documents] Routine file uploaded to S3:", key);

      const existingRoutine = await prisma.document.findFirst({ 
        where: { enrollmentId, type: DocumentType.ROUTINE } 
      });
      
      const document = existingRoutine
        ? await prisma.document.update({
            where: { id: existingRoutine.id },
            data: { 
              filename: routineFile.name, 
              url: fileUrl, 
              fileSize: routineFile.size, 
              updatedAt: new Date() 
            },
          })
        : await prisma.document.create({
            data: {
              enrollmentId,
              type: DocumentType.ROUTINE,
              filename: routineFile.name,
              url: fileUrl,
              fileSize: routineFile.size,
            },
          });

      console.log("[POST /api/admin/documents] Routine document saved to DB:", document.id);
      uploadedDocuments.push(document);
    }

    // Procesar imagen de informe (jpg/png)
    if (reportFile) {
      console.log("[POST /api/admin/documents] Processing report file:", reportFile.name, reportFile.size);
      const bytes = await reportFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Subir a S3
      const { fileUrl, key } = await S3Service.uploadDirect(
        buffer,
        reportFile.name,
        reportFile.type,
        'documents'
      );
      console.log("[POST /api/admin/documents] Report file uploaded to S3:", key);

      const existingReport = await prisma.document.findFirst({ 
        where: { enrollmentId, type: DocumentType.REPORT } 
      });
      
      const document = existingReport
        ? await prisma.document.update({
            where: { id: existingReport.id },
            data: { 
              filename: reportFile.name, 
              url: fileUrl, 
              fileSize: reportFile.size, 
              updatedAt: new Date() 
            },
          })
        : await prisma.document.create({
            data: {
              enrollmentId,
              type: DocumentType.REPORT,
              filename: reportFile.name,
              url: fileUrl,
              fileSize: reportFile.size,
            },
          });

      console.log("[POST /api/admin/documents] Report document saved to DB:", document.id);
      uploadedDocuments.push(document);
    }

    console.log("[POST /api/admin/documents] Upload complete. Documents:", uploadedDocuments.length);

    return NextResponse.json(
      { message: "Documentos subidos exitosamente a S3", documents: uploadedDocuments },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/admin/documents] Full error:", error);
    console.error("[POST /api/admin/documents] Stack:", (error as Error).stack);
    return NextResponse.json({ 
      error: "Error al subir documentos: " + ((error as Error).message || "Unknown error") 
    }, { status: 500 });
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

    // Obtener el documento para extraer la key de S3
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return NextResponse.json({ error: "Documento no encontrado" }, { status: 404 });
    }

    // Eliminar de S3 si tiene URL de S3
    if (document.url && document.url.includes('s3.amazonaws.com')) {
      try {
        const key = S3Service.extractKeyFromUrl(document.url);
        if (key) {
          await S3Service.deleteFile(key);
          console.log('[DELETE /api/admin/documents] Archivo eliminado de S3:', key);
        }
      } catch (error) {
        console.error('[DELETE /api/admin/documents] Error eliminando de S3:', error);
        // Continuar aunque falle el borrado de S3
      }
    }

    // Eliminar de la BD
    await prisma.document.delete({
      where: { id: documentId },
    });

    return NextResponse.json({ message: "Documento eliminado exitosamente" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json({ error: "Error al eliminar documento" }, { status: 500 });
  }
}
