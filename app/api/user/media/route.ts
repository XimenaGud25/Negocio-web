import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";

const uploadMediaSchema = z.object({
  url: z.string().url(),
  type: z.enum(["DAY_1_VIDEO", "FINAL_VIDEO"]),
});

// POST /api/user/media - Upload user videos
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    if (user.role === "ADMIN") {
      return NextResponse.json(
        { error: "Los administradores no pueden subir videos" },
        { status: 403 }
      );
    }

    // Get active enrollment
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: user.id,
        status: { in: ["ACTIVE", "EXPIRING"] },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "No tienes un plan activo" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { url, type } = uploadMediaSchema.parse(body);

    // Check if media of this type already exists
    const existing = await prisma.media.findFirst({
      where: {
        enrollmentId: enrollment.id,
        type,
      },
    });

    if (existing) {
      // Update existing media
      const media = await prisma.media.update({
        where: { id: existing.id },
        data: { url },
      });
      return NextResponse.json(media);
    }

    // Create new media
    const media = await prisma.media.create({
      data: {
        enrollmentId: enrollment.id,
        type,
        url,
      },
    });

    return NextResponse.json(media, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Error al subir video" },
      { status: 500 }
    );
  }
}
