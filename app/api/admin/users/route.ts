import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, hashPassword, generatePassword, generateUsername } from "@/lib/auth";
import { z } from "zod";

const createUserSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido").optional(),
  phone: z.string().optional(),
});

// GET /api/admin/users - List all users
export async function GET() {
  try {
    await requireAdmin();

    const users = await prisma.user.findMany({
      where: { role: "USER" },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        phone: true,
        createdAt: true,
        enrollments: {
          select: {
            id: true,
            status: true,
            startDate: true,
            endDate: true,
            plan: {
              select: {
                name: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error al cargar usuarios" },
      { status: error.message === "Unauthorized" ? 401 : error.message === "Forbidden: Admin access required" ? 403 : 500 }
    );
  }
}

// POST /api/admin/users - Create new user
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const validatedData = createUserSchema.parse(body);

    // Generate credentials
    const password = generatePassword();
    const username = generateUsername(validatedData.name);
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        username,
        passwordHash,
        role: "USER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        phone: true,
        createdAt: true,
      },
    });

    // Return user data with plain password (admin will share via WhatsApp)
    return NextResponse.json({
      ...user,
      password, // Only returned on creation
      message: "Usuario creado exitosamente. Comparte las credenciales por WhatsApp.",
    }, { status: 201 });

  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Error al crear usuario" },
      { status: error.message === "Unauthorized" ? 401 : error.message === "Forbidden: Admin access required" ? 403 : 500 }
    );
  }
}
