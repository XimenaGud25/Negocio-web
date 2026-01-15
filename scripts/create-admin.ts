/**
 * Script para crear un usuario administrador inicial
 * Ejecutar con: pnpm tsx scripts/create-admin.ts
 */

import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth";

const prisma = new PrismaClient();

async function main() {
  const username = "admin";
  const password = "admin123"; // Cambiar después del primer login
  const name = "Administrador";
  const email = "admin@fitnessparalavida.com";

  console.log("🔐 Creando usuario administrador...");

  // Verificar si ya existe
  const existingUser = await prisma.user.findUnique({
    where: { username },
  });

  if (existingUser) {
    console.log("⚠️  El usuario 'admin' ya existe.");
    console.log("Usuario:", existingUser.username);
    console.log("Nombre:", existingUser.name);
    console.log("Role:", existingUser.role);
    return;
  }

  // Hash de la contraseña
  const passwordHash = await hashPassword(password);

  // Crear usuario
  const adminUser = await prisma.user.create({
    data: {
      username,
      passwordHash,
      name,
      email,
      role: "ADMIN",
    },
  });

  console.log("✅ Usuario administrador creado exitosamente!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Username:", username);
  console.log("Password:", password);
  console.log("Name:", adminUser.name);
  console.log("Role:", adminUser.role);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("⚠️  IMPORTANTE: Cambia la contraseña después del primer login");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
