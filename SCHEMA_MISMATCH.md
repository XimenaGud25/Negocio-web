# ⚠️ CRITICAL: Schema Mismatches Detected

## Problema

El código de las APIs fue creado asumiendo ciertos nombres de campos que **NO coinciden** con el schema Prisma actual. Esto causará errores al ejecutar.

## Opciones

### Opción 1: Actualizar el Schema Prisma (RECOMENDADO)

Modificar `prisma/schema.prisma` para que coincida con el código de las APIs:

```prisma
model User {
  // ... otros campos
  password  String   @map("passwordHash")  // Renombrar en DB
  phone     String?  // Agregar campo teléfono
}

model Plan {
  // ... otros campos
  duration    Int   @map("durationDays")  // Renombrar en DB
}

model Progress {
  // ... otros campos
  recordedAt   DateTime @default(now()) @map("recordDate")
}

model Media {
  // ... otros campos
  filePath     String @map("url")  // Renombrar en DB
}

model Document {
  type         DocumentType  // Cambiar valores del enum
  filePath     String @map("url")
  fileName     String @map("filename")
}

enum DocumentType {
  DIET      // en vez de DIET_PDF
  ROUTINE   // en vez de ROUTINE_PDF
}

model ExerciseLog {
  performedAt  DateTime @default(now()) @map("logDate")
}
```

**Después ejecutar:**
```bash
pnpm prisma migrate dev --name fix-field-names
pnpm prisma generate
```

### Opción 2: Actualizar TODO el código de las APIs

Cambiar en TODOS los archivos de `app/api/`:

- `user.passwordHash` → `user.password`
- `user.phone` → eliminar (no existe)
- `plan.durationDays` → `plan.duration`
- `progress.recordDate` → `progress.recordedAt`
- `media.url` → `media.filePath`
- `document.url` → `document.filePath`
- `document.filename` → `document.fileName`
- `document.type: "DIET"` → `"DIET_PDF"`
- `document.type: "ROUTINE"` → `"ROUTINE_PDF"`
- `exerciseLog.logDate` → `exerciseLog.performedAt`

**Archivos afectados (23 archivos):**
- lib/auth.ts
- app/api/auth/[...nextauth]/route.ts  
- app/api/admin/users/route.ts
- app/api/admin/enrollments/route.ts
- app/api/admin/enrollments/[id]/route.ts
- app/api/admin/enrollments/[id]/documents/route.ts
- app/api/admin/enrollments/[id]/media/route.ts
- app/api/admin/dashboard/route.ts
- app/api/user/dashboard/route.ts
- app/api/user/progress/route.ts
- app/api/user/exercises/route.ts
- app/api/user/media/route.ts
- prisma/seed.ts

## Decisión Requerida

**¿Qué prefieres?**

1. **Actualizar Schema** (más rápido, menos cambios) - Te proporciono el schema corregido
2. **Actualizar código de APIs** (más trabajo) - Corrijo los 23 archivos

Por favor indica cuál opción prefieres antes de continuar.

## Errores Actuales (61 errores TypeScript)

La mayoría son:
- `passwordHash` no existe (usar `password`)
- `phone` no existe en User  
- `durationDays` no existe (usar `duration`)
- `recordDate` no existe (usar `recordedAt`)
- `url` no existe en Media/Document (usar `filePath`)
- `logDate` no existe (usar `performedAt`)
- Tipos de enum incorrectos (`DIET` vs `DIET_PDF`)

## Próximos Pasos

1. **Decide qué opción elegir**
2. Aplicamos los cambios
3. Ejecutamos `pnpm prisma generate`
4. Ejecutamos `pnpm db:migrate`
5. Ejecutamos `pnpm db:seed`
6. Probamos las APIs

---

**NOTA:** No puedes ejecutar la migración hasta resolver esto.
