import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

const uploadMediaSchema = z.object({
  url: z.string().url(),
  type: z.enum(["INITIAL_PHOTO", "DAY_1_VIDEO", "FINAL_VIDEO"]),
});

// POST /api/admin/enrollments/[id]/media - Upload media (photos/videos)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { url, type } = uploadMediaSchema.parse(body);

    // Check if media of this type already exists for this enrollment
    const existing = await prisma.media.findFirst({
      where: {
        enrollmentId: params.id,
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
        enrollmentId: params.id,
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
      { error: error.message || "Error al subir media" },
      { status: 500 }
    );
  }
}
