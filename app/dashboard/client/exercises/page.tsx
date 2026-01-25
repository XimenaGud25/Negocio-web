"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Heart, Search, Filter, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Exercise = {
  id: string;
  nameEs: string;
  nameEn: string;
  descriptionEs: string;
  descriptionEn: string;
  instructions: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  primaryMuscles: Array<{id: string; nameEs: string; nameEn: string; image?: string}>;
  secondaryMuscles: Array<{id: string; nameEs: string; nameEn: string; image?: string}>;
  equipment: Array<{id: string; nameEs: string; nameEn: string; image?: string}>;
  variations: string[];
  tips: string[];
  images?: string[];
  createdAt?: string;
  updatedAt?: string;
};

type FavoriteExercise = {
  id: string;
  exerciseApiId: string;
};

const difficulties = [
  { value: "all", label: "Todas las dificultades" },
  { value: "beginner", label: "Principiante" },
  { value: "intermediate", label: "Intermedio" },
  { value: "advanced", label: "Avanzado" },
];

export default function ClientExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [favorites, setFavorites] = useState<FavoriteExercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [muscles, setMuscles] = useState<any[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [savingFavorite, setSavingFavorite] = useState<string | null>(null);

  // Cargar ejercicios
  const fetchExercises = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append("limit", "50");
      if (difficultyFilter && difficultyFilter !== "all") {
        params.append("difficulty", difficultyFilter);
      }

      const url = `/api/exercises?${params.toString()}`;
      const res = await fetch(url);

      if (!res.ok) {
        throw new Error("Error al cargar ejercicios");
      }

      const data = await res.json();
      // Handle different response formats
      if (data.exercises) {
        setExercises(data.exercises);
      } else if (Array.isArray(data)) {
        setExercises(data);
      } else {
        setExercises([]);
      }
    } catch (err) {
      setError((err as Error).message);
      setExercises([]);
    } finally {
      setLoading(false);
    }
  }, [difficultyFilter]);

  // Cargar favoritos del usuario
  const fetchFavorites = useCallback(async () => {
    try {
      const res = await fetch("/api/favorites");
      if (res.ok) {
        const data = await res.json();
        setFavorites(data);
      }
    } catch {
      console.error("Error loading favorites");
    }
  }, []);

  // Cargar datos de filtros
  const fetchFiltersData = useCallback(async () => {
    try {
      const [musclesRes, equipmentRes] = await Promise.all([
        fetch('/api/muscles'),
        fetch('/api/equipment')
      ]);
      
      if (musclesRes.ok) {
        const musclesData = await musclesRes.json();
        setMuscles(musclesData);
      }
      
      if (equipmentRes.ok) {
        const equipmentData = await equipmentRes.json();
        setEquipment(equipmentData);
      }
    } catch (err) {
      console.error('Error loading filters data:', err);
    }
  }, []);

  useEffect(() => {
    fetchExercises();
    fetchFavorites();
    fetchFiltersData();
  }, [fetchExercises, fetchFavorites, fetchFiltersData]);

  // Verificar si un ejercicio es favorito
  const isFavorite = (exerciseId: string) => {
    return favorites.some((f) => f.exerciseApiId === exerciseId);
  };

  // Toggle favorito
  const toggleFavorite = async (exercise: Exercise) => {
    setSavingFavorite(exercise.id);

    try {
      const isFav = isFavorite(exercise.id);

      if (isFav) {
        // Eliminar de favoritos
        const res = await fetch(`/api/favorites/${exercise.id}`, {
          method: "DELETE",
        });

        if (res.ok) {
          setFavorites((prev) =>
            prev.filter((f) => f.exerciseApiId !== exercise.id)
          );
        }
      } else {
        // Agregar a favoritos
        const res = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            exerciseApiId: exercise.id,
            exerciseName: exercise.nameEn,
            exerciseNameEs: exercise.nameEs,
            bodyPart: exercise.primaryMuscles[0]?.nameEn || '',
            bodyPartEs: exercise.primaryMuscles[0]?.nameEs || '',
            equipment: exercise.equipment[0]?.nameEn || '',
            equipmentEs: exercise.equipment[0]?.nameEs || '',
            target: exercise.primaryMuscles[0]?.nameEn || '',
            targetEs: exercise.primaryMuscles[0]?.nameEs || '',
            gifUrl: exercise.images?.[0] || '',
          }),
        });

        if (res.ok) {
          const newFavorite = await res.json();
          setFavorites((prev) => [...prev, newFavorite]);
        }
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
    } finally {
      setSavingFavorite(null);
    }
  };

  // Filtrar ejercicios por búsqueda
  const filteredExercises = Array.isArray(exercises) ? exercises.filter((ex) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      ex.nameEs.toLowerCase().includes(term) ||
      ex.nameEn.toLowerCase().includes(term) ||
      ex.descriptionEs.toLowerCase().includes(term) ||
      ex.primaryMuscles.some(muscle => muscle.nameEs?.toLowerCase().includes(term)) ||
      ex.secondaryMuscles.some(muscle => muscle.nameEs?.toLowerCase().includes(term)) ||
      ex.equipment.some(equip => equip.nameEs?.toLowerCase().includes(term))
    );
  }) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Ejercicios</h1>
        <p className="text-gray-400 mt-1">
          Explora ejercicios y agrégalos a tus favoritos para trackear tu progreso
        </p>
      </div>

      {/* Filters */}
      <Card className="bg-[#0f0f0f] border-gray-800">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar ejercicio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-black border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="w-[200px] bg-black border-gray-700 text-white">
                  <SelectValue placeholder="Dificultad" />
                </SelectTrigger>
                <SelectContent className="bg-black border-gray-700">
                  {difficulties.map((difficulty) => (
                    <SelectItem
                      key={difficulty.value}
                      value={difficulty.value}
                      className="text-white hover:bg-gray-800"
                    >
                      {difficulty.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading/Error states */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
          <span className="ml-2 text-gray-400">Cargando ejercicios...</span>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <p className="text-red-400">{error}</p>
          <Button
            onClick={fetchExercises}
            variant="outline"
            className="mt-4 border-gray-700 text-white hover:bg-gray-800"
          >
            Reintentar
          </Button>
        </div>
      )}

      {/* Results */}
      {!loading && !error && filteredExercises.length === 0 && (
        <p className="text-gray-500 text-center py-8">
          No se encontraron ejercicios. Intenta con otros filtros.
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {filteredExercises.map((ex) => (
          <Card
            key={ex.id}
            className="bg-[#0f0f0f] border-gray-800 overflow-hidden"
          >
            <CardContent className="p-0">
              <div className="flex">
                {/* Exercise Image */}
                <div className="flex-shrink-0">
                  {ex.images && ex.images.length > 0 ? (
                    <img
                      src={ex.images[0]}
                      alt={ex.nameEs}
                      className="w-32 h-32 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gray-900 flex items-center justify-center text-xs text-gray-500">
                      Sin imagen
                    </div>
                  )}
                </div>

                {/* Exercise Details */}
                <div className="flex-1 p-4 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="font-bold text-lg text-yellow-400 truncate">
                        {ex.nameEs}
                      </h2>
                      <p className="text-xs text-gray-500 truncate">{ex.nameEn}</p>
                      {ex.difficulty && (
                        <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                          ex.difficulty === 'beginner' ? 'bg-green-600' :
                          ex.difficulty === 'intermediate' ? 'bg-yellow-600' : 'bg-red-600'
                        } text-white`}>
                          {ex.difficulty === 'beginner' ? 'Principiante' :
                           ex.difficulty === 'intermediate' ? 'Intermedio' : 'Avanzado'}
                        </span>
                      )}
                    </div>

                    {/* Favorite Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleFavorite(ex)}
                      disabled={savingFavorite === ex.id}
                      className={cn(
                        "flex-shrink-0",
                        isFavorite(ex.id)
                          ? "text-red-500 hover:text-red-400"
                          : "text-gray-500 hover:text-red-400"
                      )}
                    >
                      {savingFavorite === ex.id ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Heart
                          className={cn(
                            "h-5 w-5",
                            isFavorite(ex.id) && "fill-current"
                          )}
                        />
                      )}
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {ex.primaryMuscles.slice(0, 2).map((muscle, index) => (
                      <Badge key={muscle.id || index} variant="outline" className="border-gray-700 text-gray-300">
                        {muscle.nameEs || muscle.nameEn}
                      </Badge>
                    ))}
                    {ex.equipment.slice(0, 1).map((equip, index) => (
                      <Badge key={equip.id || index} variant="outline" className="border-blue-700 text-blue-300">
                        {equip.nameEs || equip.nameEn}
                      </Badge>
                    ))}
                  </div>

                  {ex.descriptionEs && (
                    <p className="text-sm text-gray-400 mt-2">
                      {ex.descriptionEs.length > 80 ? 
                        `${ex.descriptionEs.substring(0, 80)}...` : 
                        ex.descriptionEs
                      }
                    </p>
                  )}
                </div>
              </div>

              {/* Instructions (expandable) */}
              {ex.instructions && (
                <details className="border-t border-gray-800">
                  <summary className="px-4 py-2 text-sm text-gray-400 cursor-pointer hover:bg-gray-900">
                    Ver instrucciones
                  </summary>
                  <div className="px-4 pb-4 text-sm text-gray-300">
                    <div className="space-y-1">
                      {ex.instructions.split('\n').map((instruction, idx) => (
                        <p key={idx}>{instruction}</p>
                      ))}
                    </div>
                    {ex.tips && ex.tips.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-800">
                        <p className="text-yellow-400 font-medium mb-2">💡 Consejos:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {ex.tips.map((tip, idx) => (
                            <li key={idx} className="text-gray-300">{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
