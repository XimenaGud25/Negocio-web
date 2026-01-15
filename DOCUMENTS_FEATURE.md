# Sistema de Gestión de Documentos

## Funcionalidad de Subida de PDFs

### Descripción
Sistema para subir y gestionar documentos PDF (dietas y rutinas) asociados a inscripciones de usuarios.

### Características

#### 1. Subir Documentos al Crear Usuario
- En `/admin/usuarios/crear`, se pueden subir PDFs de dieta y rutina
- Los archivos se suben automáticamente después de crear el usuario y asignarle un plan
- Los PDFs quedan asociados a la inscripción del usuario

#### 2. Gestionar Documentos al Editar Usuario
- En `/admin/usuarios/[id]`, se muestran todos los documentos existentes
- Se pueden ver, descargar y eliminar documentos
- Se pueden subir nuevos documentos en cualquier momento

### Estructura de Archivos

```
public/
  uploads/
    documents/         # Almacenamiento de PDFs
      .gitignore       # Evita subir archivos al repositorio
```

### API Endpoints

#### POST `/api/admin/documents`
Sube nuevos documentos (dieta o rutina)

**Body (FormData):**
- `enrollmentId`: ID de la inscripción
- `dietFile`: (opcional) Archivo PDF de dieta
- `routineFile`: (opcional) Archivo PDF de rutina

**Response:**
```json
{
  "message": "Documentos subidos exitosamente",
  "documents": [...]
}
```

#### GET `/api/admin/documents?enrollmentId={id}`
Obtiene todos los documentos de una inscripción

**Response:**
```json
{
  "documents": [
    {
      "id": "...",
      "type": "DIET" | "ROUTINE",
      "filename": "dieta.pdf",
      "url": "/uploads/documents/diet_xxx.pdf",
      "fileSize": 12345,
      "createdAt": "2025-01-15T..."
    }
  ]
}
```

#### DELETE `/api/admin/documents?documentId={id}`
Elimina un documento específico

**Response:**
```json
{
  "message": "Documento eliminado exitosamente"
}
```

### Tipos de Documentos

- **DIET**: Planes de alimentación
- **ROUTINE**: Rutinas de ejercicio

### Base de Datos

Los documentos se guardan en la tabla `Document`:

```prisma
model Document {
  id           String      @id @default(cuid())
  enrollment   Enrollment  @relation(fields: [enrollmentId], references: [id], onDelete: Cascade)
  enrollmentId String
  type         DocumentType
  filename     String
  url          String
  fileSize     Int
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
}

enum DocumentType {
  DIET
  ROUTINE
}
```

### Seguridad

- Solo usuarios con rol `ADMIN` pueden gestionar documentos
- Los documentos se almacenan en `public/uploads/documents/`
- Los archivos se nombran de forma única: `{type}_{enrollmentId}_{timestamp}.pdf`
- Los archivos no se suben al repositorio Git (.gitignore configurado)

### Validaciones

- Solo se aceptan archivos PDF
- Los archivos deben estar asociados a una inscripción válida
- Requiere autenticación y rol de administrador

### Uso

1. **Crear usuario con documentos:**
   - Completar formulario de usuario
   - Asignar plan (requerido para subir documentos)
   - Seleccionar archivos PDF de dieta y/o rutina
   - Enviar formulario

2. **Gestionar documentos existentes:**
   - Ir a editar usuario
   - Ver documentos en la sección "Documentos (Dietas y Rutinas)"
   - Descargar, eliminar o subir nuevos documentos

### Notas Técnicas

- Los archivos se guardan en el sistema de archivos local
- Para producción, considerar usar un servicio de almacenamiento en la nube (AWS S3, Cloudinary, etc.)
- El tamaño máximo de archivo está limitado por la configuración de Next.js
- Los documentos se eliminan de la BD pero no del sistema de archivos (implementar limpieza manual si es necesario)
