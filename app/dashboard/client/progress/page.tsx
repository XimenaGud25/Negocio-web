"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { BarChart3, TrendingUp, Calendar, Dumbbell, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from "recharts";
import Link from "next/link";

type ProgressLog = {
  id: string;
  sets: number;
  reps: number;
  weight: number | null;
  duration: number | null;
  notes: string | null;
  logDate: string;
};

type FavoriteWithProgress = {
  id: string;
  exerciseApiId: string;
  exerciseName: string;
  exerciseNameEs: string | null;
  bodyPart: string;
  bodyPartEs: string | null;
  target: string;
  targetEs: string | null;
  gifUrl: string | null;
  progressLogs: ProgressLog[];
};

const chartConfig: ChartConfig = {
  weight: {
    label: "Peso (kg)",
    color: "#facc15",
  },
  volume: {
    label: "Volumen",
    color: "#22c55e",
  },
  workouts: {
    label: "Entrenamientos",
    color: "#3b82f6",
  },
};

export default function ProgressPage() {
  const [favorites, setFavorites] = useState<FavoriteWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("30");

  const fetchProgress = useCallback(async () => {
    try {
      const res = await fetch("/api/favorites?include=progress");
      if (res.ok) {
        const data = await res.json();
        setFavorites(data);
      }
    } catch (err) {
      console.error("Error loading progress:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  // Filtrar por fecha
  const filterByDate = useCallback((logs: ProgressLog[]) => {
    const days = parseInt(dateRange);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return logs.filter((log) => new Date(log.logDate) >= cutoff);
  }, [dateRange]);

  // Datos para el gráfico de progreso de peso
  const weightProgressData = useMemo(() => {
    const exercise = selectedExercise === "all" 
      ? null 
      : favorites.find(f => f.id === selectedExercise);

    if (exercise) {
      const logs = filterByDate(exercise.progressLogs)
        .filter(log => log.weight)
        .sort((a, b) => new Date(a.logDate).getTime() - new Date(b.logDate).getTime());

      return logs.map(log => ({
        date: new Date(log.logDate).toLocaleDateString("es", { day: "2-digit", month: "short" }),
        weight: log.weight,
        volume: log.sets * log.reps * (log.weight || 1),
      }));
    }

    // Agregado de todos los ejercicios - promedio de peso por día
    const allLogs: { date: string; weight: number; count: number }[] = [];
    favorites.forEach(fav => {
      filterByDate(fav.progressLogs).forEach(log => {
        if (log.weight) {
          const dateStr = new Date(log.logDate).toLocaleDateString("es", { day: "2-digit", month: "short" });
          const existing = allLogs.find(l => l.date === dateStr);
          if (existing) {
            existing.weight += log.weight;
            existing.count += 1;
          } else {
            allLogs.push({ date: dateStr, weight: log.weight, count: 1 });
          }
        }
      });
    });

    return allLogs.map(l => ({
      date: l.date,
      weight: Math.round((l.weight / l.count) * 10) / 10,
      volume: 0,
    })).sort((a, b) => {
      // Ordenar por fecha
      const [dayA, monthA] = a.date.split(" ");
      const [dayB, monthB] = b.date.split(" ");
      return parseInt(dayA) - parseInt(dayB);
    });
  }, [favorites, selectedExercise, filterByDate]);

  // Datos para el gráfico de entrenamientos por semana
  const workoutsPerWeek = useMemo(() => {
    const weeks: Record<string, number> = {};
    
    favorites.forEach(fav => {
      filterByDate(fav.progressLogs).forEach(log => {
        const date = new Date(log.logDate);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekKey = weekStart.toLocaleDateString("es", { day: "2-digit", month: "short" });
        weeks[weekKey] = (weeks[weekKey] || 0) + 1;
      });
    });

    return Object.entries(weeks).map(([week, count]) => ({
      week,
      workouts: count,
    }));
  }, [favorites, filterByDate]);

  // Estadísticas generales
  const stats = useMemo(() => {
    let totalWorkouts = 0;
    let totalVolume = 0;
    let maxWeight = 0;
    let totalSets = 0;

    favorites.forEach(fav => {
      const logs = filterByDate(fav.progressLogs);
      totalWorkouts += logs.length;
      logs.forEach(log => {
        totalSets += log.sets;
        const volume = log.sets * log.reps * (log.weight || 1);
        totalVolume += volume;
        if (log.weight && log.weight > maxWeight) {
          maxWeight = log.weight;
        }
      });
    });

    return { totalWorkouts, totalVolume, maxWeight, totalSets };
  }, [favorites, filterByDate]);

  // Historial de todos los logs
  const allLogs = useMemo(() => {
    const logs: (ProgressLog & { exerciseName: string })[] = [];
    
    favorites.forEach(fav => {
      const filteredLogs = selectedExercise === "all" || fav.id === selectedExercise
        ? filterByDate(fav.progressLogs)
        : [];
      
      filteredLogs.forEach(log => {
        logs.push({
          ...log,
          exerciseName: fav.exerciseNameEs || fav.exerciseName,
        });
      });
    });

    return logs.sort((a, b) => new Date(b.logDate).getTime() - new Date(a.logDate).getTime());
  }, [favorites, selectedExercise, filterByDate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
        <span className="ml-2 text-gray-400">Cargando progreso...</span>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-green-400" />
            Mi Progreso
          </h1>
        </div>
        
        <Card className="bg-[#0f0f0f] border-gray-800">
          <CardContent className="py-12 text-center">
            <TrendingUp className="h-12 w-12 text-gray-700 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              No hay datos de progreso
            </h3>
            <p className="text-gray-400 mb-4">
              Agrega ejercicios a favoritos y registra tu progreso para ver estadísticas
            </p>
            <Link href="/dashboard/client/exercises">
              <button className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-500">
                Explorar Ejercicios
              </button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-green-400" />
          Mi Progreso
        </h1>
        <p className="text-gray-400 mt-1">
          Visualiza tu progreso en los ejercicios favoritos
        </p>
      </div>

      {/* Filters */}
      <Card className="bg-[#0f0f0f] border-gray-800">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4 text-gray-500" />
              <Select value={selectedExercise} onValueChange={setSelectedExercise}>
                <SelectTrigger className="w-[250px] bg-black border-gray-700 text-white">
                  <SelectValue placeholder="Ejercicio" />
                </SelectTrigger>
                <SelectContent className="bg-black border-gray-700">
                  <SelectItem value="all" className="text-white hover:bg-gray-800">
                    Todos los ejercicios
                  </SelectItem>
                  {favorites.map((fav) => (
                    <SelectItem
                      key={fav.id}
                      value={fav.id}
                      className="text-white hover:bg-gray-800"
                    >
                      {fav.exerciseNameEs || fav.exerciseName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[180px] bg-black border-gray-700 text-white">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent className="bg-black border-gray-700">
                  <SelectItem value="7" className="text-white hover:bg-gray-800">
                    Últimos 7 días
                  </SelectItem>
                  <SelectItem value="30" className="text-white hover:bg-gray-800">
                    Últimos 30 días
                  </SelectItem>
                  <SelectItem value="90" className="text-white hover:bg-gray-800">
                    Últimos 3 meses
                  </SelectItem>
                  <SelectItem value="365" className="text-white hover:bg-gray-800">
                    Último año
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-[#0f0f0f] border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Entrenamientos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalWorkouts}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#0f0f0f] border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Series Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalSets}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#0f0f0f] border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Volumen Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {Math.round(stats.totalVolume).toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">kg × reps</p>
          </CardContent>
        </Card>

        <Card className="bg-[#0f0f0f] border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Peso Máximo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.maxWeight} kg</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts & Table Tabs */}
      <Tabs defaultValue="charts" className="space-y-4">
        <TabsList className="bg-[#0f0f0f] border border-gray-800">
          <TabsTrigger value="charts" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
            Gráficos
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
            Historial
          </TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-4">
          {/* Weight Progress Chart */}
          {weightProgressData.length > 0 && (
            <Card className="bg-[#0f0f0f] border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Progreso de Peso</CardTitle>
                <CardDescription className="text-gray-400">
                  Evolución del peso levantado por sesión
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <LineChart data={weightProgressData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="date" stroke="#666" fontSize={12} />
                    <YAxis stroke="#666" fontSize={12} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="var(--color-weight)"
                      strokeWidth={2}
                      dot={{ fill: "var(--color-weight)" }}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          )}

          {/* Workouts per Week Chart */}
          {workoutsPerWeek.length > 0 && (
            <Card className="bg-[#0f0f0f] border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Entrenamientos por Semana</CardTitle>
                <CardDescription className="text-gray-400">
                  Frecuencia de entrenamientos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <BarChart data={workoutsPerWeek}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="week" stroke="#666" fontSize={12} />
                    <YAxis stroke="#666" fontSize={12} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="workouts"
                      fill="var(--color-workouts)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history">
          <Card className="bg-[#0f0f0f] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Historial de Entrenamientos</CardTitle>
              <CardDescription className="text-gray-400">
                Registro detallado de tus ejercicios
              </CardDescription>
            </CardHeader>
            <CardContent>
              {allLogs.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No hay registros en este período
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800">
                      <TableHead className="text-gray-400">Fecha</TableHead>
                      <TableHead className="text-gray-400">Ejercicio</TableHead>
                      <TableHead className="text-gray-400 text-center">Series</TableHead>
                      <TableHead className="text-gray-400 text-center">Reps</TableHead>
                      <TableHead className="text-gray-400 text-center">Peso</TableHead>
                      <TableHead className="text-gray-400">Notas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allLogs.slice(0, 20).map((log) => (
                      <TableRow key={log.id} className="border-gray-800">
                        <TableCell className="text-gray-300">
                          {new Date(log.logDate).toLocaleDateString("es", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell className="text-white font-medium">
                          {log.exerciseName}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="border-gray-700 text-gray-300">
                            {log.sets}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="border-gray-700 text-gray-300">
                            {log.reps}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center text-yellow-400">
                          {log.weight ? `${log.weight} kg` : "-"}
                        </TableCell>
                        <TableCell className="text-gray-500 max-w-[200px] truncate">
                          {log.notes || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
