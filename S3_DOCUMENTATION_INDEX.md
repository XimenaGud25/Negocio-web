# 📚 Documentación del Sistema S3 - Índice

> Sistema completo de almacenamiento de documentos en AWS S3

---

## 🚀 Inicio Rápido

**Nuevo en este sistema?** Empieza aquí:

1. **[README_S3_QUICKSTART.md](./README_S3_QUICKSTART.md)** ⭐  
   Guía de inicio rápido en 5 pasos

2. **[AWS_S3_SETUP.md](./AWS_S3_SETUP.md)**  
   Configuración completa de AWS S3 (bucket, IAM, CORS)

3. **[RESUMEN_S3_IMPLEMENTATION.md](./RESUMEN_S3_IMPLEMENTATION.md)**  
   Resumen ejecutivo de lo implementado

---

## 📖 Documentación Técnica

### Referencia API

- **[DOCUMENTS_S3_UPLOAD.md](./DOCUMENTS_S3_UPLOAD.md)**  
  Documentación completa de la API de subida de documentos
  - Endpoints disponibles
  - Tipos de archivo permitidos
  - Ejemplos de uso (curl, JavaScript)
  - Troubleshooting

### Testing y QA

- **[TESTING_S3.md](./TESTING_S3.md)**  
  Guías de testing y validación
  - Pruebas manuales con curl
  - Tests automatizados (Jest)
  - Validaciones de seguridad
  - Scripts de testing

### Integración

- **[INTEGRATION_EXAMPLES.md](./INTEGRATION_EXAMPLES.md)**  
  Ejemplos prácticos de código
  - Casos de uso reales
  - Componentes React
  - Hooks personalizados
  - Patrones recomendados

---

## 🗂 Estructura del Proyecto

### Archivos Core

```
lib/
└── s3.ts                          # ✅ Servicio S3 principal
    ├── getPresignedUploadUrl()    # Genera URL pre-firmada
    ├── uploadDirect()             # Upload directo a S3
    ├── deleteFile()               # Elimina archivo
    ├── getDownloadUrl()           # URL de descarga
    └── extractKeyFromUrl()        # Extrae key de S3 URL
```

### Endpoints API

```
app/api/
├── uploads/
│   ├── presign/route.ts          # ✅ POST - Genera presigned URL
│   ├── document/route.ts         # ✅ POST/DELETE - Upload/delete
│   └── download-url/route.ts     # ✅ GET/POST - URL descarga
└── admin/
    └── documents/route.ts        # ✅ POST/GET/DELETE - Gestión completa
```

### Componentes

```
components/
└── DocumentUploader.tsx          # ✅ Componente de ejemplo
    ├── Upload directo
    ├── Upload con presigned URL
    └── useDocumentDownloadUrl hook
```

### Scripts

```
scripts/
└── migrate-documents-to-s3.ts   # ✅ Migración local → S3
```

### Configuración

```
.env.example                      # ✅ Variables de entorno
```

---

## 📋 Casos de Uso

### Para Administradores

