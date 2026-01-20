import { NextRequest, NextResponse } from "next/server";
import { translateTerm, translateExerciseName, translateInstructions, translateSecondaryMuscles } from "@/lib/translate";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "30";
    const offset = searchParams.get("offset") || "0";
    const bodyPart = searchParams.get("bodyPart");

    console.log('[GET /api/exercises] Fetching from ExerciseDB...');

    // ExerciseDB endpoint via RapidAPI
    let apiUrl = `https://exercisedb.p.rapidapi.com/exercises?limit=${limit}&offset=${offset}`;
    
    // If filtering by body part
    if (bodyPart && bodyPart !== "all") {
      apiUrl = `https://exercisedb.p.rapidapi.com/exercises/bodyPart/${encodeURIComponent(bodyPart)}?limit=${limit}&offset=${offset}`;
    }

    const response = await fetch(apiUrl, {
      headers: {
        "X-RapidAPI-Key": process.env.EXERCISEDB_RAPIDAPI_KEY || "",
        "X-RapidAPI-Host": "exercisedb.p.rapidapi.com"
      },
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!response.ok) {
      console.error('[GET /api/exercises] ExerciseDB API error:', response.status);
      const errorText = await response.text();
      console.error('[GET /api/exercises] Error body:', errorText);
      throw new Error(`ExerciseDB API error: ${response.status}`);
    }

    const exercises = await response.json();

    // Transform and translate exercises
    const translatedExercises = exercises.map((ex: any) => ({
      id: ex.id,
      name: ex.name,
      name_es: translateExerciseName(ex.name),
      bodyPart: ex.bodyPart,
      bodyPart_es: translateTerm(ex.bodyPart),
      equipment: ex.equipment,
      equipment_es: translateTerm(ex.equipment),
      target: ex.target,
      target_es: translateTerm(ex.target),
      gifUrl: ex.gifUrl,
      secondaryMuscles: ex.secondaryMuscles || [],
      secondaryMuscles_es: translateSecondaryMuscles(ex.secondaryMuscles || []),
      instructions: ex.instructions || [],
      instructions_es: translateInstructions(ex.instructions || []),
    }));

    console.log('[GET /api/exercises] Returning exercises count:', translatedExercises.length);
    return NextResponse.json(translatedExercises);
  } catch (error) {
    console.error("Error fetching exercises:", error);
    return NextResponse.json(
      { error: "Error al obtener ejercicios" },
      { status: 500 }
    );
  }
}