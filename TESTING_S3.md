# 🧪 Testing del Sistema S3

## Pruebas Manuales con curl

### 1. Test de Presigned URL

```bash
# Paso 1: Obtener URL pre-firmada (requiere estar logueado como ADMIN)
curl -X POST http://localhost:3000/api/uploads/presign \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=TU_TOKEN_AQUI" \
  -d '{
    "filename": "test-documento.pdf",
    "contentType": "application/pdf",
    "folder": "documents"
  }'

# Respuesta esperada:
# {
#   "uploadUrl": "https://bucket.s3.us-east-1.amazonaws.com/documents/uuid.pdf?X-Amz-Signature=...",
#   "fileUrl": "https://bucket.s3.us-east-1.amazonaws.com/documents/uuid.pdf",
#   "key": "documents/uuid.pdf",
#   "expiresIn": 3600
# }

# Paso 2: Subir archivo a S3 (usa la uploadUrl de la respuesta)
curl -X PUT "URL_PRESIGNADA_AQUI" \
  -H "Content-Type: application/pdf" \
  --upload-file /ruta/a/tu/documento.pdf

# Respuesta esperada: 200 OK (sin body)
```

### 2. Test de Upload Directo

```bash
# Subir documento individual
curl -X POST http://localhost:3000/api/uploads/document \
  -H "Cookie: next-auth.session-token=TU_TOKEN_AQUI" \
  -F "file=@/ruta/a/documento.pdf" \
  -F "folder=documents"

# Respuesta esperada:
# {
#   "fileUrl": "https://bucket.s3.us-east-1.amazonaws.com/documents/uuid.pdf",
#   "key": "documents/uuid.pdf"
# }
```

### 3. Test de Upload de Documentos de Cliente

```bash
curl -X POST http://localhost:3000/api/admin/documents \
  -H "Cookie: next-auth.session-token=TU_TOKEN_AQUI" \
  -F "enrollmentId=ENROLLMENT_ID_AQUI" \
  -F "dietFile=@/ruta/a/dieta.pdf" \
  -F "routineFile=@/ruta/a/rutina.pdf" \
  -F "reportFile=@/ruta/a/reporte.jpg"

# Respuesta esperada:
# {
#   "message": "Documentos subidos exitosamente a S3",
#   "documents": [
#     {
#       "id": "doc-id-1",
#       "type": "DIET",
#       "filename": "dieta.pdf",
#       "url": "https://bucket.s3.us-east-1.amazonaws.com/documents/uuid1.pdf",
#       "fileSize": 123456,
#       ...
#     },
#     ...
#   ]
# }
```

### 4. Test de Download URL

```bash
# Obtener URL de descarga
curl -X POST http://localhost:3000/api/uploads/download-url \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=TU_TOKEN_AQUI" \
  -d '{
    "keyOrUrl": "documents/uuid.pdf",
    "expiresIn": 7200
  }'

# Respuesta esperada:
# {
#   "downloadUrl": "https://bucket.s3.us-east-1.amazonaws.com/documents/uuid.pdf?X-Amz-Signature=...",
#   "key": "documents/uuid.pdf",
#   "expiresIn": 7200
# }
```

### 5. Test de Delete

```bash
curl -X DELETE "http://localhost:3000/api/uploads/document?key=documents/uuid.pdf" \
  -H "Cookie: next-auth.session-token=TU_TOKEN_AQUI"

# Respuesta esperada:
# {
#   "message": "Archivo eliminado exitosamente"
# }
```

---

## Pruebas con Postman/Insomnia

### Collection de Requests

#### 1. **POST Generate Presigned URL**
```
URL: http://localhost:3000/api/uploads/presign
Method: POST
Headers:
  Content-Type: application/json
Body (JSON):
{
  "filename": "documento.pdf",
  "contentType": "application/pdf",
  "folder": "documents"
}
```

#### 2. **PUT Upload to S3** (usar uploadUrl del paso 1)
```
URL: <uploadUrl from step 1>
Method: PUT
Headers:
  Content-Type: application/pdf
Body: Binary (select file)
```

#### 3. **POST Upload Direct**
```
URL: http://localhost:3000/api/uploads/document
Method: POST
Body (form-data):
  file: (select file)
  folder: documents
```

