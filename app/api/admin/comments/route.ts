import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

const createCommentSchema = z.object({
  enrollmentId: z.string(),
  comment: z.string().min(1, "El comentario no puede estar vacío"),
});

// POST /api/admin/comments - Create trainer comment
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();

    const body = await request.json();
    const { enrollmentId, comment } = createCommentSchema.parse(body);

    const trainerComment = await prisma.trainerComment.create({
      data: {
        enrollmentId,
        comment,
      },
      include: {
        enrollment: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(trainerComment, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Error al crear comentario" },
      { status: 500 }
    );
  }
}

// GET /api/admin/comments?enrollmentId=xxx - Get comments for an enrollment
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const searchParams = request.nextUrl.searchParams;
    const enrollmentId = searchParams.get("enrollmentId");

    if (!enrollmentId) {
      return NextResponse.json(
        { error: "enrollmentId es requerido" },
        { status: 400 }
      );
    }

    const comments = await prisma.trainerComment.findMany({
      where: { enrollmentId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(comments);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error al cargar comentarios" },
      { status: 500 }
    );
  }
}
