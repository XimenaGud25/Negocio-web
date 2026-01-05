import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

const updateEnrollmentSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  status: z.enum(["ACTIVE", "EXPIRING", "EXPIRED"]).optional(),
});

const uploadDocumentSchema = z.object({
  url: z.string().url(),
  type: z.enum(["DIET", "ROUTINE"]),
});

const uploadMediaSchema = z.object({
  url: z.string().url(),
  type: z.enum(["INITIAL_PHOTO", "DAY_1_VIDEO", "FINAL_VIDEO"]),
});

// GET /api/admin/enrollments/[id] - Get enrollment details with progress
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const enrollment = await prisma.enrollment.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            username: true,
          },
        },
        plan: true,
        documents: {
          orderBy: { uploadedAt: "desc" },
        },
        media: {
          orderBy: { uploadedAt: "desc" },
        },
        progress: {
          orderBy: { recordDate: "asc" },
        },
        exerciseLogs: {
          include: {
            exercise: true,
          },
          orderBy: { logDate: "desc" },
          take: 50,
        },
        trainerComments: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Inscripción no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(enrollment);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error al cargar inscripción" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/enrollments/[id] - Update enrollment
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const body = await request.json();
    const validatedData = updateEnrollmentSchema.parse(body);

    const enrollment = await prisma.enrollment.update({
      where: { id: params.id },
      data: {
        ...(validatedData.startDate && { startDate: new Date(validatedData.startDate) }),
        ...(validatedData.endDate && { endDate: new Date(validatedData.endDate) }),
        ...(validatedData.status && { status: validatedData.status }),
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
        plan: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(enrollment);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Error al actualizar inscripción" },
      { status: 500 }
    );
  }
}
