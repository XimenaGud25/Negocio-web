/**
 * Servicio para obtener URLs de imágenes desde el endpoint de AWS S3
 */
export class ImageService {
  private static baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  private static cache = new Map<string, { url: string; expiry: number }>();

  /**
   * Obtiene la URL de una imagen usando el endpoint público
   * @param key - La key de S3 o URL completa de la imagen
   * @param expiresIn - Tiempo de expiración en segundos (opcional)
   * @returns Promise con la URL de la imagen
   */
  static async getImageUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      // Verificar cache
      const cached = this.cache.get(key);
      const now = Date.now();
      
      if (cached && now < cached.expiry) {
        return cached.url;
      }

      const params = new URLSearchParams({ key });
      if (expiresIn) {
        params.append('expiresIn', expiresIn.toString());
      }

      const url = `${this.baseUrl}/api/uploads/image?${params}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Error obteniendo URL de imagen:', response.status);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Guardar en cache (expira 5 minutos antes que la URL)
      const cacheExpiry = now + ((expiresIn - 300) * 1000);
      this.cache.set(key, { url: result.imageUrl, expiry: cacheExpiry });

      return result.imageUrl;
    } catch (error) {
      console.error('Error obteniendo URL de imagen:', error);
      // Retornar imagen placeholder en caso de error
      return '/placeholder-exercise.jpg';
    }
  }

  /**
   * Obtiene URLs de múltiples imágenes
   * @param keys - Array de keys de S3
   * @param expiresIn - Tiempo de expiración en segundos
   */
  static async getMultipleImageUrls(keys: string[], expiresIn: number = 3600): Promise<string[]> {
    const promises = keys.map(key => this.getImageUrl(key, expiresIn));
    const results = await Promise.allSettled(promises);
    
    return results.map(result => 
      result.status === 'fulfilled' ? result.value : '/placeholder-exercise.jpg'
    );
  }

  /**
   * Limpia el cache de imágenes
   */
  static clearCache(): void {
    this.cache.clear();
  }

  /**
   * Extrae la key de imagen desde los datos del ejercicio
   * @param exercise - Datos del ejercicio
   * @returns Array de keys de imágenes
   */
  static extractImageKeysFromExercise(exercise: any): string[] {
    const keys: string[] = [];

    // Buscar en diferentes campos posibles
    if (exercise.images && Array.isArray(exercise.images)) {
      keys.push(...exercise.images);
    }
    
    if (exercise.image && typeof exercise.image === 'string') {
      keys.push(exercise.image);
    }

    if (exercise.imageUrl && typeof exercise.imageUrl === 'string') {
      keys.push(exercise.imageUrl);
    }

    if (exercise.gifUrl && typeof exercise.gifUrl === 'string') {
      keys.push(exercise.gifUrl);
    }

    // Filtrar keys válidas
    return keys.filter(key => key && key.trim().length > 0);
  }
}