# Backend API - Entrenador Fitness

Backend completo para la plataforma de entrenamiento fitness con Next.js, Prisma y PostgreSQL.

## 🚀 Configuración Inicial

### 1. Variables de Entorno

Actualiza el archivo `.env` con tus credenciales:

```env
# Database (Neon Tech o PostgreSQL local)
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"

# NextAuth
NEXTAUTH_SECRET="genera-un-secreto-aleatorio"  # Ejecuta: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"

# UploadThing (obtén tus claves en https://uploadthing.com/dashboard)
UPLOADTHING_TOKEN="tu-token-aquí"
```

### 2. Migración de Base de Datos

```bash
# Generar cliente de Prisma
pnpm prisma generate

# Crear tablas en la base de datos
pnpm db:migrate

# Poblar con datos iniciales (admin + 5 planes)
pnpm db:seed
```

### 3. Iniciar Servidor

```bash
pnpm dev
```

El servidor estará disponible en `http://localhost:3000`

## 🔐 Credenciales Iniciales

Después del seed, usa estas credenciales para el admin:

- **Usuario:** `admin`
- **Contraseña:** `Admin123!`

## 📡 API Endpoints

### Autenticación

#### `POST /api/auth/signin`
Login con credenciales (NextAuth)

**Body:**
```json
{
  "username": "admin",
  "password": "Admin123!"
}
```

---

### APIs Públicas (sin autenticación)

#### `GET /api/plans`
Obtiene hasta 5 planes activos para mostrar en la página pública

**Respuesta:**
```json
[
  {
    "id": "uuid",
    "name": "Plan Básico",
    "description": "Plan para principiantes...",
    "durationDays": 30,
    "price": 50000,
    "features": "[\"Rutina personalizada\", \"Plan nutricional\"]"
  }
]
```

---

### APIs Admin (requiere role ADMIN)

#### `GET /api/admin/dashboard`
Dashboard con resumen de todos los usuarios y sus estados

**Respuesta:**
```json
{
  "summary": {
    "total": 10,
    "active": 5,
    "expiring": 2,
    "expired": 1,
    "noEnrollment": 2
  },
  "users": [...],
  "activeUsers": [...],
  "expiringUsers": [...],
  "expiredUsers": [...]
}
```

#### `POST /api/admin/users`
Crear nuevo usuario con credenciales auto-generadas

