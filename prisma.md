# 📊 Modelo de Base de Datos - Plataforma de Entrenamiento

## 📦 Instalación de Prisma
```bash
# 1. Instalar dependencias
pnpm add -D prisma
pnpm add @prisma/client

# 2. Inicializar Prisma con PostgreSQL
pnpm dlx prisma init --datasource-provider postgresql
```

Esto crea:
- `prisma/schema.prisma` - archivo de esquema (es como poner CREATE TABLE pero en lenguaje Prisma)
- `.env` - archivo de variables de entorno (son variables que se usan en todo el proyecto y quedan ocultas para otras personas)

---

## ⚙️ Configuración Inicial
### 1. Configurar `.env`
```env
#Aquí vamos a poner la variable de neontech (por eso se ocultan para que nadie más entre a la BD)
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
```

### 2. Archivo de Cliente (`lib/prisma.ts`)
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**¿Por qué?** Evita crear múltiples conexiones en desarrollo (hot reload de Next.js).

---
## 🗂️ Estructura del Modelo de Datos
### **9 Modelos Principales**
#### 1. **User** - Usuarios del Sistema
```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  password      String
  name          String
  role          Role     @default(USER)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Relaciones
  enrollments       Enrollment[]
  commentsReceived  TrainerComment[]
}

enum Role {
  ADMIN
  USER
}
```
**Campos importantes:**
- `role`: Define si es ADMIN (crea usuarios) o USER (cliente)
- No hay registro público, solo admin crea cuentas
- `password`: Se hashea con bcrypt antes de guardar

---
#### 2. **Plan** - Planes de Entrenamiento
```prisma
model Plan {
  id            String   @id @default(cuid())
  name          String
  description   String   @db.Text
  durationDays  Int
  price         Decimal  @db.Decimal(10, 2)
  features      String[]
  isActive      Boolean  @default(true)
  displayOrder  Int      @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  enrollments   Enrollment[]
}
```
**Características:**
- Hasta 5 planes públicos
- `features`: Array de características (ej: ["Dieta personalizada", "3 sesiones/semana"])
- `displayOrder`: Para ordenar en la página pública
- `isActive`: Ocultar planes sin eliminarlos

---
#### 3. **Enrollment** - Inscripción a Plan (Ciclo)
```prisma
model Enrollment {
  id             String           @id @default(cuid())
  userId         String
  planId         String
  startDate      DateTime
  endDate        DateTime
  status         EnrollmentStatus @default(ACTIVE)
  currentCycle   Int              @default(1)
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt
  
  user           User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  plan           Plan             @relation(fields: [planId], references: [id])
  
  progress       Progress[]
  media          Media[]
  documents      Document[]
  exerciseLogs   ExerciseLog[]
  comments       TrainerComment[]
}

enum EnrollmentStatus {
  ACTIVE
  EXPIRING
  EXPIRED
}
```
**Lógica de Ciclos:**
- Un usuario puede tener múltiples `Enrollment` (ciclos históricos)
- `currentCycle`: Incrementa con cada renovación
- `status`:
  - `ACTIVE`: Plan vigente
  - `EXPIRING`: Faltan 7 días o menos
  - `EXPIRED`: Ya terminó
- **Bloqueo automático**: Usuario no puede acceder a ciclo `EXPIRED`

---
#### 4. **Progress** - Mediciones cada 15 días
```prisma
model Progress {
  id           String     @id @default(cuid())
  enrollmentId String
  dayNumber    Int
  weight       Decimal?   @db.Decimal(5, 2)
  bodyFat      Decimal?   @db.Decimal(4, 2)
  muscleMass   Decimal?   @db.Decimal(5, 2)
  measurements Json?
  notes        String?    @db.Text
  recordedAt   DateTime   @default(now())
  
  enrollment   Enrollment @relation(fields: [enrollmentId], references: [id], onDelete: Cascade)
  
  @@unique([enrollmentId, dayNumber])
}
```
**Restricciones:**
- `@@unique([enrollmentId, dayNumber])`: Solo un registro por día permitido
- `dayNumber`: 1, 15, 30, 45, 60, 75, 90...
- `measurements`: JSON flexible para circunferencias (cintura, brazo, pierna, etc)

