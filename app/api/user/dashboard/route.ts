import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// GET /api/user/dashboard - Get user's active enrollment with all details
export async function GET() {
  try {
    const user = await requireAuth();

    // Prevent admin from accessing user dashboard
    if (user.role === "ADMIN") {
      return NextResponse.json(
        { error: "Los administradores no tienen dashboard de usuario" },
        { status: 403 }
      );
    }

    // Get active enrollment
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: user.id,
        status: { in: ["ACTIVE", "EXPIRING"] },
      },
      include: {
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
        trainerComments: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!enrollment) {
      return NextResponse.json({
        hasActiveEnrollment: false,
        message: "No tienes un plan activo",
      });
    }

    // Calculate days remaining
    const now = new Date();
    const endDate = new Date(enrollment.endDate);
    const startDate = new Date(enrollment.startDate);
    const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const daysSinceStart = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    // Separate documents by type
    const dietPdf = enrollment.documents.find((d) => d.type === "DIET");
    const routinePdf = enrollment.documents.find((d) => d.type === "ROUTINE");

    // Separate media by type
    const initialPhoto = enrollment.media.find((m) => m.type === "INITIAL_PHOTO");
    const day1Video = enrollment.media.find((m) => m.type === "DAY_1_VIDEO");
    const finalVideo = enrollment.media.find((m) => m.type === "FINAL_VIDEO");

    // Calculate next review date (every 15 days)
    const nextReviewDay = Math.ceil((daysSinceStart + 1) / 15) * 15;
    const canRecordProgress = daysSinceStart >= 0 && (
      daysSinceStart === 0 || 
      daysSinceStart % 15 === 0 ||
      daysSinceStart === enrollment.plan.durationDays - 1
    );

    return NextResponse.json({
      hasActiveEnrollment: true,
      enrollment: {
        id: enrollment.id,
        status: enrollment.status,
        startDate: enrollment.startDate,
        endDate: enrollment.endDate,
        daysRemaining,
        daysSinceStart,
        nextReviewDay,
        canRecordProgress,
      },
      plan: {
        id: enrollment.plan.id,
        name: enrollment.plan.name,
        description: enrollment.plan.description,
        durationDays: enrollment.plan.durationDays,
      },
      documents: {
        diet: dietPdf,
        routine: routinePdf,
      },
      media: {
        initialPhoto,
        day1Video,
        finalVideo,
      },
      progress: enrollment.progress,
      trainerComments: enrollment.trainerComments,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error al cargar dashboard" },
      { status: 500 }
    );
  }
}
