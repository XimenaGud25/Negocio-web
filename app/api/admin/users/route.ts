import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const users = await prisma.user.findMany({
      where: {
        role: "USER",
        ...(status && { enrollments: { some: { status: status as any } } }),
      },
      include: {
        enrollments: {
          include: { plan: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });
    const usersWithStatus = users.map((user: any) => {
      const latestEnrollment = user.enrollments[0];
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        phone: user.phone,
        createdAt: user.createdAt,
        enrollment: latestEnrollment ? {
          id: latestEnrollment.id,
          status: latestEnrollment.status,
          planName: latestEnrollment.plan.name,
          startDate: latestEnrollment.startDate,
          endDate: latestEnrollment.endDate,
          daysRemaining: latestEnrollment.daysRemaining,
        } : null,
      };
    });
    return NextResponse.json(usersWithStatus);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Error al obtener usuarios" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
    const body = await request.json();
    const { name, email, username, password, phone, planId, startDate } = body;
    if (!name || !username || !password) {
      return NextResponse.json({ error: "Nombre, usuario y contraseña son requeridos" }, { status: 400 });
    }
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return NextResponse.json({ error: "El nombre de usuario ya existe" }, { status: 400 });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email: email || null,
        username,
        passwordHash,
        phone: phone || null,
        role: "USER",
      },
    });
    let enrollmentId = null;
    if (planId) {
      const plan = await prisma.plan.findUnique({ where: { id: planId } });
      if (plan) {
        const start = startDate ? new Date(startDate) : new Date();
        const end = new Date(start);
        end.setDate(end.getDate() + plan.durationDays);
        const enrollment = await prisma.enrollment.create({
          data: {
            userId: user.id,
            planId: plan.id,
            startDate: start,
            endDate: end,
            status: "ACTIVE",
          },
        });
        enrollmentId = enrollment.id;
      }
    }
    return NextResponse.json({ message: "Usuario creado exitosamente", userId: user.id, enrollmentId }, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Error al crear usuario" }, { status: 500 });
  }
}
