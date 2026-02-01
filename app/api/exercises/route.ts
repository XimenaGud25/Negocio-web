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

    // Construir parámetros de query para la API externa (ExerciseDB API)
    const params = new URLSearchParams();
    params.append("offset", ((parseInt(page) - 1) * parseInt(limit)).toString());
    params.append("limit", limit);

    // Usar la API pública de ExerciseDB
    const apiUrl = `https://exercisedb.p.rapidapi.com/exercises?${params.toString()}`;

    const response = await fetch(apiUrl, {
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Key": process.env.RAPIDAPI_KEY || "",
        "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      console.error('[GET /api/exercises] ExerciseDB API error:', response.status);
      const errorText = await response.text();
      console.error('[GET /api/exercises] Error body:', errorText);
      
      // Si falla la API externa, usar datos mock
      console.log('[GET /api/exercises] Using mock data as fallback');
      const mockExercises = generateMockExercises(parseInt(limit));
      const mockData = {
        data: mockExercises,
        total: mockExercises.length,
        page: parseInt(page),
        totalPages: 1,
      };
      
      let mockProcessed = await processExerciseImages(mockData.data);
      
      return NextResponse.json({
        exercises: mockProcessed,
        total: mockData.total,
        page: mockData.page,
        totalPages: mockData.totalPages,
      });
    }

    const rawData = await response.json();
    
    // Transformar datos de ExerciseDB al formato esperado
    const data = {
      data: Array.isArray(rawData) ? rawData.map(ex => ({
        id: ex.id,
        nameEn: ex.name,
        nameEs: translateExerciseName(ex.name),
        bodyPart: ex.bodyPart,
        bodyPartEs: translateBodyPart(ex.bodyPart),
        target: ex.target,
        targetEs: translateTarget(ex.target),
        equipment: ex.equipment,
        equipmentEs: translateEquipment(ex.equipment),
        gifUrl: ex.gifUrl,
        images: ex.gifUrl ? [ex.gifUrl] : [],
        instructions: ex.instructions || [],
      })) : [],
      total: 1300, // ExerciseDB tiene ~1300 ejercicios
      page: parseInt(page),
      totalPages: Math.ceil(1300 / parseInt(limit)),
    };

    // La API externa ya devuelve los ejercicios en el formato correcto con nombres en español
    console.log('[GET /api/exercises] Returning exercises count:', data.data?.length || data.data.length);
    
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

/**
 * Procesa las imágenes de un array de ejercicios
 */
async function processExerciseImages(exercises: any[]): Promise<any[]> {
  if (!Array.isArray(exercises)) {
    return exercises;
  }

  return Promise.all(
    exercises.map(async (exercise) => {
      try {
        // Obtener las URLs de las imágenes si existen
        let imageKeys = extractImageKeysFromExercise(exercise);
        
        if (imageKeys.length > 0) {
          const imageUrls = await S3Service.getMultipleDownloadUrls(imageKeys, 7200); // 2 horas
          
          return {
            ...exercise,
            imageUrls: imageUrls.map(img => img.imageUrl),
            originalImages: imageKeys,
          };
        }
        
        return exercise;
      } catch (error) {
        console.error(`[processExerciseImages] Error for exercise ${exercise.id}:`, error);
        return exercise;
      }
    })
  );
}

/**
 * Traduce nombres de ejercicios al español
 */
function translateExerciseName(name: string): string {
  const translations: Record<string, string> = {
    "push-up": "Flexiones",
    "pull-up": "Dominadas",
    "squat": "Sentadillas",
    "bench press": "Press de banca",
    "deadlift": "Peso muerto",
    "plank": "Plancha",
  };
  return translations[name.toLowerCase()] || name;
}

/**
 * Traduce partes del cuerpo al español
 */
function translateBodyPart(part: string): string {
  const translations: Record<string, string> = {
    "back": "Espalda",
    "chest": "Pecho",
    "legs": "Piernas",
    "shoulders": "Hombros",
    "arms": "Brazos",
    "core": "Core",
    "cardio": "Cardio",
  };
  return translations[part.toLowerCase()] || part;
}

/**
 * Traduce músculos objetivo al español
 */
function translateTarget(target: string): string {
  const translations: Record<string, string> = {
    "biceps": "Bíceps",
    "triceps": "Tríceps",
    "quads": "Cuádriceps",
    "hamstrings": "Isquiotibiales",
    "glutes": "Glúteos",
    "calves": "Pantorrillas",
    "abs": "Abdominales",
  };
  return translations[target.toLowerCase()] || target;
}

/**
 * Traduce equipamiento al español
 */
function translateEquipment(equipment: string): string {
  const translations: Record<string, string> = {
    "barbell": "Barra",
    "dumbbell": "Mancuernas",
    "bodyweight": "Peso corporal",
    "cable": "Polea",
    "machine": "Máquina",
    "band": "Banda elástica",
  };
  return translations[equipment.toLowerCase()] || equipment;
}

/**
 * Genera ejercicios mock para fallback
 */
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