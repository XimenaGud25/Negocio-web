import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    console.log('[GET /api/muscles] Fetching from Gym Exercises API...');

    const apiUrl = `https://exercises-gym.onrender.com/api/muscles`;

    const response = await fetch(apiUrl, {
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      console.error('[GET /api/muscles] Gym API error:', response.status);
      throw new Error(`Gym API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('[GET /api/muscles] Returning muscles count:', data.length);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching muscles:", error);
    return NextResponse.json(
      { error: "Error al obtener grupos musculares" },
      { status: 500 }
    );
  }
}