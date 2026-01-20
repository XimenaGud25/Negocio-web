import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Dumbbell, Heart, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Prisma } from "@prisma/client";

// Type for user with relations
type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    enrollments: {
      include: {
        plan: true;
        progress: true;
      };
    };
    favoriteExercises: {
      include: {
        progressLogs: true;
      };
    };
  };
}>;

export default async function ClientDashboardPage() {
  const session = await getServerSession(authOptions);

  // Obtener datos del usuario
  const user = await prisma.user.findUnique({
    where: { id: session?.user?.id },
    include: {
      enrollments: {
        where: { status: { in: ["ACTIVE", "EXPIRING"] } },
        include: {
          plan: true,
          progress: {
            orderBy: { dayNumber: "desc" },
            take: 1,
          },
        },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      favoriteExercises: {
        include: {
          progressLogs: {
            orderBy: { logDate: "desc" },
            take: 5,
          },
        },
      },
    },
  }) as UserWithRelations | null;

  const activeEnrollment = user?.enrollments[0];
  const favoriteCount = user?.favoriteExercises?.length || 0;
  
  // Calcular días restantes
  const daysRemaining = activeEnrollment 
    ? Math.max(0, Math.ceil((new Date(activeEnrollment.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  // Calcular progreso del plan
  const totalDays = activeEnrollment?.plan?.durationDays || 1;
  const daysCompleted = totalDays - daysRemaining;
  const progressPercent = Math.min(100, Math.round((daysCompleted / totalDays) * 100));

  // Contar logs de ejercicios esta semana
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const weeklyLogs = user?.favoriteExercises?.reduce((acc: number, fav) => {
    return acc + fav.progressLogs.filter(log => new Date(log.logDate) >= weekAgo).length;
  }, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          ¡Hola, {session?.user?.name || "Usuario"}! 👋
        </h1>
        <p className="text-gray-400 mt-1">
          Bienvenido a tu panel de entrenamiento
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#0f0f0f] border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Plan Activo
            </CardTitle>
            <Calendar className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-white">
              {activeEnrollment?.plan?.name || "Sin plan"}
            </div>
            {activeEnrollment && (
              <p className="text-xs text-gray-500 mt-1">
                {daysRemaining} días restantes
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#0f0f0f] border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Progreso del Plan
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-white">{progressPercent}%</div>
            <Progress value={progressPercent} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="bg-[#0f0f0f] border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Ejercicios Favoritos
            </CardTitle>
            <Heart className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-white">{favoriteCount}</div>
            <p className="text-xs text-gray-500 mt-1">
              ejercicios guardados
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#0f0f0f] border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Esta Semana
            </CardTitle>
            <Dumbbell className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-white">{weeklyLogs}</div>
            <p className="text-xs text-gray-500 mt-1">
              entrenamientos registrados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/dashboard/client/exercises">
          <Card className="bg-[#0f0f0f] border-gray-800 hover:border-yellow-400/50 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-yellow-400" />
                Explorar Ejercicios
              </CardTitle>
              <CardDescription className="text-gray-400">
                Descubre nuevos ejercicios y agrégalos a tus favoritos
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/dashboard/client/progress">
          <Card className="bg-[#0f0f0f] border-gray-800 hover:border-yellow-400/50 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-400" />
                Ver Mi Progreso
              </CardTitle>
              <CardDescription className="text-gray-400">
                Revisa tus estadísticas y avances en el entrenamiento
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Recent Favorites */}
      {user?.favoriteExercises && user.favoriteExercises.length > 0 && (
        <Card className="bg-[#0f0f0f] border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-400" />
              Ejercicios Favoritos Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {user.favoriteExercises.slice(0, 3).map((fav) => (
                <div
                  key={fav.id}
                  className="flex items-center gap-3 p-3 bg-black rounded-lg border border-gray-800"
                >
                  {fav.gifUrl && (
                    <img
                      src={fav.gifUrl}
                      alt={fav.exerciseNameEs || fav.exerciseName}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {fav.exerciseNameEs || fav.exerciseName}
                    </p>
                    <Badge variant="outline" className="text-xs mt-1 border-gray-700 text-gray-400">
                      {fav.targetEs || fav.target}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            {user.favoriteExercises.length > 3 && (
              <Link
                href="/dashboard/client/favorites"
                className="block text-center text-yellow-400 hover:text-yellow-300 text-sm mt-4"
              >
                Ver todos los favoritos →
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
