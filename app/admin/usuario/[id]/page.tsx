"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  User,
  Mail,
  Phone,
  Calendar,
  Dumbbell,
  BarChart3,
  TrendingUp,
  Loader2,
  Video,
  FileText,
} from "lucide-react";
import { UserVideosModal } from "@/components/UserVideosModal";
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

type UserData = {
  id: string;
  name: string;
  email: string | null;
  username: string;
  phone: string | null;
  createdAt: string;
  enrollments: Array<{
    id: string;
    status: string;
    startDate: string;
    endDate: string;
    plan: {
      name: string;
      durationDays: number;
    };
  }>;
  favoriteExercises: FavoriteWithProgress[];
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

export default function UsuarioDetalle() {
  const params = useParams();
  const userId = params?.id as string;

  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("30");
  const [showVideosModal, setShowVideosModal] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch(`/api/admin/users/${userId}?include=enrollments,favorites,progress`);
        if (res.ok) {
          const data = await res.json();
          setUserData(data);
        }
      } catch (err) {
        console.error("Error loading user data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  // Filtrar por fecha
  const filterByDate = useCallback((logs: ProgressLog[]) => {
    const days = parseInt(dateRange);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return logs.filter((log) => new Date(log.logDate) >= cutoff);
  }, [dateRange]);

  // Datos para el gráfico de progreso de peso
  const weightProgressData = useMemo(() => {
    if (!userData?.favoriteExercises) return [];

    const exercise = selectedExercise === "all" 
      ? null 
      : userData.favoriteExercises.find(f => f.id === selectedExercise);

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

    // Agregado de todos los ejercicios
    const allLogs: { date: string; weight: number; count: number }[] = [];
    userData?.favoriteExercises.forEach(fav => {
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
    }));
  }, [userData, selectedExercise, filterByDate]);

  // Datos para el gráfico de entrenamientos por semana
  const workoutsPerWeek = useMemo(() => {
    if (!userData?.favoriteExercises) return [];

    const weeks: Record<string, number> = {};
    
    userData.favoriteExercises.forEach(fav => {
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
  }, [userData, filterByDate]);

  // Estadísticas generales
  const stats = useMemo(() => {
    if (!userData?.favoriteExercises) {
      return { totalWorkouts: 0, totalVolume: 0, maxWeight: 0, totalSets: 0 };
    }

    let totalWorkouts = 0;
    let totalVolume = 0;
    let maxWeight = 0;
    let totalSets = 0;

    userData.favoriteExercises.forEach(fav => {
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
  }, [userData, filterByDate]);

  // Historial de todos los logs
  const allLogs = useMemo(() => {
    if (!userData?.favoriteExercises) return [];

    const logs: (ProgressLog & { exerciseName: string })[] = [];
    
    userData.favoriteExercises.forEach(fav => {
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
  }, [userData, selectedExercise, filterByDate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
        <span className="ml-2 text-gray-600">Cargando datos del usuario...</span>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-gray-900">Usuario no encontrado</h2>
      </div>
    );
  }

  const activeEnrollment = userData.enrollments.find(e => e.status === "ACTIVE");
  const daysRemaining = activeEnrollment 
    ? Math.max(0, Math.ceil((new Date(activeEnrollment.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <section className="max-w-7xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            Perfil de {userData.name}
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona la información y progreso del usuario
          </p>
        </div>
        <Link href="/admin">
          <Button variant="outline">Volver al Admin</Button>
        </Link>
      </div>

      {/* User Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Información Personal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Email:</span>
              <span className="text-sm font-medium">{userData.email || userData.username}</span>
            </div>
            {userData.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Teléfono:</span>
                <span className="text-sm font-medium">{userData.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Miembro desde:</span>
              <span className="text-sm font-medium">
                {new Date(userData.createdAt).toLocaleDateString("es")}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Plan Activo</CardTitle>
          </CardHeader>
          <CardContent>
            {activeEnrollment ? (
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Plan:</span>
                  <p className="text-lg font-bold">{activeEnrollment.plan.name}</p>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Días restantes:</span>
                  <Badge variant={daysRemaining > 7 ? "default" : "destructive"}>
                    {daysRemaining} días
                  </Badge>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(activeEnrollment.startDate).toLocaleDateString("es")} - {new Date(activeEnrollment.endDate).toLocaleDateString("es")}
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Sin plan activo</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <Button className="bg-yellow-400 hover:bg-yellow-500 text-black">
              <FileText className="h-4 w-4 mr-2" />
              Subir Documentos
            </Button>
            <Button 
              variant="outline"
              onClick={() => setShowVideosModal(true)}
            >
              <Video className="h-4 w-4 mr-2" />
              Ver Videos
            </Button>
          </div>
        </CardContent>
      </Card>



      {/* Videos Modal */}
      <UserVideosModal
        open={showVideosModal}
        onOpenChange={setShowVideosModal}
        userId={userId}
        userName={userData.name}
      />
    </section>
  );
}