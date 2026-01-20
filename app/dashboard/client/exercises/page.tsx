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
  name: string;
  name_es: string;
  bodyPart: string;
  bodyPart_es: string;
  equipment: string;
  equipment_es: string;
  target: string;
  target_es: string;
  gifUrl: string;
  secondaryMuscles: string[];
  secondaryMuscles_es: string[];
  instructions: string[];
  instructions_es: string[];
};

type FavoriteExercise = {
  id: string;
  exerciseApiId: string;
};

const bodyParts = [
  { value: "all", label: "Todas las partes" },
  { value: "back", label: "Espalda" },
  { value: "cardio", label: "Cardio" },
  { value: "chest", label: "Pecho" },
  { value: "lower arms", label: "Antebrazos" },
  { value: "lower legs", label: "Piernas inferiores" },
  { value: "neck", label: "Cuello" },
  { value: "shoulders", label: "Hombros" },
  { value: "upper arms", label: "Brazos superiores" },
  { value: "upper legs", label: "Piernas superiores" },
  { value: "waist", label: "Cintura" },
];

export default function ClientExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [favorites, setFavorites] = useState<FavoriteExercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [bodyPartFilter, setBodyPartFilter] = useState("all");
  const [savingFavorite, setSavingFavorite] = useState<string | null>(null);

  // Cargar ejercicios
  const fetchExercises = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append("limit", "50");
      if (bodyPartFilter && bodyPartFilter !== "all") {
        params.append("bodyPart", bodyPartFilter);
      }

      const url = `/api/exercises?${params.toString()}`;
      const res = await fetch(url);

      if (!res.ok) {
        throw new Error("Error al cargar ejercicios");
      }

      const data = await res.json();
      setExercises(data);
    } catch (err) {
      setError((err as Error).message);
      setExercises([]);
    } finally {
      setLoading(false);
    }
  }, [bodyPartFilter]);

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

  useEffect(() => {
    fetchExercises();
    fetchFavorites();
  }, [fetchExercises, fetchFavorites]);

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
            exerciseName: exercise.name,
            exerciseNameEs: exercise.name_es,
            bodyPart: exercise.bodyPart,
            bodyPartEs: exercise.bodyPart_es,
            equipment: exercise.equipment,
            equipmentEs: exercise.equipment_es,
            target: exercise.target,
            targetEs: exercise.target_es,
            gifUrl: exercise.gifUrl,
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
  const filteredExercises = exercises.filter((ex) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      ex.name_es.toLowerCase().includes(term) ||
      ex.name.toLowerCase().includes(term) ||
      ex.target_es.toLowerCase().includes(term) ||
      ex.bodyPart_es.toLowerCase().includes(term)
    );
  });

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
              <Select value={bodyPartFilter} onValueChange={setBodyPartFilter}>
                <SelectTrigger className="w-[200px] bg-black border-gray-700 text-white">
                  <SelectValue placeholder="Parte del cuerpo" />
                </SelectTrigger>
                <SelectContent className="bg-black border-gray-700">
                  {bodyParts.map((part) => (
                    <SelectItem
                      key={part.value}
                      value={part.value}
                      className="text-white hover:bg-gray-800"
                    >
                      {part.label}
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
                {/* Exercise GIF */}
                <div className="flex-shrink-0">
                  {ex.gifUrl ? (
                    <img
                      src={ex.gifUrl}
                      alt={ex.name_es}
                      className="w-32 h-32 object-cover"
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
                        {ex.name_es}
                      </h2>
                      <p className="text-xs text-gray-500 truncate">{ex.name}</p>
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
                    <Badge variant="outline" className="border-gray-700 text-gray-300">
                      {ex.bodyPart_es}
                    </Badge>
                    <Badge variant="outline" className="border-gray-700 text-gray-300">
                      {ex.equipment_es}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-400 mt-2">
                    <strong>Músculo:</strong> {ex.target_es}
                  </p>
                </div>
              </div>

              {/* Instructions (expandable) */}
              {ex.instructions_es && ex.instructions_es.length > 0 && (
                <details className="border-t border-gray-800">
                  <summary className="px-4 py-2 text-sm text-gray-400 cursor-pointer hover:bg-gray-900">
                    Ver instrucciones ({ex.instructions_es.length} pasos)
                  </summary>
                  <div className="px-4 pb-4 text-sm text-gray-300">
                    <ol className="list-decimal list-inside space-y-1">
                      {ex.instructions_es.map((instruction, idx) => (
                        <li key={idx}>{instruction}</li>
                      ))}
                    </ol>
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
