# 📦 Sistema de Documentos AWS S3 - Inicio Rápido

> Sistema completo de subida de documentos a AWS S3 para tu aplicación de entrenamiento

## 🎯 ¿Qué es esto?

Un sistema de almacenamiento en la nube (AWS S3) para documentos de clientes:
- 📄 **Dietas** (PDF)
- 📋 **Rutinas** (PDF)  
- 📊 **Reportes** (Imágenes)

Reemplaza el almacenamiento local en `/public/uploads/documents` por almacenamiento profesional en AWS S3.

---

## ⚡ Inicio Rápido (5 pasos)

### 1️⃣ Configura AWS S3 (15 min)

Sigue la guía completa: **[AWS_S3_SETUP.md](./AWS_S3_SETUP.md)**

**Resumen:**
- Crea bucket en AWS S3
- Configura CORS
- Crea usuario IAM
- Obtén credenciales (Access Key ID + Secret Key)

### 2️⃣ Configura Variables de Entorno

Crea `.env.local` con:

```env
S3_BUCKET=gym-exercises-images
AWS_S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/...
S3_PRESIGNED_URL_EXPIRES=3600
```

### 3️⃣ Instala Dependencias

```bash
pnpm install
# uuid ya está instalado ✅
```

### 4️⃣ Prueba el Sistema

**Opción A: Usa el endpoint actual (más simple)**

```typescript
const formData = new FormData();
formData.append('enrollmentId', enrollmentId);
formData.append('dietFile', pdfFile);

const response = await fetch('/api/admin/documents', {
  method: 'POST',
  body: formData
});
```

**Opción B: Usa Presigned URLs (más rápido)**

```typescript
// 1. Pide URL pre-firmada
const { uploadUrl } = await fetch('/api/uploads/presign', {
  method: 'POST',
  body: JSON.stringify({
    filename: file.name,
    contentType: file.type,
    folder: 'documents'
  })
}).then(r => r.json());

// 2. Sube directo a S3
await fetch(uploadUrl, {
  method: 'PUT',
  body: file
});
```

### 5️⃣ (Opcional) Migra Documentos Existentes

Si tienes documentos en `/public/uploads/documents`:

```bash
pnpm tsx scripts/migrate-documents-to-s3.ts
```

---

## 📚 Documentación Completa

| Archivo | Descripción |
|---------|-------------|
| **[RESUMEN_S3_IMPLEMENTATION.md](./RESUMEN_S3_IMPLEMENTATION.md)** | 📋 Resumen ejecutivo de todo |
| **[DOCUMENTS_S3_UPLOAD.md](./DOCUMENTS_S3_UPLOAD.md)** | 📡 Documentación completa de la API |
| **[AWS_S3_SETUP.md](./AWS_S3_SETUP.md)** | ⚙️ Configuración paso a paso de AWS |
| **[TESTING_S3.md](./TESTING_S3.md)** | 🧪 Guías de testing y ejemplos |
| **[.env.example](./.env.example)** | 🔐 Variables de entorno requeridas |

---

## 🗂 Archivos Implementados

### Core Services
```
lib/
└── s3.ts                    # ✅ Servicio S3 completo
```

### API Endpoints
```
app/api/
├── uploads/
│   ├── presign/route.ts     # ✅ Generar presigned URLs
│   ├── document/route.ts    # ✅ Upload/delete directo
│   └── download-url/route.ts # ✅ URLs de descarga
└── admin/
    └── documents/route.ts   # ✅ Modificado para S3
```

### Components
```
components/
└── DocumentUploader.tsx     # ✅ Componente de ejemplo
```

### Scripts
```
scripts/
└── migrate-documents-to-s3.ts # ✅ Migración de archivos
```

---

## 🎨 Componente de Ejemplo

```tsx
import { DocumentUploader } from '@/components/DocumentUploader';

function MiPagina() {
  return (
    <DocumentUploader 
      enrollmentId="enrollment-123"
      onSuccess={() => {
        console.log('¡Documentos subidos exitosamente!');
        // Recargar datos, mostrar toast, etc.
      }}
    />
  );
}
```

---

## 🔄 Flujos de Trabajo

### Método 1: Upload Directo (Recomendado para empezar)