1. **Subir documentos a un cliente**
   - Ver: [INTEGRATION_EXAMPLES.md - Caso 1](./INTEGRATION_EXAMPLES.md#caso-1-página-de-admin---subir-documentos)
   - Endpoint: `POST /api/admin/documents`

2. **Eliminar documentos**
   - Ver: [DOCUMENTS_S3_UPLOAD.md](./DOCUMENTS_S3_UPLOAD.md#4-delete-apiadmindocuments)
   - Endpoint: `DELETE /api/admin/documents?documentId=...`

3. **Migrar documentos existentes**
   - Ver: [README_S3_QUICKSTART.md](./README_S3_QUICKSTART.md#5%EF%B8%8F%E2%83%A3-opcional-migra-documentos-existentes)
   - Script: `pnpm tsx scripts/migrate-documents-to-s3.ts`

### Para Clientes

1. **Ver y descargar documentos**
   - Ver: [INTEGRATION_EXAMPLES.md - Caso 2](./INTEGRATION_EXAMPLES.md#caso-2-vista-de-cliente---descargar-documentos)
   - Endpoint: `POST /api/uploads/download-url`

2. **Visualizar PDFs en el navegador**
   - Ver: [INTEGRATION_EXAMPLES.md - Caso 4](./INTEGRATION_EXAMPLES.md#caso-4-visualizador-de-pdfs)

### Para Desarrolladores

1. **Implementar upload con progreso**
   - Ver: [INTEGRATION_EXAMPLES.md - Caso 3](./INTEGRATION_EXAMPLES.md#caso-3-upload-progresivo-con-presigned-url)

2. **Crear hook personalizado**
   - Ver: [INTEGRATION_EXAMPLES.md - Caso 5](./INTEGRATION_EXAMPLES.md#caso-5-hook-personalizado-para-s3)

3. **Drag & Drop upload**
   - Ver: [INTEGRATION_EXAMPLES.md - Caso 7](./INTEGRATION_EXAMPLES.md#caso-7-drag--drop-upload)

---

## 🎓 Guías por Nivel

### Principiante

1. Lee: [README_S3_QUICKSTART.md](./README_S3_QUICKSTART.md)
2. Configura: [AWS_S3_SETUP.md](./AWS_S3_SETUP.md)
3. Prueba: Upload directo con formulario simple

### Intermedio

1. Lee: [DOCUMENTS_S3_UPLOAD.md](./DOCUMENTS_S3_UPLOAD.md)
2. Implementa: Upload con presigned URLs
3. Prueba: [TESTING_S3.md](./TESTING_S3.md)

### Avanzado

1. Lee: [INTEGRATION_EXAMPLES.md](./INTEGRATION_EXAMPLES.md)
2. Implementa: Upload con progreso y drag & drop
3. Optimiza: CloudFront CDN, Transfer Acceleration

---

## 🔍 Búsqueda Rápida

### ¿Necesitas...?

| Qué necesitas | Dónde encontrarlo |
|---------------|-------------------|
| Configurar AWS S3 | [AWS_S3_SETUP.md](./AWS_S3_SETUP.md) |
| Endpoint para subir PDF | [DOCUMENTS_S3_UPLOAD.md](./DOCUMENTS_S3_UPLOAD.md#1-post-apiadmindocuments) |
| Generar URL de descarga | [DOCUMENTS_S3_UPLOAD.md](./DOCUMENTS_S3_UPLOAD.md#5-get-apiuploadsdownload-urlkey) |
| Ejemplo de código React | [INTEGRATION_EXAMPLES.md](./INTEGRATION_EXAMPLES.md) |
| Probar con curl | [TESTING_S3.md](./TESTING_S3.md#pruebas-manuales-con-curl) |
| Migrar archivos locales | [README_S3_QUICKSTART.md](./README_S3_QUICKSTART.md#5%EF%B8%8F%E2%83%A3-opcional-migra-documentos-existentes) |
| Tipos de archivo permitidos | [DOCUMENTS_S3_UPLOAD.md](./DOCUMENTS_S3_UPLOAD.md#tipos-de-archivo-permitidos) |
| Solucionar "Access Denied" | [AWS_S3_SETUP.md](./AWS_S3_SETUP.md#solución-de-problemas) |
| Hook personalizado | [INTEGRATION_EXAMPLES.md - Caso 5](./INTEGRATION_EXAMPLES.md#caso-5-hook-personalizado-para-s3) |
| Ver galería de imágenes | [INTEGRATION_EXAMPLES.md - Caso 6](./INTEGRATION_EXAMPLES.md#caso-6-galería-de-reportes-imágenes) |

---

## ⚡ Quick Commands

```bash
# Instalar dependencias
pnpm install

# Migrar documentos a S3
pnpm tsx scripts/migrate-documents-to-s3.ts

# Probar upload (requiere configuración)
curl -X POST http://localhost:3000/api/admin/documents \
  -H "Cookie: next-auth.session-token=TOKEN" \
  -F "enrollmentId=ID" \
  -F "dietFile=@archivo.pdf"

# Ver logs
# En desarrollo: Los logs aparecen en la consola del servidor
```

---

## 🔗 Enlaces Externos

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
- [Presigned URLs Guide](https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html)
- [S3 Pricing Calculator](https://aws.amazon.com/s3/pricing/)

---

## 📝 Checklist de Implementación

- [ ] AWS S3 bucket creado
- [ ] Usuario IAM configurado
- [ ] Variables de entorno en `.env.local`
- [ ] CORS configurado en S3
- [ ] Probado upload directo
- [ ] Probado presigned URL
- [ ] Probado descarga de documentos
- [ ] (Opcional) Documentos migrados a S3
- [ ] Variables configuradas en producción
- [ ] Tests ejecutados

---

## 🆘 Soporte

### Problemas Comunes

1. **"Access Denied"**  
   → [AWS_S3_SETUP.md - Troubleshooting](./AWS_S3_SETUP.md#solución-de-problemas)

2. **"CORS Error"**  
   → [AWS_S3_SETUP.md - Configurar CORS](./AWS_S3_SETUP.md#2-configurar-cors-en-el-bucket)

3. **"Tipo de archivo no permitido"**  
   → [DOCUMENTS_S3_UPLOAD.md - Tipos permitidos](./DOCUMENTS_S3_UPLOAD.md#tipos-de-archivo-permitidos)

4. **"URL expirada"**  
   → [DOCUMENTS_S3_UPLOAD.md - Notas](./DOCUMENTS_S3_UPLOAD.md#notas-importantes)

### Debugging

Ver logs detallados en:
- Consola del servidor Next.js
- AWS CloudWatch (en producción)
- [TESTING_S3.md - Logs](./TESTING_S3.md#logs-útiles-para-debugging)

---

## 📊 Comparación de Métodos

| Característica | Upload Directo | Presigned URL |
|----------------|----------------|---------------|
| Complejidad | ⭐ Simple | ⭐⭐ Moderada |
| Velocidad | ⭐⭐ Media | ⭐⭐⭐ Rápida |
| Tamaño máx | 4.5MB (Next.js) | Ilimitado* |
| Progreso | ❌ No | ✅ Sí |
| CORS | No requiere | Requiere config |
| Uso servidor | Alto | Bajo |

*Limitado por AWS S3 (5TB por archivo)

---

## 🎯 Próximos Pasos Recomendados

1. **Configuración Básica** (1 día)
   - [ ] Configurar AWS S3
   - [ ] Variables de entorno
   - [ ] Primer upload de prueba

2. **Integración** (2-3 días)
   - [ ] Conectar con UI existente
   - [ ] Adaptar formularios
   - [ ] Pruebas de usuario

3. **Migración** (1 día)
   - [ ] Ejecutar script de migración
   - [ ] Validar documentos migrados
   - [ ] Limpiar archivos locales (backup primero!)

4. **Producción** (1 día)
   - [ ] Variables en Vercel/Railway
   - [ ] Testing en staging
   - [ ] Deploy a producción
   - [ ] Monitoreo de costos

---

## 📅 Versión

**Versión:** 1.0.0  
**Fecha:** 30 de Enero, 2026  
**Última actualización:** 30 de Enero, 2026

---

## ✨ Features Implementadas

- ✅ Upload directo a S3
- ✅ Upload con presigned URLs
- ✅ Download con URLs pre-firmadas
- ✅ Delete de archivos
- ✅ Soporte para PDFs
- ✅ Soporte para imágenes
- ✅ Migración de archivos locales
- ✅ Validación de tipos
- ✅ Seguridad por roles
- ✅ Documentación completa

---

**¿Listo para empezar?** → [README_S3_QUICKSTART.md](./README_S3_QUICKSTART.md)
