# 📦 Sistema de Subida de Documentos a AWS S3 - Resumen Ejecutivo

## ✅ ¿Qué se implementó?

He creado un sistema completo de subida de documentos a AWS S3 similar al de tu API de ejercicios. Ahora tienes dos opciones para subir documentos:

1. **Upload directo al servidor** (actual mejorado) - El servidor sube a S3
2. **Upload con Presigned URLs** - El cliente sube directamente a S3

---

## 📂 Archivos Creados/Modificados

### Servicios Core
- ✅ **lib/s3.ts** - Ampliado con métodos para documentos
  - `getPresignedUploadUrl()` - Genera URL pre-firmada para subida
  - `uploadDirect()` - Sube archivo directamente a S3
  - `deleteFile()` - Elimina archivo de S3
  - `getMultiplePresignedUrls()` - Múltiples URLs

### Endpoints API
- ✅ **app/api/uploads/presign/route.ts** - Genera URLs pre-firmadas
- ✅ **app/api/uploads/document/route.ts** - Upload/delete directo
- ✅ **app/api/uploads/download-url/route.ts** - Ya existía (descarga)
- ✅ **app/api/admin/documents/route.ts** - Modificado para usar S3

### Componentes React
- ✅ **components/DocumentUploader.tsx** - Componente de ejemplo
  - Soporta ambos métodos de upload
  - Hook `useDocumentDownloadUrl()`

### Documentación
- ✅ **DOCUMENTS_S3_UPLOAD.md** - Documentación completa de la API
- ✅ **AWS_S3_SETUP.md** - Guía de configuración de AWS
- ✅ **.env.example** - Variables de entorno requeridas
- ✅ **scripts/migrate-documents-to-s3.ts** - Script de migración

### Dependencias
- ✅ **uuid** - Instalado para nombres únicos de archivos

---

## 🚀 Cómo Empezar

### 1. Configurar AWS S3

Sigue la guía en [AWS_S3_SETUP.md](./AWS_S3_SETUP.md):

1. Crear bucket en AWS S3
2. Configurar CORS
3. Crear usuario IAM y obtener credenciales
4. Configurar variables de entorno

### 2. Variables de Entorno

Crea `.env.local` con estas variables:

```env
S3_BUCKET=gym-exercises-images
AWS_S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=tu-access-key
AWS_SECRET_ACCESS_KEY=tu-secret-key
S3_PRESIGNED_URL_EXPIRES=3600
```

### 3. Usar el Sistema

#### Opción A: Upload Directo (Recomendado para empezar)

```typescript
const formData = new FormData();
formData.append('enrollmentId', enrollmentId);
formData.append('dietFile', pdfFile);

const response = await fetch('/api/admin/documents', {
  method: 'POST',
  body: formData
});

const { documents } = await response.json();
```

#### Opción B: Presigned URL (Para archivos grandes)

```typescript
// 1. Obtener URL pre-firmada
const { uploadUrl, fileUrl } = await fetch('/api/uploads/presign', {
  method: 'POST',
  body: JSON.stringify({
    filename: file.name,
    contentType: file.type,
    folder: 'documents'
  })
}).then(r => r.json());

// 2. Subir a S3
await fetch(uploadUrl, {
  method: 'PUT',
  body: file
});

// 3. Guardar fileUrl en tu BD
```

### 4. Migrar Documentos Existentes (Opcional)

Si tienes documentos en `/public/uploads/documents`:

```bash
pnpm tsx scripts/migrate-documents-to-s3.ts
```

---

## 🎯 Endpoints Disponibles

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/admin/documents` | POST | Sube documentos a S3 (dieta, rutina, reporte) |
| `/api/uploads/presign` | POST | Genera URL pre-firmada para upload |
| `/api/uploads/document` | POST | Sube archivo individual a S3 |
| `/api/uploads/document` | DELETE | Elimina archivo de S3 |
| `/api/uploads/download-url` | GET/POST | Obtiene URL pre-firmada para descarga |

Consulta [DOCUMENTS_S3_UPLOAD.md](./DOCUMENTS_S3_UPLOAD.md) para ejemplos detallados.

---

## 🔐 Tipos de Archivo Permitidos

### Documentos
- `application/pdf` - PDFs
- `image/jpeg` - JPG/JPEG
- `image/png` - PNG
- `image/webp` - WebP
- `image/gif` - GIF

### Ejercicios (ya existente)
- `image/jpeg`, `image/png`, `image/webp`, `image/gif`

---

## 🧩 Componente de Ejemplo

Usa el componente `DocumentUploader`:

```tsx
import { DocumentUploader } from '@/components/DocumentUploader';

