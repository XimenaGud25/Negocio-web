import { NextRequest, NextResponse } from "next/server";
import { S3Service } from "@/lib/s3";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "30";
    const page = searchParams.get("page") || "1";
    const search = searchParams.get("search");
    const difficulty = searchParams.get("difficulty");
    const muscleId = searchParams.get("muscleId");
    const equipmentId = searchParams.get("equipmentId");
    const sortBy = searchParams.get("sortBy") || "name";
    const sortOrder = searchParams.get("sortOrder") || "asc";

    console.log('[GET /api/exercises] Fetching from external Gym API...');

    // Construir parámetros para tu API externa de NestJS
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("limit", limit);
    
    if (search) params.append("search", search);
    if (difficulty) params.append("difficulty", difficulty);
    if (muscleId) params.append("muscleId", muscleId);
    if (equipmentId) params.append("equipmentId", equipmentId);
    if (sortBy) params.append("sortBy", sortBy);
    if (sortOrder) params.append("sortOrder", sortOrder);

    // URL de tu API externa en Render (actualiza con tu URL real)
    const externalApiUrl = process.env.EXTERNAL_GYM_API_URL || 'https://exercises-gym.onrender.com';
    const apiUrl = `${externalApiUrl}/api/exercises?${params.toString()}`;

    console.log('[GET /api/exercises] Calling:', apiUrl);

    const response = await fetch(apiUrl, {
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      console.error('[GET /api/exercises] External API error:', response.status);
      const errorText = await response.text();
      console.error('[GET /api/exercises] Error body:', errorText);
      
      // Si falla la API externa, usar datos mock
      console.log('[GET /api/exercises] Using mock data as fallback');
      const mockExercises = generateMockExercises(parseInt(limit));
      
      return NextResponse.json({
        data: mockExercises,
        total: mockExercises.length,
        page: parseInt(page),
        totalPages: 1,
      });
    }

    const data = await response.json();
    
    // La API externa ya devuelve las imágenes con URLs pre-firmadas procesadas
    console.log('[GET /api/exercises] Received exercises:', data.data?.length || 0);
    
    // Retornar directamente los datos de la API externa
    // (ya incluyen imageUrls pre-firmadas generadas por el servicio NestJS)
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching exercises:", error);
    return NextResponse.json(
      { error: "Error al obtener ejercicios" },
      { status: 500 }
    );
  }
}

function generateMockExercises(limit: number): any[] {
  const mockExercises = [
    {
      id: "1",
      nameEn: "Push-up",
      nameEs: "Flexiones",
      bodyPart: "chest",
      bodyPartEs: "Pecho",
      target: "pectorals",
      targetEs: "Pectorales",
      equipment: "bodyweight",
      equipmentEs: "Peso corporal",
      images: ["exercises/push-up.gif"],
      gifUrl: "https://v2.exercisedb.io/image/KPdBGvOYmvwzPU",
    },
    {
      id: "2",
      nameEn: "Squat",
      nameEs: "Sentadillas",
      bodyPart: "legs",
      bodyPartEs: "Piernas",
      target: "quads",
      targetEs: "Cuádriceps",
      equipment: "bodyweight",
      equipmentEs: "Peso corporal",
      images: ["exercises/squat.gif"],
      gifUrl: "https://v2.exercisedb.io/image/dTw5rbKWIqxIKd",
    },
  ];
  
  return mockExercises.slice(0, limit);
}