#### 4. **POST Upload Documents to Enrollment**
```
URL: http://localhost:3000/api/admin/documents
Method: POST
Body (form-data):
  enrollmentId: enrollment-id
  dietFile: (select PDF)
  routineFile: (select PDF)
  reportFile: (select image)
```

#### 5. **POST Get Download URL**
```
URL: http://localhost:3000/api/uploads/download-url
Method: POST
Headers:
  Content-Type: application/json
Body (JSON):
{
  "keyOrUrl": "documents/uuid.pdf",
  "expiresIn": 3600
}
```

---

## Pruebas Automatizadas (Jest)

### test/s3-service.test.ts

```typescript
import { S3Service } from '@/lib/s3';

describe('S3Service', () => {
  describe('extractKeyFromUrl', () => {
    it('debería extraer key de URL S3 estándar', () => {
      const url = 'https://bucket.s3.us-east-1.amazonaws.com/documents/file.pdf';
      const key = S3Service.extractKeyFromUrl(url);
      expect(key).toBe('documents/file.pdf');
    });

    it('debería retornar la key si ya es una key', () => {
      const key = 'documents/file.pdf';
      const result = S3Service.extractKeyFromUrl(key);
      expect(result).toBe(key);
    });

    it('debería retornar null para URL inválida', () => {
      const url = 'https://invalid-url.com/file.pdf';
      const key = S3Service.extractKeyFromUrl(url);
      expect(key).toBeNull();
    });
  });

  describe('isValidS3Key', () => {
    it('debería validar key correcta', () => {
      expect(S3Service.isValidS3Key('documents/file.pdf')).toBe(true);
    });

    it('debería rechazar key con slash al inicio', () => {
      expect(S3Service.isValidS3Key('/documents/file.pdf')).toBe(false);
    });

    it('debería rechazar key con doble slash', () => {
      expect(S3Service.isValidS3Key('documents//file.pdf')).toBe(false);
    });
  });
});
```

### test/api/uploads.test.ts

```typescript
import { POST as presignPost } from '@/app/api/uploads/presign/route';
import { POST as documentPost } from '@/app/api/uploads/document/route';

describe('Uploads API', () => {
  describe('POST /api/uploads/presign', () => {
    it('debería generar URL pre-firmada válida', async () => {
      const request = new Request('http://localhost:3000/api/uploads/presign', {
        method: 'POST',
        body: JSON.stringify({
          filename: 'test.pdf',
          contentType: 'application/pdf',
          folder: 'documents'
        }),
      });

      const response = await presignPost(request);
      const data = await response.json();

      expect(data).toHaveProperty('uploadUrl');
      expect(data).toHaveProperty('fileUrl');
      expect(data).toHaveProperty('key');
      expect(data.key).toContain('documents/');
    });

    it('debería rechazar tipo de archivo no permitido', async () => {
      const request = new Request('http://localhost:3000/api/uploads/presign', {
        method: 'POST',
        body: JSON.stringify({
          filename: 'malware.exe',
          contentType: 'application/x-executable',
          folder: 'documents'
        }),
      });

      const response = await presignPost(request);
      expect(response.status).toBe(400);
    });
  });
});
```

---

## Pruebas de Integración con Frontend

### test/components/DocumentUploader.test.tsx

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DocumentUploader } from '@/components/DocumentUploader';

