# Sistema de Imágenes de Ejercicios con AWS S3

## 📋 Resumen

He implementado exitosamente un sistema completo para manejar imágenes de ejercicios usando AWS S3 con URLs pre-firmadas. El sistema incluye:

- ✅ **Endpoint público** para obtener URLs de imágenes (`GET /api/uploads/image`)
- ✅ **Endpoint administrativo** con autenticación (`POST /api/uploads/download-url`)
- ✅ **Servicio S3** para generar URLs pre-firmadas
- ✅ **Integración automática** en el endpoint de ejercicios
- ✅ **Componentes React** listos para usar
- ✅ **Caché inteligente** para optimizar rendimiento

## 🚀 Configuración Inicial

### 1. Variables de Entorno

Agrega estas variables a tu archivo `.env.local`:

```bash
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=tu_access_key_aqui
AWS_SECRET_ACCESS_KEY=tu_secret_key_aqui
AWS_S3_REGION=us-east-1
AWS_S3_S3_BUCKET=tu_S3_BUCKET_aqui

# Next.js App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Configurar AWS S3 Bucket

Tu bucket debe tener configuración de CORS habilitada:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://tudominio.com"
    ],
    "ExposeHeaders": [],
    "MaxAgeSeconds": 3000
  }
]
```

### 3. Permisos IAM

Tu usuario IAM necesita estos permisos mínimos:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::tu-bucket-name/*"
    }
  ]
}
```

## 🔌 APIs Disponibles

### GET /api/uploads/image (Público)

Obtiene URL pre-firmada sin autenticación.

**Parámetros:**
- `key` (requerido): Key de S3 o URL completa
- `expiresIn` (opcional): Tiempo de expiración en segundos (60-86400)

**Ejemplo:**
```bash
curl "http://localhost:3000/api/uploads/image?key=exercises/image.jpg&expiresIn=3600"
```

### POST /api/uploads/download-url (Admin)

Obtiene URL pre-firmada con autenticación de administrador.

**Headers:**
```
Authorization: Bearer your_jwt_token
Content-Type: application/json
```

**Body:**
```json
{
  "key": "exercises/image.jpg",
  "expiresIn": 3600
}
```

## 📊 Endpoint de Ejercicios Mejorado

El endpoint `GET /api/exercises` ahora automáticamente:

1. **Extrae keys de imágenes** de los datos del ejercicio
2. **Genera URLs pre-firmadas** para todas las imágenes
3. **Agrega campos nuevos** al response:
   - `imageUrls`: Array con URLs pre-firmadas listas para usar
   - `originalImages`: Array con las keys originales

**Ejemplo de response:**
```json
{
  "exercises": [
    {
      "id": "123",
      "name": "Push-ups",
      "imageUrls": [
        "https://bucket.s3.amazonaws.com/exercises/push-ups.jpg?X-Amz-Signature=..."
      ],
      "originalImages": [
        "exercises/push-ups.jpg"
      ]
    }
  ]
}
```

## 🎨 Componentes React

### ExerciseImage - Imagen Individual

```jsx
import { ExerciseImage } from '@/components/ExerciseImage';

function ExerciseCard({ exercise }) {
  return (
    <div>
      <ExerciseImage 
        exercise={exercise}
        className="w-full h-48"
        priority={true}
      />
      <h3>{exercise.name}</h3>
    </div>
  );
}
```

### ExerciseImageGallery - Múltiples Imágenes

```jsx
import { ExerciseImageGallery } from '@/components/ExerciseImage';

function ExerciseDetails({ exercise }) {
  return (
    <div>
      <h1>{exercise.name}</h1>
      <ExerciseImageGallery 
        exercise={exercise}
        className="mb-4"
      />
    </div>
  );
}
```

## 🔧 Servicios Disponibles

### ImageService (Client-side)

```typescript
import { ImageService } from '@/lib/image-service';

// Obtener URL de una imagen
const imageUrl = await ImageService.getImageUrl('exercises/image.jpg');

// Obtener URLs de múltiples imágenes
const imageUrls = await ImageService.getMultipleImageUrls([
  'exercises/image1.jpg',
  'exercises/image2.jpg'
]);

// Limpiar caché
ImageService.clearCache();
```

### S3Service (Server-side)

```typescript
import { S3Service } from '@/lib/s3';

// Obtener URL pre-firmada
const result = await S3Service.getDownloadUrl('exercises/image.jpg', 3600);

// Obtener múltiples URLs
const results = await S3Service.getMultipleDownloadUrls([
  'exercises/image1.jpg',
  'exercises/image2.jpg'
], 7200);
```

## 🎯 Ejemplos de Uso

### 1. Lista de Ejercicios

```typescript
// pages/exercises/index.tsx
'use client';

import { useState, useEffect } from 'react';
import { ExerciseImage } from '@/components/ExerciseImage';

export default function ExercisesPage() {
  const [exercises, setExercises] = useState([]);

  useEffect(() => {
    fetch('/api/exercises')
      .then(res => res.json())
      .then(data => {
        setExercises(data.exercises || data);
      });
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {exercises.map((exercise) => (
        <div key={exercise.id} className="bg-white rounded-lg shadow-md overflow-hidden">
          <ExerciseImage 
            exercise={exercise}
            className="w-full h-48"
          />
          <div className="p-4">
            <h3 className="font-bold text-lg">{exercise.name}</h3>
            <p className="text-gray-600">{exercise.difficulty}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### 2. Detalles del Ejercicio

```typescript
// pages/exercises/[id].tsx
'use client';

import { ExerciseImageGallery } from '@/components/ExerciseImage';

export default function ExerciseDetailsPage({ params }) {
  const [exercise, setExercise] = useState(null);

  useEffect(() => {
    fetch(`/api/exercises/${params.id}`)
      .then(res => res.json())
      .then(setExercise);
  }, [params.id]);

  if (!exercise) return <div>Cargando...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{exercise.name}</h1>
      
      <ExerciseImageGallery 
        exercise={exercise}
        className="mb-6"
      />
      
      <div className="prose">
        <p>{exercise.description}</p>
      </div>
    </div>
  );
}
```

## 🏗️ Arquitectura del Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Next.js API   │    │   AWS S3        │
│   Components    │◄──►│   Routes        │◄──►│   Bucket        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────►│  Image Service  │◄─────────────┘
                         │  + Cache        │
                         └─────────────────┘
```

## 🔒 Seguridad

- ✅ **URLs pre-firmadas** con expiración configurable
- ✅ **Autenticación obligatoria** para endpoint administrativo
- ✅ **Validación de parámetros** en todos los endpoints
- ✅ **Manejo de errores** robusto
- ✅ **Cache inteligente** para optimizar llamadas

## 🚀 Rendimiento

- ✅ **Cache automático** de URLs con expiración
- ✅ **Procesamiento en lotes** para múltiples imágenes
- ✅ **Lazy loading** en componentes React
- ✅ **Optimización de Next.js** con revalidación
- ✅ **Fallback a placeholder** en caso de error

## 📝 Notas Importantes

1. **Expiración de URLs**: Las URLs pre-firmadas expiran automáticamente
2. **Cache inteligente**: Se invalida 5 minutos antes del vencimiento
3. **Manejo de errores**: Siempre muestra placeholder en caso de fallo
4. **Compatibilidad**: Acepta tanto keys como URLs completas
5. **Escalabilidad**: Optimizado para manejar muchas imágenes

¡El sistema está listo para usar! 🎉