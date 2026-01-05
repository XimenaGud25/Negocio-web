import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

const uploadDocumentSchema = z.object({
  url: z.string().url(),
  type: z.enum(["DIET", "ROUTINE"]),
  filename: z.string(),
});

// POST /api/admin/enrollments/[id]/documents - Upload PDF document
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { url, type, filename } = uploadDocumentSchema.parse(body);

    const document = await prisma.document.create({
      data: {
        enrollmentId: params.id,
        type,
        url,
        filename,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Error al subir documento" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/enrollments/[id]/documents/[docId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const url = new URL(request.url);
    const docId = url.searchParams.get("docId");

    if (!docId) {
      return NextResponse.json(
        { error: "ID de documento requerido" },
        { status: 400 }
      );
    }

    await prisma.document.delete({
      where: { id: docId },
    });

    return NextResponse.json({ message: "Documento eliminado" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error al eliminar documento" },
      { status: 500 }
    );
  }
}
