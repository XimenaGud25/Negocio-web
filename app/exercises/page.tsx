"use client";

import React, { useState, useEffect } from "react";

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
  instructions: string[];
};

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Load exercises once on mount (no filters)
  useEffect(() => {
    fetchExercises();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchExercises = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append("limit", "30");

      const url = `/api/exercises${params.toString() ? `?${params.toString()}` : ""}`;
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
  };

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto bg-[#0f0f0f] rounded-lg p-6">
        <h1 className="text-2xl font-extrabold mb-6 text-yellow-400">Ejercicios</h1>

        {/* Search Filter */}
        {/* No filters: show all exercises (limit 30) */}
        <div className="mb-6">
          <p className="text-sm text-gray-400">Mostrando ejercicios en español (sin filtros).</p>
        </div>

        {/* Loading/Error states */}
        {loading && <p className="text-gray-400 text-center py-8">Cargando ejercicios...</p>}
        {error && <p className="text-red-400 text-center py-8">{error}</p>}

        {/* Results */}
        {!loading && !error && exercises.length === 0 && (
          <p className="text-gray-500 text-center py-8">No se encontraron ejercicios. Intenta con otros filtros.</p>
        )}

        <ul className="grid gap-4">
          {exercises.map((ex) => (
            <li key={ex.id} className="p-4 bg-black rounded-md border border-gray-800 flex gap-4">
              {/* Exercise GIF */}
              {ex.gifUrl ? (
                <img 
                  src={ex.gifUrl} 
                  alt={ex.name_es} 
                  className="w-32 h-32 object-cover rounded flex-shrink-0"
                />
              ) : (
                <div className="w-32 h-32 bg-gray-900 rounded flex items-center justify-center text-xs text-gray-500 flex-shrink-0">
                  Sin imagen
                </div>
              )}

              {/* Exercise Details */}
              <div className="flex-1">
                <h2 className="font-bold text-lg text-yellow-400 mb-2">{ex.name_es}</h2>
                <p className="text-xs text-gray-500 mb-2">{ex.name}</p>
                
                <div className="flex gap-2 mb-2">
                  <span className="px-2 py-1 text-xs bg-gray-800 rounded">
                    {ex.bodyPart_es}
                  </span>
                  <span className="px-2 py-1 text-xs bg-gray-800 rounded">
                    {ex.equipment_es}
                  </span>
                </div>
                
                <p className="text-sm text-gray-400 mb-2">
                  <strong>Músculo principal:</strong> {ex.target_es}
                </p>

                {ex.secondaryMuscles && ex.secondaryMuscles.length > 0 && (
                  <p className="text-sm text-gray-400 mb-2">
                    <strong>Músculos secundarios:</strong> {ex.secondaryMuscles.join(", ")}
                  </p>
                )}

                {ex.instructions && ex.instructions.length > 0 && (
                  <div className="text-sm text-gray-300 mt-3">
                    <strong className="text-white">Instrucciones:</strong>
                    <ol className="list-decimal list-inside mt-1 space-y-1">
                      {ex.instructions.slice(0, 3).map((instruction, idx) => (
                        <li key={idx}>{instruction}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