describe('DocumentUploader', () => {
  it('debería renderizar formulario de upload', () => {
    render(<DocumentUploader enrollmentId="test-123" />);
    
    expect(screen.getByText(/Dieta/i)).toBeInTheDocument();
    expect(screen.getByText(/Rutina/i)).toBeInTheDocument();
    expect(screen.getByText(/Reporte/i)).toBeInTheDocument();
  });

  it('debería mostrar nombre de archivo al seleccionar', () => {
    render(<DocumentUploader enrollmentId="test-123" />);
    
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    const input = screen.getAllByRole('button')[0] as HTMLInputElement;
    
    fireEvent.change(input, { target: { files: [file] } });
    
    expect(screen.getByText(/test.pdf/i)).toBeInTheDocument();
  });

  it('debería llamar onSuccess después de upload exitoso', async () => {
    const onSuccess = jest.fn();
    render(<DocumentUploader enrollmentId="test-123" onSuccess={onSuccess} />);
    
    // Mock fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ documents: [] }),
      })
    ) as jest.Mock;

    const uploadButton = screen.getByText(/Subir \(Método Directo\)/i);
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});
```

---

## Checklist de Testing

### Tests Unitarios
- [ ] S3Service.extractKeyFromUrl()
- [ ] S3Service.isValidS3Key()
- [ ] S3Service.uploadDirect()
- [ ] S3Service.getPresignedUploadUrl()

### Tests de API
- [ ] POST /api/uploads/presign - caso exitoso
- [ ] POST /api/uploads/presign - tipo no permitido
- [ ] POST /api/uploads/presign - sin autenticación
- [ ] POST /api/uploads/document - upload exitoso
- [ ] POST /api/uploads/document - archivo muy grande
- [ ] POST /api/admin/documents - múltiples archivos
- [ ] DELETE /api/uploads/document - delete exitoso

### Tests de Integración
- [ ] Upload completo con presigned URL
- [ ] Upload directo al servidor
- [ ] Descarga de documento
- [ ] Migración de documentos locales

### Tests Manuales
- [ ] Subir PDF de dieta
- [ ] Subir PDF de rutina
- [ ] Subir imagen de reporte
- [ ] Descargar documento
- [ ] Eliminar documento
- [ ] Verificar en AWS S3 Console

---

## Scripts de Testing Rápido

### test-upload.sh

```bash
#!/bin/bash
# Test rápido de upload

TOKEN="tu-token-aqui"
ENROLLMENT_ID="enrollment-id"

echo "🧪 Probando upload de documentos..."

curl -X POST http://localhost:3000/api/admin/documents \
  -H "Cookie: next-auth.session-token=$TOKEN" \
  -F "enrollmentId=$ENROLLMENT_ID" \
  -F "dietFile=@./test-files/dieta.pdf" \
  -F "routineFile=@./test-files/rutina.pdf" \
  -F "reportFile=@./test-files/reporte.jpg"

echo "\n✅ Test completado"
```

### test-presigned.sh

```bash
#!/bin/bash
# Test de presigned URL

TOKEN="tu-token-aqui"

echo "🧪 Paso 1: Obtener presigned URL..."

RESPONSE=$(curl -s -X POST http://localhost:3000/api/uploads/presign \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=$TOKEN" \
  -d '{
    "filename": "test.pdf",
    "contentType": "application/pdf",
    "folder": "documents"
  }')

echo $RESPONSE | jq .

UPLOAD_URL=$(echo $RESPONSE | jq -r .uploadUrl)

echo "\n🧪 Paso 2: Subir a S3..."

curl -X PUT "$UPLOAD_URL" \
  -H "Content-Type: application/pdf" \
  --upload-file ./test-files/test.pdf

echo "\n✅ Upload completado"
```

---

## Validaciones Importantes

### 1. Tipos de Archivo
```typescript
// Permitidos para documents
✅ application/pdf
✅ image/jpeg, image/png, image/webp, image/gif

// No permitidos
❌ application/x-executable
❌ video/mp4 (solo en exercises)
❌ text/html
```

### 2. Tamaños
```typescript
// Default Next.js: 4.5MB
// Configurar en next.config.ts si necesitas más:
export default {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
}
```

### 3. Seguridad
- URLs pre-firmadas expiran (default: 1 hora)
- Solo usuarios autenticados pueden descargar
- Solo ADMIN puede subir
- Validación de tipos de archivo en servidor

---

## Logs Útiles para Debugging

```typescript
// En lib/s3.ts
console.log('[S3Service] Bucket:', S3_BUCKET);
console.log('[S3Service] Region:', S3_REGION);
console.log('[S3Service] Key generada:', key);

// En API routes
console.log('[POST /api/uploads/document] File:', file.name, file.size, file.type);
console.log('[POST /api/admin/documents] Upload exitoso:', fileUrl);
```

---

## Métricas a Monitorear

1. **Tasa de éxito de uploads**: >95%
2. **Tiempo promedio de upload**: <2s para archivos <5MB
3. **Errores de S3**: <1%
4. **URLs pre-firmadas generadas**: tracking
5. **Espacio usado en S3**: mensual

---

¿Necesitas ayuda con algún test específico?
