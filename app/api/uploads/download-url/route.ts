import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { S3Service } from "@/lib/s3";

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación y rol de administrador
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verificar que el usuario sea administrador
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Obtener datos del body
    const body = await request.json();
    const { key, expiresIn = 3600 } = body;

    if (!key) {
      return NextResponse.json(
        { error: "Key is required" },
        { status: 400 }
      );
    }

    // Validar expiresIn
    if (typeof expiresIn !== 'number' || expiresIn < 60 || expiresIn > 86400) {
      return NextResponse.json(
        { error: "expiresIn must be a number between 60 and 86400 seconds" },
        { status: 400 }
      );
    }

    console.log('[POST /api/uploads/download-url] Admin generating signed URL for key:', key);

    // Obtener URL pre-firmada
    const result = await S3Service.getDownloadUrl(key, expiresIn);

    console.log('[POST /api/uploads/download-url] Successfully generated URL for admin:', session.user.username);

    return NextResponse.json({
      ...result,
      requestedBy: {
        id: session.user.id,
        username: session.user.username,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error generating download URL:", error);
    
    if (error instanceof Error && error.message.includes("No se pudo extraer")) {
      return NextResponse.json(
        { error: "Invalid image key or URL format" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error generating download URL" },
      { status: 500 }
    );
  }
}