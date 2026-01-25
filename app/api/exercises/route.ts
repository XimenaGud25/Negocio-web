import { NextRequest, NextResponse } from "next/server";

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

    console.log('[GET /api/exercises] Fetching from Gym Exercises API...');

    // Construir parámetros de query para la API externa
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("limit", limit);
    params.append("sortBy", sortBy);
    params.append("sortOrder", sortOrder);
    
    if (search) params.append("search", search);
    if (difficulty) params.append("difficulty", difficulty);
    if (muscleId) params.append("muscleId", muscleId);
    if (equipmentId) params.append("equipmentId", equipmentId);

    const apiUrl = `https://exercises-gym.onrender.com/api/exercises?${params.toString()}`;

    const response = await fetch(apiUrl, {
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      console.error('[GET /api/exercises] Gym API error:', response.status);
      const errorText = await response.text();
      console.error('[GET /api/exercises] Error body:', errorText);
      throw new Error(`Gym API error: ${response.status}`);
    }

    const data = await response.json();

    // La API externa ya devuelve los ejercicios en el formato correcto con nombres en español
    console.log('[GET /api/exercises] Returning exercises count:', data.data?.length || data.length);
    
    // Si la respuesta tiene el formato { data: [], total: number, page: number, etc. }
    if (data.data) {
      return NextResponse.json({
        exercises: data.data,
        total: data.total,
        page: data.page,
        totalPages: data.totalPages,
      });
    }
    
    // Si la respuesta es directamente un array de ejercicios
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching exercises:", error);
    return NextResponse.json(
      { error: "Error al obtener ejercicios" },
      { status: 500 }
    );
  }
}