import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Configuración del cliente S3
const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const S3_BUCKET = process.env.S3_BUCKET;

if (!S3_BUCKET) {
  throw new Error("AWS_S3_S3_BUCKET environment variable is not set");
}

/**
 * Servicio para manejar operaciones de AWS S3
 */
export class S3Service {
  
  /**
   * Obtiene una URL de descarga pre-firmada para una imagen en S3
   * @param keyOrUrl - La key de S3 o URL completa de la imagen
   * @param expiresIn - Tiempo de expiración en segundos (por defecto 1 hora)
   * @returns Promise con la URL pre-firmada
   */
  static async getDownloadUrl(keyOrUrl: string, expiresIn: number = 3600): Promise<{
    imageUrl: string;
    key: string;
    expiresIn: number;
  }> {
    try {
      // Extraer la key si se proporciona una URL completa
      const key = this.extractKeyFromUrl(keyOrUrl);
      
      if (!key) {
        throw new Error("No se pudo extraer la key de la imagen");
      }

      // Crear el comando para obtener el objeto
      const command = new GetObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
      });

      // Generar URL pre-firmada
      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });

      return {
        imageUrl: signedUrl,
        key,
        expiresIn,
      };
    } catch (error) {
      console.error("Error generando URL de descarga:", error);
      throw new Error("Error al generar URL de descarga");
    }
  }

  /**
   * Obtiene URLs de descarga para múltiples imágenes
   * @param keysOrUrls - Array de keys de S3 o URLs completas
   * @param expiresIn - Tiempo de expiración en segundos
   */
  static async getMultipleDownloadUrls(
    keysOrUrls: string[], 
    expiresIn: number = 3600
  ): Promise<Array<{
    imageUrl: string;
    key: string;
    expiresIn: number;
  }>> {
    const promises = keysOrUrls.map(keyOrUrl => 
      this.getDownloadUrl(keyOrUrl, expiresIn)
    );
    
    return Promise.allSettled(promises).then(results => 
      results
        .filter(result => result.status === 'fulfilled')
        .map(result => (result as PromiseFulfilledResult<any>).value)
    );
  }

  /**
   * Extrae la key de S3 desde una URL completa o devuelve la key si ya es una key
   * @param keyOrUrl - Key de S3 o URL completa
   * @returns La key extraída o null si no es válida
   */
  private static extractKeyFromUrl(keyOrUrl: string): string | null {
    try {
      // Si parece ser una URL completa
      if (keyOrUrl.startsWith('http://') || keyOrUrl.startsWith('https://')) {
        const url = new URL(keyOrUrl);
        
        // Formato: https://bucket.s3.region.amazonaws.com/path/to/file
        if (url.hostname.includes('.s3.') || url.hostname.includes('.s3-')) {
          return url.pathname.substring(1); // Remover el "/" inicial
        }
        
        // Formato: https://s3.region.amazonaws.com/bucket/path/to/file
        if (url.hostname.startsWith('s3.') || url.hostname.startsWith('s3-')) {
          const pathParts = url.pathname.split('/');
          if (pathParts.length > 2) {
            return pathParts.slice(2).join('/'); // Omitir bucket y obtener el path
          }
        }
        
        return null;
      }
      
      // Si no es una URL, asumir que es una key válida
      return keyOrUrl.trim();
    } catch (error) {
      console.error("Error extrayendo key de URL:", error);
      return null;
    }
  }

  /**
   * Verifica si una key es válida para S3
   * @param key - Key a verificar
   */
  static isValidS3Key(key: string): boolean {
    return (
      typeof key === 'string' &&
      key.length > 0 &&
      key.length <= 1024 && // AWS S3 key length limit
      !key.startsWith('/') &&
      !key.includes('//')
    );
  }
}