**Validación en backend:**
```typescript
// Solo permitir días múltiplos de 15 o día 1
const allowedDays = [1, 15, 30, 45, 60, 75, 90];
if (!allowedDays.includes(dayNumber)) {
  throw new Error("Solo puedes registrar progreso en días 1, 15, 30...");
}
```
---
#### 5. **Media** - Fotos y Videos
```prisma
model Media {
  id           String    @id @default(cuid())
  enrollmentId String
  type         MediaType
  fileUrl      String
  fileName     String
  fileSize     Int
  uploadedAt   DateTime  @default(now())
  
  enrollment   Enrollment @relation(fields: [enrollmentId], references: [id], onDelete: Cascade)
  
  @@unique([enrollmentId, type])
}

enum MediaType {
  INITIAL_PHOTO
  DAY_1_VIDEO
  FINAL_VIDEO
}
```
**Límites:**
- `@@unique([enrollmentId, type])`: Solo 1 foto inicial, 1 video día 1, 1 video final
- Máximo 3 archivos multimedia por ciclo
- `fileSize`: Para validar tamaño antes de subir
---
#### 6. **Document** - PDFs de Dieta y Rutina
```prisma
model Document {
  id           String       @id @default(cuid())
  enrollmentId String
  type         DocumentType
  fileUrl      String
  fileName     String
  uploadedAt   DateTime     @default(now())
  
  enrollment   Enrollment   @relation(fields: [enrollmentId], references: [id], onDelete: Cascade)
  
  @@unique([enrollmentId, type])
}

enum DocumentType {
  DIET
  ROUTINE
}
```
**Uso:**
- Admin sube PDF de dieta y PDF de rutina
- Usuario solo puede descargar
- `@@unique`: Solo 1 dieta y 1 rutina por ciclo

---
#### 7. **ExerciseLog** - Registro de Ejercicios
```prisma
model ExerciseLog {
  id           String     @id @default(cuid())
  enrollmentId String
  exerciseId   String?
  exerciseName String
  date         DateTime
  sets         Int
  reps         Int
  weight       Decimal?   @db.Decimal(6, 2)
  completed    Boolean    @default(false)
  notes        String?    @db.Text
  
  enrollment   Enrollment @relation(fields: [enrollmentId], references: [id], onDelete: Cascade)
  exercise     Exercise?  @relation(fields: [exerciseId], references: [id])
}
```
**Opción A (Recomendada - MVP):**
- Admin sube PDF de rutina
- Usuario marca ejercicios como "realizado"
- Ingresa peso, reps manualmente
- `exerciseName`: Nombre libre (sin catálogo)

**Opción B (Fase Avanzada):**
- `exerciseId`: Relación con catálogo `Exercise`
- Buscador de ejercicios con imágenes

---
#### 8. **Exercise** - Catálogo de Ejercicios (OPCIONAL)
```prisma
model Exercise {
  id          String   @id @default(cuid())
  name        String
  description String?  @db.Text
  imageUrl    String?
  muscleGroup String?
  difficulty  String?
  createdAt   DateTime @default(now())
  
  logs        ExerciseLog[]
}
```
**Para fase 2:**
- Admin crea catálogo de ejercicios
- Incluye imágenes y descripciones
- Usuario puede buscar y seleccionar

---

#### 9. **TrainerComment** - Comentarios del Entrenador
```prisma
model TrainerComment {
  id           String     @id @default(cuid())
  enrollmentId String
  userId       String
  content      String     @db.Text
  createdAt    DateTime   @default(now())
  
  enrollment   Enrollment @relation(fields: [enrollmentId], references: [id], onDelete: Cascade)
  user         User       @relation(fields: [userId], references: [id])
}
```
**Flujo:**
- Admin escribe observaciones sobre el progreso
- Usuario solo puede leer (no editar/responder)
- Organizado por ciclo (enrollment)

---
## 🚀 Comandos Prisma Esenciales

### Crear la Base de Datos
```bash
# Primera migración (crea todas las tablas)
pnpm prisma migrate dev --name init
```

### Sincronizar Cambios al Schema
```bash
# Después de modificar schema.prisma
pnpm prisma migrate dev --name nombre_descriptivo
```

### Generar Cliente TypeScript
```bash
# Actualiza tipos después de cambios al schema
pnpm prisma generate
```

### Abrir Prisma Studio (GUI)
```bash
# Visualiza y edita datos en el navegador
pnpm prisma studio
```

### Reset Completo (DESARROLLO)
```bash
# CUIDADO: Borra todos los datos
pnpm prisma migrate reset
```

### Deploy a Producción
```bash
# Aplica migraciones sin seed
pnpm prisma migrate deploy
```

---

## 📊 Diagrama de Relaciones

```
User (1) ──────< Enrollment (N)
               │
               ├──< Progress (N)
               ├──< Media (0-3)
               ├──< Document (0-2)
               ├──< ExerciseLog (N)
               └──< TrainerComment (N)

Plan (1) ──────< Enrollment (N)

Exercise (1) ──< ExerciseLog (N) [OPCIONAL]
```

---

## 🔐 Seguridad y Validaciones
(Esto es lo que por qué usar prisma es más fácil que postgres normal, ya tiene funciones para 
muchas cosas y no tener que hacer todos los SELECT desde cero)
### Hashear Contraseñas
```typescript
import bcrypt from 'bcryptjs';

// Al crear usuario
const hashedPassword = await bcrypt.hash(password, 10);

// Al verificar login
const isValid = await bcrypt.compare(password, user.password);
```

