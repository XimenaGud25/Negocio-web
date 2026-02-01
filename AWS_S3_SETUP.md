# Configuración AWS S3 para Documentos

## 📋 Pasos para Configurar AWS S3

### 1. Crear un Bucket en AWS S3

1. Inicia sesión en [AWS Console](https://console.aws.amazon.com/)
2. Ve a **S3** → **Create bucket**
3. Configuración del bucket:
   - **Bucket name**: `gym-exercises-images` (o el nombre que prefieras)
   - **Region**: `us-east-1` (o tu región preferida)
   - **Block all public access**: ✅ DESMARCAR (necesitamos acceso público a las imágenes)
   - **Versioning**: Opcional
   - Click en **Create bucket**

### 2. Configurar CORS en el Bucket

1. Ve a tu bucket → **Permissions** → **CORS**
2. Agrega esta configuración:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "HEAD"],
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://tu-dominio.com"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

### 3. Configurar Política de Bucket (Bucket Policy)

1. Ve a tu bucket → **Permissions** → **Bucket Policy**
2. Agrega esta política (reemplaza `gym-exercises-images` con tu nombre de bucket):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::gym-exercises-images/*"
    }
  ]
}
```

**⚠️ Nota**: Esta política permite lectura pública de todos los objetos. Para mayor seguridad en documentos privados, usa solo URLs pre-firmadas.

### 4. Crear Usuario IAM para la Aplicación

1. Ve a **IAM** → **Users** → **Create user**
2. **User name**: `gym-app-s3-user`
3. **Permissions**: Adjunta la política **AmazonS3FullAccess** o crea una política personalizada:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::gym-exercises-images",
        "arn:aws:s3:::gym-exercises-images/*"
      ]
    }
  ]
}
```

4. Click en **Create access key** → **Application running outside AWS**
5. Guarda el **Access Key ID** y **Secret Access Key**

### 5. Configurar Variables de Entorno

Agrega estas variables a tu archivo `.env` o `.env.local`:

```env
# AWS S3 Configuration
S3_BUCKET=gym-exercises-images
AWS_S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
S3_PRESIGNED_URL_EXPIRES=3600

# Opcional: URL base para producción
NEXT_PUBLIC_S3_BASE_URL=https://gym-exercises-images.s3.us-east-1.amazonaws.com
```

**⚠️ IMPORTANTE**: 
- NO subas tu archivo `.env` a Git
- Agrega `.env.local` a `.gitignore`
- En producción (Vercel, Railway, etc.), configura estas variables en el panel de configuración

---

## 🔒 Seguridad Mejorada (Documentos Privados)

Si quieres que los documentos sean privados y solo accesibles con URLs pre-firmadas:

### 1. NO uses Bucket Policy pública

Elimina la política de bucket pública y mantén **Block all public access** ✅ ACTIVADO

### 2. Usa solo URLs Pre-firmadas

```typescript
// En lugar de usar la URL directa de S3
const publicUrl = "https://bucket.s3.region.amazonaws.com/documents/file.pdf";

// Usa siempre URLs pre-firmadas
const { downloadUrl } = await fetch('/api/uploads/download-url', {
  method: 'POST',
  body: JSON.stringify({ 
    keyOrUrl: "documents/file.pdf",
    expiresIn: 3600  // Expira en 1 hora
  })
}).then(r => r.json());
```

### 3. Configuración CORS para Documentos Privados

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://tu-dominio.com"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

---

## 📊 Estructura Recomendada del Bucket

```
gym-exercises-images/
├── exercises/           # Imágenes públicas de ejercicios
│   ├── uuid1.jpg
│   ├── uuid2.png
│   └── ...
└── documents/           # Documentos privados de clientes
    ├── uuid1.pdf       # Dietas
    ├── uuid2.pdf       # Rutinas  
    ├── uuid3.jpg       # Reportes
    └── ...
```

**Configuración mixta:**
- `exercises/`: Pública (política de bucket permite GET)
- `documents/`: Privada (solo URLs pre-firmadas)

---

## 🧪 Pruebas

### Probar subida directa

```bash
curl -X POST http://localhost:3000/api/uploads/document \
  -H "Cookie: next-auth.session-token=tu-token" \
  -F "file=@documento.pdf" \
  -F "folder=documents"
```

### Probar presigned URL

```bash
# 1. Obtener presigned URL
curl -X POST http://localhost:3000/api/uploads/presign \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=tu-token" \
  -d '{"filename": "test.pdf", "contentType": "application/pdf", "folder": "documents"}'

# 2. Subir archivo a S3 (usa la uploadUrl de la respuesta anterior)
curl -X PUT "https://bucket.s3.region.amazonaws.com/documents/uuid.pdf?..." \
  -H "Content-Type: application/pdf" \
  --upload-file documento.pdf
```

### Probar URL de descarga

```bash
curl -X POST http://localhost:3000/api/uploads/download-url \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=tu-token" \
  -d '{"keyOrUrl": "documents/uuid.pdf", "expiresIn": 3600}'
```

---

## 💰 Costos Estimados (AWS S3)

Precios aproximados para región `us-east-1`:

| Concepto | Precio |
|----------|--------|
| Almacenamiento | $0.023 / GB / mes |
| PUT/POST requests | $0.005 / 1,000 requests |
| GET requests | $0.0004 / 1,000 requests |
| Transferencia de datos (salida) | $0.09 / GB (primeros 10 TB) |

**Ejemplo práctico:**
- 1,000 documentos de 1 MB cada uno = 1 GB
- 10,000 descargas/mes
- **Costo mensual**: ~$1.50 USD

---

## 🚀 Deployment en Producción

### Vercel

1. Ve a tu proyecto en Vercel → **Settings** → **Environment Variables**
2. Agrega todas las variables de AWS S3
3. Redeploy tu aplicación

### Railway / Render

1. Panel de configuración → **Environment Variables**
2. Agrega todas las variables
3. Redeploy

### AWS Amplify

Las variables de entorno se configuran automáticamente si usas IAM roles.

---

## ⚡ Optimizaciones

### 1. CloudFront CDN (Opcional)

Para mejorar la velocidad de descarga globalmente:

1. Crea una distribución de CloudFront
2. Origen: Tu bucket S3
3. Actualiza `NEXT_PUBLIC_S3_BASE_URL` con tu URL de CloudFront

### 2. S3 Transfer Acceleration (Opcional)

Para uploads más rápidos desde ubicaciones lejanas:

1. Habilita Transfer Acceleration en tu bucket
2. Usa el endpoint acelerado: `bucket.s3-accelerate.amazonaws.com`

### 3. Lifecycle Policies

Para eliminar automáticamente URLs pre-firmadas expiradas:

```json
{
  "Rules": [
    {
      "Id": "DeleteOldDocuments",
      "Status": "Enabled",
      "Prefix": "documents/",
      "Expiration": {
        "Days": 365
      }
    }
  ]
}
```

---

## 📝 Checklist de Configuración

- [ ] Bucket S3 creado
- [ ] CORS configurado
- [ ] Política de bucket configurada (si es necesario)
- [ ] Usuario IAM creado
- [ ] Access Keys generadas
- [ ] Variables de entorno configuradas en `.env.local`
- [ ] Probado upload directo
- [ ] Probado presigned URL
- [ ] Probado URL de descarga
- [ ] Variables configuradas en producción
- [ ] `.env.local` en `.gitignore`

---

## 🆘 Solución de Problemas

### Error: "Access Denied"
- Verifica que las credenciales IAM sean correctas
- Verifica que el usuario IAM tenga permisos suficientes

### Error: "CORS policy"
- Verifica que el origen esté en la lista de `AllowedOrigins`
- Verifica que el método HTTP esté en `AllowedMethods`

### Error: "NoSuchBucket"
- Verifica que `S3_BUCKET` sea correcto
- Verifica que la región sea correcta

### URLs pre-firmadas no funcionan
- Verifica que el reloj del servidor esté sincronizado
- Verifica que no hayan expirado (`expiresIn`)

---

## 📚 Referencias

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
- [Presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html)
- [S3 Pricing](https://aws.amazon.com/s3/pricing/)