function MyPage() {
  return (
    <DocumentUploader 
      enrollmentId="enrollment-123"
      onSuccess={() => console.log('¡Documentos subidos!')}
    />
  );
}
```

---

## 📊 Flujo de Trabajo

### Método 1: Upload Directo (Actual Mejorado)

```
Cliente → Next.js API → AWS S3 → PostgreSQL → Cliente
```

1. Cliente envía FormData a `/api/admin/documents`
2. Servidor valida y sube a S3
3. Servidor guarda URL en PostgreSQL
4. Respuesta con documentos guardados

### Método 2: Presigned URL (Más Rápido)

```
Cliente → Next.js API (presign) → Cliente → AWS S3 → PostgreSQL
```

1. Cliente pide URL pre-firmada
2. Cliente sube directamente a S3
3. Cliente guarda referencia en BD (o servidor lo hace)

---

## 🔍 Diferencias con Sistema de Ejercicios

Tu backend de NestJS tiene:
```typescript
uploadDirect(buffer, filename, contentType, folder)
getPresignedUploadUrl(filename, contentType, folder)
getPresignedDownloadUrl(key, customExpiresIn)
```

Este sistema Next.js tiene lo mismo en `S3Service`:
```typescript
S3Service.uploadDirect(buffer, filename, contentType, folder)
S3Service.getPresignedUploadUrl(filename, contentType, folder)
S3Service.getDownloadUrl(keyOrUrl, expiresIn)
```

**Compatible** con la misma estructura que ya conoces ✅

---

## 💡 Ventajas

✅ **Sin cambios en frontend actual** - `/api/admin/documents` sigue funcionando igual  
✅ **Escalable** - S3 maneja millones de archivos  
✅ **Seguro** - URLs pre-firmadas con expiración  
✅ **Flexible** - 2 métodos de upload según necesidad  
✅ **Económico** - Pagas solo por almacenamiento y transferencia  
✅ **Compatible** - Misma arquitectura que tu API de ejercicios  

---

## 📚 Documentación Completa

- **[DOCUMENTS_S3_UPLOAD.md](./DOCUMENTS_S3_UPLOAD.md)** - Guía completa de la API
- **[AWS_S3_SETUP.md](./AWS_S3_SETUP.md)** - Configuración paso a paso de AWS
- **[.env.example](./.env.example)** - Variables de entorno

---

## 🐛 Solución Rápida de Problemas

### "Access Denied"
→ Verifica credenciales AWS en `.env.local`

### "CORS Error"
→ Configura CORS en tu bucket S3 (ver AWS_S3_SETUP.md)

### "No se pudo subir"
→ Verifica que el tipo de archivo sea permitido

### "URL expirada"
→ Genera nueva URL pre-firmada (expiran en 1 hora por defecto)

---

## 🎉 ¡Listo para Usar!

1. ✅ Configura AWS S3 (10 minutos)
2. ✅ Agrega variables de entorno
3. ✅ Prueba con `/api/admin/documents`
4. ✅ (Opcional) Migra documentos existentes

**Tu sistema ya está listo para subir documentos a S3** 🚀

---

## 📞 Próximos Pasos

Si necesitas:
- ✨ Ajustar tipos de archivo permitidos → Modifica `ALLOWED_DOCUMENT_TYPES` en `lib/s3.ts`
- ✨ Cambiar tiempo de expiración → Modifica `S3_PRESIGNED_URL_EXPIRES` en `.env`
- ✨ Agregar validación de tamaño → Agrega en endpoints antes de subir
- ✨ Múltiples buckets → Agrega variables `S3_BUCKET_DOCUMENTS` y `S3_BUCKET_EXERCISES`

¿Preguntas? Consulta la documentación completa o házmelas saber.
