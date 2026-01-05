import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/plans - Fetch active plans (max 5)
export async function GET() {
  try {
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      take: 5,
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
        durationDays: true,
        price: true,
        features: true,
      },
    });

    return NextResponse.json(plans);
  } catch (error) {
    console.error("Error fetching plans:", error);
    return NextResponse.json(
      { error: "Error al cargar los planes" },
      { status: 500 }
    );
  }
}
