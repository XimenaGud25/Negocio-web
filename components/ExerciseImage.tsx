'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ImageService } from '@/lib/image-service';

interface ExerciseImageProps {
  exercise: {
    id: string;
    name: string;
    imageUrls?: string[];
    originalImages?: string[];
    images?: string[];
    image?: string;
    gifUrl?: string;
  };
  className?: string;
  priority?: boolean;
}

/**
 * Componente para mostrar imágenes de ejercicios con carga automática desde S3
 */
export function ExerciseImage({ exercise, className = '', priority = false }: ExerciseImageProps) {
  const [imageUrl, setImageUrl] = useState<string>('/placeholder-exercise.jpg');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadImage() {
      try {
        setLoading(true);
        setError(null);

        // Si ya tenemos URLs procesadas del servidor
        if (exercise.imageUrls && exercise.imageUrls.length > 0) {
          setImageUrl(exercise.imageUrls[0]);
          return;
        }

        // Si no, extraer keys y obtener URLs del cliente
        const keys = ImageService.extractImageKeysFromExercise(exercise);
        
        if (keys.length > 0) {
          const url = await ImageService.getImageUrl(keys[0], 7200); // 2 horas
          setImageUrl(url);
        } else {
          // No hay imágenes disponibles
          setImageUrl('/placeholder-exercise.jpg');
        }
      } catch (err) {
        console.error('Error cargando imagen del ejercicio:', err);
        setError('Error al cargar imagen');
        setImageUrl('/placeholder-exercise.jpg');
      } finally {
        setLoading(false);
      }
    }

    loadImage();
  }, [exercise]);

  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      {loading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="text-gray-500 text-sm">Cargando...</div>
        </div>
      )}
      
      <Image
        src={imageUrl}
        alt={exercise.name}
        fill
        priority={priority}
        className={`object-cover transition-opacity duration-200 ${loading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={() => setLoading(false)}
        onError={() => {
          setError('Error al cargar imagen');
          setImageUrl('/placeholder-exercise.jpg');
          setLoading(false);
        }}
      />
      
      {error && (
        <div className="absolute bottom-0 left-0 right-0 bg-red-500 bg-opacity-75 text-white text-xs p-1 text-center">
          {error}
        </div>
      )}
    </div>
  );
}

/**
 * Componente para mostrar múltiples imágenes de un ejercicio
 */
export function ExerciseImageGallery({ exercise, className = '' }: ExerciseImageProps) {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadImages() {
      try {
        setLoading(true);

        // Si ya tenemos URLs procesadas del servidor
        if (exercise.imageUrls && exercise.imageUrls.length > 0) {
          setImageUrls(exercise.imageUrls);
          return;
        }

        // Si no, extraer keys y obtener URLs del cliente
        const keys = ImageService.extractImageKeysFromExercise(exercise);
        
        if (keys.length > 0) {
          const urls = await ImageService.getMultipleImageUrls(keys, 7200);
          setImageUrls(urls);
        }
      } catch (err) {
        console.error('Error cargando imágenes del ejercicio:', err);
        setImageUrls(['/placeholder-exercise.jpg']);
      } finally {
        setLoading(false);
      }
    }

    loadImages();
  }, [exercise]);

  if (loading) {
    return (
      <div className={`grid grid-cols-2 gap-2 ${className}`}>
        {[1, 2].map((i) => (
          <div key={i} className="aspect-square bg-gray-200 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 gap-2 ${className}`}>
      {imageUrls.map((url, index) => (
        <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
          <Image
            src={url}
            alt={`${exercise.name} - Imagen ${index + 1}`}
            fill
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}