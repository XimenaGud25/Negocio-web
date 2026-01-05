import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// GET /api/admin/dashboard - Get all users with enrollment status
export async function GET() {
  try {
    await requireAdmin();

    const users = await prisma.user.findMany({
      where: { role: "USER" },
      include: {
        enrollments: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            plan: {
              select: {
                name: true,
                durationDays: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate status and days remaining for each user
    const usersWithStatus = users.map((user) => {
      const latestEnrollment = user.enrollments[0];

      if (!latestEnrollment) {
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          phone: user.phone,
          enrollmentStatus: null,
          planName: null,
          daysRemaining: null,
          endDate: null,
        };
      }

      const now = new Date();
      const endDate = new Date(latestEnrollment.endDate);
      const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      let status = latestEnrollment.status;
      
      // Auto-update status based on dates
      if (daysRemaining < 0) {
        status = "EXPIRED";
      } else if (daysRemaining <= 7) {
        status = "EXPIRING";
      } else {
        status = "ACTIVE";
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        phone: user.phone,
        enrollmentId: latestEnrollment.id,
        enrollmentStatus: status,
        planName: latestEnrollment.plan.name,
        daysRemaining,
        startDate: latestEnrollment.startDate,
        endDate: latestEnrollment.endDate,
      };
    });

    // Separate users by status
    const activeUsers = usersWithStatus.filter((u) => u.enrollmentStatus === "ACTIVE");
    const expiringUsers = usersWithStatus.filter((u) => u.enrollmentStatus === "EXPIRING");
    const expiredUsers = usersWithStatus.filter((u) => u.enrollmentStatus === "EXPIRED");
    const noEnrollment = usersWithStatus.filter((u) => !u.enrollmentStatus);

    return NextResponse.json({
      summary: {
        total: users.length,
        active: activeUsers.length,
        expiring: expiringUsers.length,
        expired: expiredUsers.length,
        noEnrollment: noEnrollment.length,
      },
      users: usersWithStatus,
      activeUsers,
      expiringUsers,
      expiredUsers,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error al cargar dashboard" },
      { status: 500 }
    );
  }
}