### Verificar Rol Admin
```typescript
// Middleware de Next.js API Route
if (user.role !== 'ADMIN') {
  return res.status(403).json({ error: 'No autorizado' });
}
```

### Bloquear Acceso a Ciclos Expirados
```typescript
const enrollment = await prisma.enrollment.findFirst({
  where: {
    userId: user.id,
    status: 'ACTIVE'
  }
});

if (!enrollment) {
  return { error: 'Plan expirado. Contacta al entrenador.' };
}
```

---

## 📝 Seed Inicial (Datos de Prueba)

Crea `prisma/seed.ts`:
```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@entrenador.com',
      password: await bcrypt.hash('admin123', 10),
      name: 'Admin Principal',
      role: 'ADMIN'
    }
  });

  // Planes de ejemplo
  const plan1 = await prisma.plan.create({
    data: {
      name: 'Plan Básico',
      description: 'Perfecto para comenzar tu transformación',
      durationDays: 30,
      price: 999.00,
      features: [
        'Dieta personalizada',
        'Rutina de entrenamiento',
        'Seguimiento cada 15 días'
      ],
      displayOrder: 1
    }
  });

  const plan2 = await prisma.plan.create({
    data: {
      name: 'Plan Premium',
      description: 'Resultados garantizados en 3 meses',
      durationDays: 90,
      price: 2499.00,
      features: [
        'Dieta + suplementación',
        'Rutina avanzada',
        'Videos personalizados',
        'Acceso a grupo privado'
      ],
      displayOrder: 2
    }
  });

  console.log('✅ Seed completado:', { admin, plan1, plan2 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Ejecutar:
```bash
pnpm prisma db seed
```

---

## 🎨 Ejemplo de Uso en Next.js

### Crear Usuario (Admin)
```typescript
// app/api/admin/users/route.ts
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  const { email, password, name, planId } = await req.json();
  
  const user = await prisma.user.create({
    data: {
      email,
      password: await bcrypt.hash(password, 10),
      name,
      role: 'USER',
      enrollments: {
        create: {
          planId,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 días
          status: 'ACTIVE'
        }
      }
    }
  });
  
  return Response.json(user);
}
```

### Ver Dashboard Usuario
```typescript
// app/dashboard/page.tsx
import { prisma } from '@/lib/prisma';

export default async function DashboardPage({ userId }: { userId: string }) {
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      userId,
      status: 'ACTIVE'
    },
    include: {
      plan: true,
      progress: {
        orderBy: { dayNumber: 'asc' }
      },
      documents: true,
      media: true
    }
  });

  const daysRemaining = Math.ceil(
    (enrollment.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div>
      <h1>Bienvenido, {enrollment.user.name}</h1>
      <p>Plan: {enrollment.plan.name}</p>
      <p>Días restantes: {daysRemaining}</p>
      {/* Renderizar progreso, PDFs, etc */}
    </div>
  );
}
```

---

## 🔄 Flujo de Renovación de Plan

```typescript
// Cuando expira un plan
async function renewEnrollment(userId: string, planId: string) {
  // 1. Marcar actual como EXPIRED
  await prisma.enrollment.updateMany({
    where: {
      userId,
      status: { in: ['ACTIVE', 'EXPIRING'] }
    },
    data: { status: 'EXPIRED' }
  });

  // 2. Crear nuevo ciclo
  const nextCycle = await prisma.enrollment.findFirst({
    where: { userId },
    orderBy: { currentCycle: 'desc' }
  });

  return await prisma.enrollment.create({
    data: {
      userId,
      planId,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      currentCycle: (nextCycle?.currentCycle || 0) + 1,
      status: 'ACTIVE'
    }
  });
}
```

---

## 📌 Checklist de Implementación

- [x] Instalar Prisma
- [x] Configurar `.env`
- [x] Crear modelos en `schema.prisma`
- [x] Primera migración
- [x] Crear cliente singleton
- [ ] Implementar autenticación (NextAuth o custom)
- [ ] CRUD de usuarios (admin)
- [ ] CRUD de planes
- [ ] Dashboard usuario
- [ ] Dashboard admin
- [ ] Subida de archivos (local o cloud)
- [ ] Gráficas de progreso
- [ ] Sistema de notificaciones (email 7 días antes)
- [ ] Deploy a producción

---

## 🆘 Comandos de Troubleshooting

```bash
# Ver estado de migraciones
pnpm prisma migrate status

# Formatear schema.prisma
pnpm prisma format

# Ver logs de Prisma
pnpm prisma studio --browser=none

# Regenerar cliente si hay errores
rm -rf node_modules/.prisma && pnpm prisma generate
```