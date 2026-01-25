"use client";

import React, { useState, useEffect } from "react";

type Exercise = {
  id: string;
  nameEs: string;
  nameEn: string;
  descriptionEs: string;
  descriptionEn: string;
  instructions: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipment: string[];
  variations: string[];
  tips: string[];
  images?: string[];
  createdAt?: string;
  updatedAt?: string;
};

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedMuscle, setSelectedMuscle] = useState<string>("all");
  const [selectedEquipment, setSelectedEquipment] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [muscles, setMuscles] = useState<any[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);
  
  // Load filters data
  useEffect(() => {
    fetchFiltersData();
  }, []);
  
  // Load exercises when filters change
  useEffect(() => {
    fetchExercises();
  }, [searchTerm, selectedDifficulty, selectedMuscle, selectedEquipment, currentPage]);

  const fetchFiltersData = async () => {
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
  };

  const fetchExercises = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append("limit", "12");
      params.append("page", currentPage.toString());
      
      if (searchTerm) {
        params.append("search", searchTerm);
      }
      
      if (selectedDifficulty !== "all") {
        params.append("difficulty", selectedDifficulty);
      }
      
      if (selectedMuscle !== "all") {
        params.append("muscleId", selectedMuscle);
      }
      
      if (selectedEquipment !== "all") {
        params.append("equipmentId", selectedEquipment);
      }

      const url = `/api/exercises?${params.toString()}`;
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error("Error al cargar ejercicios");
      }

      const data = await res.json();
      
      // Handle different response formats from the API
      if (data.exercises) {
        setExercises(data.exercises);
        setTotalPages(data.totalPages || 1);
      } else if (Array.isArray(data)) {
        setExercises(data);
        setTotalPages(Math.ceil(data.length / 12));
      } else {
        setExercises([]);
      }
    } catch (err) {
      setError((err as Error).message);
      setExercises([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchExercises();
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedDifficulty("all");
    setSelectedMuscle("all");
    setSelectedEquipment("all");
    setCurrentPage(1);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-600';
      case 'intermediate': return 'bg-yellow-600';
      case 'advanced': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold mb-8 text-yellow-400">Biblioteca de Ejercicios</h1>

        {/* Filtros */}
        <div className="bg-[#0f0f0f] rounded-lg p-6 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Búsqueda */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium mb-2">
                Buscar ejercicios
              </label>
              <input
                id="search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nombre del ejercicio..."
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              />
            </div>
            
            {/* Filtros en grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="difficulty" className="block text-sm font-medium mb-2">
                  Dificultad
                </label>
                <select
                  id="difficulty"
                  value={selectedDifficulty}
                  onChange={(e) => {
                    setSelectedDifficulty(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                >
                  <option value="all">Todas las dificultades</option>
                  <option value="beginner">Principiante</option>
                  <option value="intermediate">Intermedio</option>
                  <option value="advanced">Avanzado</option>
                </select>
              </div>

              <div>
                <label htmlFor="muscle" className="block text-sm font-medium mb-2">
                  Grupo muscular
                </label>
                <select
                  id="muscle"
                  value={selectedMuscle}
                  onChange={(e) => {
                    setSelectedMuscle(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                >
                  <option value="all">Todos los músculos</option>
                  {muscles.map((muscle) => (
                    <option key={muscle.id} value={muscle.id}>
                      {muscle.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="equipment" className="block text-sm font-medium mb-2">
                  Equipamiento
                </label>
                <select
                  id="equipment"
                  value={selectedEquipment}
                  onChange={(e) => {
                    setSelectedEquipment(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                >
                  <option value="all">Todo el equipamiento</option>
                  {equipment.map((equip) => (
                    <option key={equip.id} value={equip.id}>
                      {equip.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-yellow-500 text-black font-medium rounded-md hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Buscando..." : "Buscar"}
              </button>
              
              <button
                type="button"
                onClick={resetFilters}
                className="px-6 py-2 bg-gray-700 text-white font-medium rounded-md hover:bg-gray-600 transition-colors"
              >
                Limpiar filtros
              </button>
            </div>
          </form>
        </div>

        {/* Estados de carga y error */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
            <p className="mt-4 text-gray-400">Cargando ejercicios...</p>
          </div>
        )}
        
        {error && (
          <div className="text-center py-12">
            <p className="text-red-400">{error}</p>
            <button 
              onClick={fetchExercises}
              className="mt-4 px-4 py-2 bg-yellow-500 text-black rounded-md hover:bg-yellow-400"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Resultados */}
        {!loading && !error && exercises.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No se encontraron ejercicios con los filtros seleccionados.</p>
          </div>
        )}

        {/* Lista de ejercicios */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {exercises.map((exercise) => (
            <div key={exercise.id} className="bg-[#0f0f0f] rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-colors">
              {/* Header del ejercicio */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-yellow-400 mb-1">{exercise.nameEs}</h2>
                  <p className="text-sm text-gray-400">{exercise.nameEn}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full text-white ${getDifficultyColor(exercise.difficulty)}`}>
                  {exercise.difficulty === 'beginner' ? 'Principiante' : 
                   exercise.difficulty === 'intermediate' ? 'Intermedio' : 'Avanzado'}
                </span>
              </div>

              {/* Imagen del ejercicio */}
              {exercise.images && exercise.images.length > 0 ? (
                <img 
                  src={exercise.images[0]} 
                  alt={exercise.nameEs}
                  className="w-full h-48 object-cover rounded-md mb-4"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-48 bg-gray-900 rounded-md mb-4 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Sin imagen disponible</span>
                </div>
              )}

              {/* Descripción */}
              {exercise.descriptionEs && (
                <p className="text-gray-300 text-sm mb-4 leading-relaxed">{exercise.descriptionEs}</p>
              )}

              {/* Músculos */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-white mb-2">Músculos trabajados:</h3>
                <div className="flex flex-wrap gap-2">
                  {exercise.primaryMuscles.map((muscle, index) => (
                    <span key={index} className="px-2 py-1 bg-yellow-600 text-black text-xs rounded-full font-medium">
                      {muscle}
                    </span>
                  ))}
                  {exercise.secondaryMuscles.map((muscle, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-700 text-gray-200 text-xs rounded-full">
                      {muscle}
                    </span>
                  ))}
                </div>
              </div>

              {/* Equipamiento */}
              {exercise.equipment && exercise.equipment.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-white mb-2">Equipamiento:</h3>
                  <div className="flex flex-wrap gap-2">
                    {exercise.equipment.map((equip, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-900 text-blue-200 text-xs rounded">
                        {equip}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Instrucciones */}
              {exercise.instructions && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-white mb-2">Instrucciones:</h3>
                  <div className="text-sm text-gray-300 space-y-1">
                    {exercise.instructions.split('\n').map((instruction, index) => (
                      <p key={index} className="leading-relaxed">{instruction}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Consejos */}
              {exercise.tips && exercise.tips.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-white mb-2">Consejos:</h3>
                  <ul className="text-sm text-gray-300 space-y-1">
                    {exercise.tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-yellow-400 text-xs mt-1">💡</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Variaciones */}
              {exercise.variations && exercise.variations.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-white mb-2">Variaciones:</h3>
                  <div className="flex flex-wrap gap-2">
                    {exercise.variations.map((variation, index) => (
                      <span key={index} className="px-2 py-1 bg-purple-900 text-purple-200 text-xs rounded">
                        {variation}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            
            <span className="px-4 py-2 bg-yellow-500 text-black rounded-md font-medium">
              {currentPage} de {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
