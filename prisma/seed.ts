import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create admin user
  const adminPassword = await bcrypt.hash("Admin123!", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@entrenador.com" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@entrenador.com",
      username: "admin",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });

  console.log("✅ Admin user created:", admin.username);

  // Create 5 sample plans
  const plans = [
    {
      name: "Plan Básico",
      description: "Plan de entrenamiento básico para principiantes. Incluye rutina de ejercicios y plan nutricional personalizado.",
      durationDays: 30,
      price: 50000,
      features: JSON.stringify([
        "Rutina de ejercicios personalizada",
        "Plan nutricional básico",
        "Seguimiento cada 15 días",
        "Acceso a videos instructivos",
      ]),
      isActive: true,
    },
    {
      name: "Plan Intermedio",
      description: "Plan de 45 días con entrenamiento intensivo y asesoría nutricional completa.",
      durationDays: 45,
      price: 70000,
      features: JSON.stringify([
        "Rutina de ejercicios avanzada",
        "Plan nutricional completo",
        "Seguimiento cada 15 días",
        "Videos personalizados",
        "Comentarios del entrenador",
      ]),
      isActive: true,
    },
    {
      name: "Plan Avanzado",
      description: "Programa intensivo de 60 días para resultados máximos con seguimiento personalizado.",
      durationDays: 60,
      price: 100000,
      features: JSON.stringify([
        "Rutina de alto rendimiento",
        "Plan nutricional premium",
        "Seguimiento cada 15 días",
        "Asesoría personalizada",
        "Videos de progreso",
        "Análisis de composición corporal",
      ]),
      isActive: true,
    },
    {
      name: "Reto Fitness 90 Días",
      description: "Transformación completa en 90 días con seguimiento exhaustivo y apoyo constante.",
      durationDays: 90,
      price: 150000,
      features: JSON.stringify([
        "Rutina de transformación total",
        "Plan nutricional VIP",
        "Seguimiento cada 15 días",
        "Asesoría ilimitada",
        "Videos y fotos de progreso",
        "Mediciones corporales completas",
        "Soporte por WhatsApp",
      ]),
      isActive: true,
    },
    {
      name: "Plan Mantenimiento",
      description: "Plan mensual de mantenimiento para quienes ya alcanzaron sus objetivos.",
      durationDays: 30,
      price: 40000,
      features: JSON.stringify([
        "Rutina de mantenimiento",
        "Guía nutricional",
        "Seguimiento quincenal",
        "Ajustes según necesidad",
      ]),
      isActive: true,
    },
  ];

  for (const planData of plans) {
    const plan = await prisma.plan.upsert({
      where: { name: planData.name },
      update: {},
      create: planData,
    });
    console.log(`✅ Plan created: ${plan.name}`);
  }

  // Create sample exercises
  const exercises = [
    {
      name: "Sentadillas",
      description: "Ejercicio básico para piernas y glúteos",
      category: "LEGS",
      difficulty: "BEGINNER",
    },
    {
      name: "Press de Banca",
      description: "Ejercicio para pecho y tríceps",
      category: "CHEST",
      difficulty: "INTERMEDIATE",
    },
    {
      name: "Peso Muerto",
      description: "Ejercicio compuesto para espalda y piernas",
      category: "BACK",
      difficulty: "ADVANCED",
    },
    {
      name: "Dominadas",
      description: "Ejercicio para espalda y bíceps",
      category: "BACK",
      difficulty: "INTERMEDIATE",
    },
    {
      name: "Plancha",
      description: "Ejercicio isométrico para core",
      category: "CORE",
      difficulty: "BEGINNER",
    },
  ];

  for (const exerciseData of exercises) {
    const exercise = await prisma.exercise.upsert({
      where: { name: exerciseData.name },
      update: {},
      create: exerciseData,
    });
    console.log(`✅ Exercise created: ${exercise.name}`);
  }

  console.log("🎉 Database seeded successfully!");
  console.log("\n📋 Admin credentials:");
  console.log("   Username: admin");
  console.log("   Password: Admin123!");
  console.log("\n🔗 Login at: http://localhost:3000/login");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