```
Usuario selecciona archivo
     ↓
Cliente → /api/admin/documents → AWS S3
     ↓                              ↓
PostgreSQL guarda URL ← ─ ─ ─ ─ ─ ─ ┘
     ↓
Respuesta a cliente
```

**Ventajas:**
- ✅ Simple
- ✅ Una sola petición
- ✅ El servidor maneja todo

**Desventajas:**
- ⚠️ Limitado por timeout de Next.js
- ⚠️ No ideal para archivos muy grandes

### Método 2: Presigned URL (Recomendado para producción)

```
Cliente → /api/uploads/presign → Genera URL
     ↓                              ↓
Cliente ← ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
     ↓
Cliente → AWS S3 (upload directo)
     ↓
Cliente → Guarda referencia en BD
```

**Ventajas:**
- ✅ Muy rápido
- ✅ Sin límite de tamaño
- ✅ No consume recursos del servidor

**Desventajas:**
- ⚠️ Dos pasos (más complejo)
- ⚠️ Requiere configurar CORS en S3

---

## 🔐 Seguridad

✅ **Autenticación**: Todos los endpoints requieren sesión válida  
✅ **Autorización**: Upload requiere rol ADMIN  
✅ **Validación**: Solo tipos de archivo permitidos  
✅ **Expiración**: URLs pre-firmadas expiran en 1 hora  
✅ **Keys únicas**: UUID para evitar colisiones  

---

## 💰 Costos AWS S3

Estimación para 1,000 documentos de 1MB:

| Concepto | Costo/mes |
|----------|-----------|
| Almacenamiento (1GB) | $0.023 |
| 10,000 descargas | $0.004 |
| 1,000 uploads | $0.005 |
| **Total** | **~$0.50** |

**Gratis** en AWS Free Tier (primer año):
- 5GB de almacenamiento
- 20,000 GET requests
- 2,000 PUT requests

---

## 🐛 Solución de Problemas

### "Access Denied"
```bash
# Verifica credenciales
echo $AWS_ACCESS_KEY_ID
echo $S3_BUCKET
```

### "CORS Error"
Configura CORS en AWS S3:
```json
[{
  "AllowedOrigins": ["http://localhost:3000"],
  "AllowedMethods": ["GET", "PUT", "POST"],
  "AllowedHeaders": ["*"]
}]
```

### "Type not allowed"
Tipos permitidos:
- ✅ `application/pdf`
- ✅ `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- ❌ Otros formatos

### TypeScript Errors
```bash
# Reinicia TypeScript server
# En VS Code: Ctrl+Shift+P → TypeScript: Restart TS Server
```

---

## 📊 Endpoints Rápidos

| Endpoint | Método | Uso |
|----------|--------|-----|
| `/api/admin/documents` | POST | Sube dieta/rutina/reporte |
| `/api/uploads/presign` | POST | Genera presigned URL |
| `/api/uploads/document` | POST | Upload individual |
| `/api/uploads/download-url` | POST | URL de descarga |

Consulta **[DOCUMENTS_S3_UPLOAD.md](./DOCUMENTS_S3_UPLOAD.md)** para ejemplos detallados.

---

## ✅ Checklist de Configuración

- [ ] Bucket S3 creado
- [ ] Usuario IAM creado
- [ ] Credenciales obtenidas
- [ ] Variables en `.env.local`
- [ ] CORS configurado en S3
- [ ] Probado upload directo
- [ ] (Opcional) Migrados documentos existentes

---

## 🚀 Próximos Pasos

1. **Testing básico**: Sube un documento de prueba
2. **Integración**: Conecta con tu UI existente
3. **Migración**: Mueve documentos locales a S3
4. **Producción**: Configura variables en Vercel/Railway
5. **Monitoreo**: Revisa costos en AWS Console

---

## 📞 Soporte

¿Tienes problemas?

1. Revisa **[TESTING_S3.md](./TESTING_S3.md)** para debugging
2. Verifica logs del servidor en consola
3. Revisa AWS CloudWatch logs
4. Consulta documentación de AWS S3

---

## 🎉 ¡Todo Listo!

Tu sistema de documentos en S3 está configurado y listo para usar.

**Siguiente:** Configura AWS S3 siguiendo [AWS_S3_SETUP.md](./AWS_S3_SETUP.md)
