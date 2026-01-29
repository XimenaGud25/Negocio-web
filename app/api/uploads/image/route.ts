import { NextRequest, NextResponse } from "next/server";
import { S3Service } from "@/lib/s3";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    const expiresInParam = searchParams.get("expiresIn");

    if (!key) {
      return NextResponse.json(
        { error: "Key parameter is required" },
        { status: 400 }
      );
    }

    // Validar expiresIn
    let expiresIn = 3600; // Por defecto 1 hora
    if (expiresInParam) {
      const parsed = parseInt(expiresInParam, 10);
      if (isNaN(parsed) || parsed < 60 || parsed > 86400) {
        return NextResponse.json(
          { error: "expiresIn must be between 60 and 86400 seconds" },
          { status: 400 }
        );
      }
      expiresIn = parsed;
    }

    console.log('[GET /api/uploads/image] Generating signed URL for key:', key);

    // Obtener URL pre-firmada
    const result = await S3Service.getDownloadUrl(key, expiresIn);

    console.log('[GET /api/uploads/image] Successfully generated URL');

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error generating image URL:", error);
    
    if (error instanceof Error && error.message.includes("No se pudo extraer")) {
      return NextResponse.json(
        { error: "Invalid image key or URL format" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error generating image URL" },
      { status: 500 }
    );
  }
}