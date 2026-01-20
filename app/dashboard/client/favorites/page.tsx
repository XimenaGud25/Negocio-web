"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Heart, Trash2, Plus, Loader2, Dumbbell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";

type FavoriteExercise = {
  id: string;
  exerciseApiId: string;
  exerciseName: string;
  exerciseNameEs: string | null;
  bodyPart: string;
  bodyPartEs: string | null;
  equipment: string;
  equipmentEs: string | null;
  target: string;
  targetEs: string | null;
  gifUrl: string | null;
  createdAt: string;
  progressLogs: ProgressLog[];
};

type ProgressLog = {
  id: string;
  sets: number;
  reps: number;
  weight: number | null;
  duration: number | null;
  notes: string | null;
  logDate: string;
};

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState<FavoriteExercise | null>(null);
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [savingLog, setSavingLog] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state for logging progress
  const [logForm, setLogForm] = useState({
    sets: "",
    reps: "",
    weight: "",
    notes: "",
  });

  const fetchFavorites = useCallback(async () => {
    try {
      const res = await fetch("/api/favorites?include=progress");
      if (res.ok) {
        const data = await res.json();
        setFavorites(data);
      }
    } catch (err) {
      console.error("Error loading favorites:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  // Eliminar de favoritos
  const removeFavorite = async (exerciseApiId: string) => {
    setDeletingId(exerciseApiId);
    try {
      const res = await fetch(`/api/favorites/${exerciseApiId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setFavorites((prev) => prev.filter((f) => f.exerciseApiId !== exerciseApiId));
      }
    } catch (err) {
      console.error("Error removing favorite:", err);
    } finally {
      setDeletingId(null);
    }
  };

  // Abrir diálogo para registrar progreso
  const openLogDialog = (exercise: FavoriteExercise) => {
    setSelectedExercise(exercise);
    setLogForm({ sets: "", reps: "", weight: "", notes: "" });
    setLogDialogOpen(true);
  };

  // Guardar progreso
  const saveProgress = async () => {
    if (!selectedExercise) return;
    if (!logForm.sets || !logForm.reps) {
      alert("Por favor ingresa series y repeticiones");
      return;
    }

    setSavingLog(true);
    try {
      const res = await fetch(`/api/favorites/${selectedExercise.exerciseApiId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sets: parseInt(logForm.sets),
          reps: parseInt(logForm.reps),
          weight: logForm.weight ? parseFloat(logForm.weight) : null,
          notes: logForm.notes || null,
        }),
      });

      if (res.ok) {
        const newLog = await res.json();
        // Actualizar el estado local
        setFavorites((prev) =>
          prev.map((f) =>
            f.id === selectedExercise.id
              ? { ...f, progressLogs: [newLog, ...f.progressLogs] }
              : f
          )
        );
        setLogDialogOpen(false);
      }
    } catch (err) {
      console.error("Error saving progress:", err);
    } finally {
      setSavingLog(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
        <span className="ml-2 text-gray-400">Cargando favoritos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Heart className="h-6 w-6 text-red-400" />
          Mis Ejercicios Favoritos
        </h1>
        <p className="text-gray-400 mt-1">
          Gestiona tus ejercicios favoritos y registra tu progreso
        </p>
      </div>

      {favorites.length === 0 ? (
        <Card className="bg-[#0f0f0f] border-gray-800">
          <CardContent className="py-12 text-center">
            <Heart className="h-12 w-12 text-gray-700 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              No tienes ejercicios favoritos
            </h3>
            <p className="text-gray-400 mb-4">
              Explora ejercicios y agrégalos a tus favoritos para trackear tu progreso
            </p>
            <Link href="/dashboard/client/exercises">
              <Button className="bg-yellow-400 text-black hover:bg-yellow-500">
                Explorar Ejercicios
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {favorites.map((fav) => (
            <Card key={fav.id} className="bg-[#0f0f0f] border-gray-800">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                  {/* Exercise GIF */}
                  <div className="flex-shrink-0">
                    {fav.gifUrl ? (
                      <img
                        src={fav.gifUrl}
                        alt={fav.exerciseNameEs || fav.exerciseName}
                        className="w-full sm:w-40 h-40 object-cover"
                      />
                    ) : (
                      <div className="w-full sm:w-40 h-40 bg-gray-900 flex items-center justify-center">
                        <Dumbbell className="h-12 w-12 text-gray-700" />
                      </div>
                    )}
                  </div>

                  {/* Exercise Details */}
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h2 className="font-bold text-lg text-yellow-400">
                          {fav.exerciseNameEs || fav.exerciseName}
                        </h2>
                        <p className="text-xs text-gray-500">{fav.exerciseName}</p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openLogDialog(fav)}
                          className="border-green-600 text-green-400 hover:bg-green-900/20"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Registrar
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFavorite(fav.exerciseApiId)}
                          disabled={deletingId === fav.exerciseApiId}
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        >
                          {deletingId === fav.exerciseApiId ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline" className="border-gray-700 text-gray-300">
                        {fav.bodyPartEs || fav.bodyPart}
                      </Badge>
                      <Badge variant="outline" className="border-gray-700 text-gray-300">
                        {fav.equipmentEs || fav.equipment}
                      </Badge>
                      <Badge variant="outline" className="border-gray-700 text-gray-300">
                        {fav.targetEs || fav.target}
                      </Badge>
                    </div>

                    {/* Recent Progress */}
                    {fav.progressLogs && fav.progressLogs.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-400 mb-2">Último registro:</p>
                        <div className="flex gap-4 text-sm">
                          <span className="text-white">
                            <strong>{fav.progressLogs[0].sets}</strong> series
                          </span>
                          <span className="text-white">
                            <strong>{fav.progressLogs[0].reps}</strong> reps
                          </span>
                          {fav.progressLogs[0].weight && (
                            <span className="text-white">
                              <strong>{fav.progressLogs[0].weight}</strong> kg
                            </span>
                          )}
                          <span className="text-gray-500">
                            {new Date(fav.progressLogs[0].logDate).toLocaleDateString("es")}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Log Progress Dialog */}
      <Dialog open={logDialogOpen} onOpenChange={setLogDialogOpen}>
        <DialogContent className="bg-[#0f0f0f] border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-yellow-400">
              Registrar Progreso
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedExercise?.exerciseNameEs || selectedExercise?.exerciseName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">
                  Series *
                </label>
                <Input
                  type="number"
                  placeholder="3"
                  value={logForm.sets}
                  onChange={(e) => setLogForm({ ...logForm, sets: e.target.value })}
                  className="bg-black border-gray-700 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">
                  Repeticiones *
                </label>
                <Input
                  type="number"
                  placeholder="12"
                  value={logForm.reps}
                  onChange={(e) => setLogForm({ ...logForm, reps: e.target.value })}
                  className="bg-black border-gray-700 text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">
                Peso (kg) - Opcional
              </label>
              <Input
                type="number"
                step="0.5"
                placeholder="20"
                value={logForm.weight}
                onChange={(e) => setLogForm({ ...logForm, weight: e.target.value })}
                className="bg-black border-gray-700 text-white"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">
                Notas - Opcional
              </label>
              <Input
                placeholder="Ej: Buena forma, aumentar peso próxima vez"
                value={logForm.notes}
                onChange={(e) => setLogForm({ ...logForm, notes: e.target.value })}
                className="bg-black border-gray-700 text-white"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setLogDialogOpen(false)}
              className="border-gray-700 text-gray-300"
            >
              Cancelar
            </Button>
            <Button
              onClick={saveProgress}
              disabled={savingLog}
              className="bg-yellow-400 text-black hover:bg-yellow-500"
            >
              {savingLog ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Guardando...
                </>
              ) : (
                "Guardar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