**Body:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "phone": "+56912345678"
}
```

**Respuesta:**
```json
{
  "id": "uuid",
  "name": "Juan Pérez",
  "username": "juanperez123",
  "password": "AbCd1234Ef",  // Solo se muestra en creación
  "email": "juan@example.com",
  "message": "Usuario creado exitosamente. Comparte las credenciales por WhatsApp."
}
```

#### `GET /api/admin/users`
Listar todos los usuarios con su última inscripción

#### `POST /api/admin/enrollments`
Asignar plan a usuario

**Body:**
```json
{
  "userId": "uuid",
  "planId": "uuid",
  "startDate": "2026-01-04T00:00:00.000Z"
}
```

#### `GET /api/admin/enrollments/[id]`
Ver detalles completos de una inscripción (progreso, documentos, videos, etc.)

#### `PATCH /api/admin/enrollments/[id]`
Actualizar fechas o estado de inscripción

**Body:**
```json
{
  "endDate": "2026-02-04T00:00:00.000Z",
  "status": "ACTIVE"  // ACTIVE, EXPIRING, EXPIRED
}
```

#### `POST /api/admin/enrollments/[id]/documents`
Subir PDF de dieta o rutina

**Body:**
```json
{
  "url": "https://uploadthing.com/...",
  "type": "DIET",  // o "ROUTINE"
  "filename": "dieta-enero.pdf"
}
```

#### `POST /api/admin/enrollments/[id]/media`
Subir foto inicial del usuario

**Body:**
```json
{
  "url": "https://uploadthing.com/...",
  "type": "INITIAL_PHOTO"
}
```

#### `POST /api/admin/comments`
Escribir comentario del entrenador

**Body:**
```json
{
  "enrollmentId": "uuid",
  "comment": "Excelente progreso esta semana..."
}
```

#### `GET /api/admin/comments?enrollmentId=xxx`
Ver todos los comentarios de una inscripción

---

### APIs Usuario (requiere role USER)

#### `GET /api/user/dashboard`
Dashboard del usuario con plan activo, documentos, progreso y días restantes

**Respuesta:**
```json
{
  "hasActiveEnrollment": true,
  "enrollment": {
    "id": "uuid",
    "status": "ACTIVE",
    "startDate": "2026-01-04",
    "endDate": "2026-02-03",
    "daysRemaining": 30,
    "daysSinceStart": 0,
    "nextReviewDay": 15,
    "canRecordProgress": true
  },
  "plan": {
    "name": "Plan Básico",
    "description": "...",
    "durationDays": 30
  },
  "documents": {
    "diet": { "url": "...", "filename": "..." },
    "routine": { "url": "...", "filename": "..." }
  },
  "media": {
    "initialPhoto": { "url": "..." },
    "day1Video": null,
    "finalVideo": null
  },
  "progress": [...],
  "trainerComments": [...]
}
```

#### `POST /api/user/progress`
Registrar progreso biweekly (solo días 0, 15, 30, 45, etc.)

**Body:**
```json
{
  "weight": 75.5,
  "bodyFat": 18.2,
  "muscleMass": 45.0,
  "measurements": "{\"chest\": 95, \"waist\": 80}",
  "notes": "Me siento con más energía"
}
```

#### `GET /api/user/progress`
Ver historial de progreso

#### `POST /api/user/exercises`
Registrar ejercicio realizado

**Body:**
```json
{
  "exerciseId": "uuid",
  "sets": 3,
  "reps": 12,
  "weight": 50.0,
  "completed": true,
  "notes": "Buena forma"
}
```

#### `GET /api/user/exercises?limit=50`
Ver historial de ejercicios

#### `POST /api/user/media`
Subir videos (día 1 o final)

**Body:**
```json
{
  "url": "https://uploadthing.com/...",
  "type": "DAY_1_VIDEO"  // o "FINAL_VIDEO"
}
```

---

### File Upload (UploadThing)

#### `POST /api/uploadthing`
Endpoint para subir archivos (PDFs, imágenes, videos)

**Tipos soportados:**
- `pdfUploader`: PDFs hasta 8MB (solo admin)
- `imageUploader`: Imágenes hasta 4MB
- `videoUploader`: Videos hasta 32MB

---

## 📊 Modelos de Datos

### User
- `id`, `name`, `email`, `username`, `passwordHash`, `phone`
- `role`: ADMIN | USER
- `createdAt`, `updatedAt`

### Plan
- `id`, `name`, `description`, `durationDays`, `price`, `features`
- `isActive`: boolean

### Enrollment
- `id`, `userId`, `planId`, `startDate`, `endDate`
- `status`: ACTIVE | EXPIRING | EXPIRED

### Progress
- `id`, `enrollmentId`, `recordDate`, `dayNumber`
- `weight`, `bodyFat`, `muscleMass`, `measurements`, `notes`

### Document
- `id`, `enrollmentId`, `type` (DIET | ROUTINE)
- `url`, `filename`

### Media
- `id`, `enrollmentId`, `type` (INITIAL_PHOTO | DAY_1_VIDEO | FINAL_VIDEO)
- `url`

### TrainerComment
- `id`, `enrollmentId`, `comment`, `createdAt`

### Exercise
- `id`, `name`, `description`, `category`, `difficulty`

### ExerciseLog
- `id`, `enrollmentId`, `exerciseId`, `logDate`
- `sets`, `reps`, `weight`, `completed`, `notes`

---

## 🔒 Seguridad

- **Autenticación:** NextAuth v5 con JWT
- **Passwords:** Hasheados con bcrypt (10 rounds)
- **Autorización:** Middleware verifica roles (ADMIN/USER)
- **Validación:** Zod schemas en todos los endpoints

---

## 🛠️ Scripts Útiles

```bash
# Desarrollo
pnpm dev

# Migración de base de datos
pnpm db:migrate

# Poblar base de datos
pnpm db:seed

# Interfaz visual de base de datos
pnpm db:studio

# Build para producción
pnpm build
pnpm start
```

---

## 📝 Flujo de Trabajo

### Admin crea usuario:
1. `POST /api/admin/users` → Genera username y password
2. Admin comparte credenciales por WhatsApp
3. `POST /api/admin/enrollments` → Asigna plan
4. `POST /api/admin/enrollments/[id]/documents` → Sube PDFs
5. `POST /api/admin/enrollments/[id]/media` → Sube foto inicial

### Usuario usa la app:
1. Login con credenciales recibidas
2. `GET /api/user/dashboard` → Ve su plan y documentos
3. `POST /api/user/progress` → Registra peso cada 15 días
4. `POST /api/user/exercises` → Marca ejercicios completados
5. `POST /api/user/media` → Sube videos día 1 y final

### Admin monitorea:
1. `GET /api/admin/dashboard` → Ve todos los usuarios
2. `GET /api/admin/enrollments/[id]` → Ve progreso detallado
3. `POST /api/admin/comments` → Escribe feedback

---

## 🚀 Próximos Pasos

1. Crear páginas frontend (login, dashboards)
2. Integrar componentes de UploadThing
3. Implementar gráficas de progreso
4. Agregar notificaciones (emails/WhatsApp)
5. Sistema de recordatorios automáticos

---

## 🆘 Troubleshooting

### Error de conexión a base de datos
- Verifica `DATABASE_URL` en `.env`
- Asegúrate que PostgreSQL esté corriendo
- Ejecuta `pnpm prisma generate`

### Error de autenticación
- Verifica `NEXTAUTH_SECRET` esté configurado
- Limpia cookies del navegador
- Revisa que el usuario exista en la BD

### Error al subir archivos
- Configura `UPLOADTHING_TOKEN` en `.env`
- Verifica límites de tamaño (PDF: 8MB, Video: 32MB)

---

## 📧 Contacto

Para dudas o soporte, contacta al desarrollador.
