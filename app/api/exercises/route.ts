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

    // Cambiar a tu API interna que SÍ tiene imágenes en la BD
    const apiUrl = `http://localhost:3001/api/exercises?${params.toString()}`;

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
    
    // Procesar imágenes para cada ejercicio
    let exercises = data.data || data;
    
    if (Array.isArray(exercises)) {
      console.log('[GET /api/exercises] Processing images for', exercises.length, 'exercises');
      
      exercises = await Promise.all(
        exercises.map(async (exercise) => {
          try {
            // Obtener las URLs de las imágenes si existen
            let imageKeys = extractImageKeysFromExercise(exercise);
            
            // Si no hay imágenes, agregar una por defecto basada en el tipo de ejercicio
            if (imageKeys.length === 0) {
              // Generar key por defecto usando el nombre del ejercicio
              const exerciseName = exercise.nameEn || exercise.nameEs || 'default';
              const defaultKey = `exercises/${exerciseName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.jpg`;
              imageKeys = [defaultKey];
              console.log(`[GET /api/exercises] No images found for ${exercise.id}, using default:`, defaultKey);
            }
            
            if (imageKeys.length > 0) {
              const imageUrls = await S3Service.getMultipleDownloadUrls(imageKeys, 7200); // 2 horas de expiración
              
              return {
                ...exercise,
                imageUrls: imageUrls.map(img => img.imageUrl),
                // Mantener los campos originales también
                originalImages: imageKeys,
              };
            }
            
            return exercise;
          } catch (error) {
            console.error(`[GET /api/exercises] Error processing images for exercise ${exercise.id}:`, error);
            return exercise; // Retornar ejercicio sin imágenes procesadas en caso de error
          }
        })
      );
    }
    
    // Si la respuesta tiene el formato { data: [], total: number, page: number, etc. }
    if (data.data) {
      return NextResponse.json({
        exercises,
        total: data.total,
        page: data.page,
        totalPages: data.totalPages,
      });
    }
    
    // Si la respuesta es directamente un array de ejercicios
    return NextResponse.json(exercises);
  } catch (error) {
    console.error("Error fetching exercises:", error);
    return NextResponse.json(
      { error: "Error al obtener ejercicios" },
      { status: 500 }
    );
  }
}

/**
 * Extrae las keys de imágenes desde los datos del ejercicio
 * @param exercise - Datos del ejercicio
 * @returns Array de keys de imágenes
 */
function extractImageKeysFromExercise(exercise: any): string[] {
  const keys: string[] = [];

  // Buscar en diferentes campos posibles donde pueden estar las imágenes
  if (exercise.images && Array.isArray(exercise.images)) {
    keys.push(...exercise.images);
  }
  
  if (exercise.image && typeof exercise.image === 'string') {
    keys.push(exercise.image);
  }

  if (exercise.imageUrl && typeof exercise.imageUrl === 'string') {
    keys.push(exercise.imageUrl);
  }

  if (exercise.gifUrl && typeof exercise.gifUrl === 'string') {
    keys.push(exercise.gifUrl);
  }

  if (exercise.instructions && Array.isArray(exercise.instructions)) {
    exercise.instructions.forEach((instruction: any) => {
      if (instruction.image && typeof instruction.image === 'string') {
        keys.push(instruction.image);
      }
    });
  }

  // Filtrar keys válidas y remover duplicados
  return [...new Set(keys.filter(key => key && key.trim().length > 0))];
}