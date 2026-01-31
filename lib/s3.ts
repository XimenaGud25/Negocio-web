import { 
  S3Client, 
  GetObjectCommand, 
  PutObjectCommand,
  DeleteObjectCommand 
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

// Configuración del cliente S3 (creable dinámicamente)
let S3_REGION = process.env.AWS_S3_REGION || process.env.AWS_REGION || "us-east-1";
const S3_BUCKET = process.env.S3_BUCKET;
const S3_PRESIGNED_URL_EXPIRES = parseInt(process.env.S3_PRESIGNED_URL_EXPIRES || "3600", 10);

if (!S3_BUCKET) {
  throw new Error("AWS_S3_S3_BUCKET environment variable is not set");
}

function createS3Client(region: string) {
  return new S3Client({
    region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
}

let s3Client = createS3Client(S3_REGION);

function extractRegionFromEndpoint(endpoint: string | undefined): string | null {
  if (!endpoint) return null;
  try {
    // endpoint examples:
    // bucket.s3.us-east-2.amazonaws.com
    // bucket.s3-us-west-2.amazonaws.com
    const m = endpoint.match(/\.s3[.-]([a-z0-9-]+)\.amazonaws\.com$/);
    if (m && m[1]) return m[1];
  } catch (e) {
    // ignore
  }
  return null;
}

// Tipos de archivo permitidos para documentos
const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

// Tipos de archivo permitidos para imágenes de ejercicios
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

// Tipos de archivo permitidos para videos
const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/avi',
  'video/mov',
  'video/quicktime',
  'video/x-msvideo',
];

export interface PresignedUrlResponse {
  uploadUrl: string;
  fileUrl: string;
  key: string;
  expiresIn: number;
}

/**
 * Servicio para manejar operaciones de AWS S3
 */
export class S3Service {
  
  /**
   * Genera una URL pre-firmada para subir un archivo a S3
   */
  static async getPresignedUploadUrl(
    filename: string,
    contentType: string,
    folder: string = 'exercises',
  ): Promise<PresignedUrlResponse> {
    // Validar tipo de archivo según la carpeta
    let allowedTypes: string[];
    if (folder === 'documents' || folder.startsWith('documents/')) {
      allowedTypes = ALLOWED_DOCUMENT_TYPES;
    } else if (folder === 'videos' || folder.startsWith('videos/')) {
      allowedTypes = ALLOWED_VIDEO_TYPES;
    } else {
      allowedTypes = ALLOWED_IMAGE_TYPES;
    }

    if (!allowedTypes.includes(contentType)) {
      throw new Error(
        `Tipo de archivo no permitido. Tipos permitidos: ${allowedTypes.join(', ')}`
      );
    }

    // Generar nombre único para el archivo
    const extension = filename.split('.').pop() || 'jpg';
    const uniqueFilename = `${uuidv4()}.${extension}`;
    const key = `${folder}/${uniqueFilename}`;

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      ContentType: contentType,
    });

    try {
      const uploadUrl = await getSignedUrl(s3Client, command, {
        expiresIn: S3_PRESIGNED_URL_EXPIRES,
      });

      const fileUrl = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`;

      return {
        uploadUrl,
        fileUrl,
        key,
        expiresIn: S3_PRESIGNED_URL_EXPIRES,
      };
    } catch (error: any) {
      // Si es PermanentRedirect, extraer región y reintentar
      if (error.Code === 'PermanentRedirect' && error.Endpoint) {
        const correctRegion = extractRegionFromEndpoint(error.Endpoint);
        if (correctRegion && correctRegion !== S3_REGION) {
          console.log(`[S3Service] PermanentRedirect en presigned. Región correcta: ${correctRegion}`);
          S3_REGION = correctRegion;
          s3Client = createS3Client(S3_REGION);
          
          const uploadUrl = await getSignedUrl(s3Client, command, {
            expiresIn: S3_PRESIGNED_URL_EXPIRES,
          });

          const fileUrl = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`;

          return {
            uploadUrl,
            fileUrl,
            key,
            expiresIn: S3_PRESIGNED_URL_EXPIRES,
          };
        }
      }
      throw error;
    }
  }

  /**
   * Sube un archivo directamente a S3 (evita CORS)
   */
  static async uploadDirect(
    buffer: Buffer,
    filename: string,
    contentType: string,
    folder: string = 'exercises'
  ): Promise<{ fileUrl: string; key: string }> {
    console.log(`[S3Service] Iniciando upload directo: filename=${filename}, contentType=${contentType}, folder=${folder}`);
    console.log(`[S3Service] Buffer size: ${buffer.length} bytes`);
    
    // Validar tipo de archivo según la carpeta
    let allowedTypes: string[];
    if (folder === 'documents' || folder.startsWith('documents/')) {
      allowedTypes = ALLOWED_DOCUMENT_TYPES;
    } else if (folder === 'videos' || folder.startsWith('videos/')) {
      allowedTypes = ALLOWED_VIDEO_TYPES;
    } else {
      allowedTypes = ALLOWED_IMAGE_TYPES;
    }

    if (!allowedTypes.includes(contentType)) {
      throw new Error(
        `Tipo de archivo no permitido: ${contentType}. Tipos permitidos: ${allowedTypes.join(', ')}`
      );
    }

    // Generar nombre único para el archivo
    const extension = filename.split('.').pop() || 'jpg';
    const uniqueFilename = `${uuidv4()}.${extension}`;
    const key = `${folder}/${uniqueFilename}`;

    console.log(`[S3Service] Key generada: ${key}`);
    console.log(`[S3Service] Bucket: ${S3_BUCKET}, Region: ${S3_REGION}`);

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });

    try {
      console.log('[S3Service] Ejecutando PutObjectCommand...');
      const start = Date.now();
      const controller = new AbortController();
      const timeoutMs = 2 * 60 * 1000; // 2 minutes
      const t = setTimeout(() => {
        try {
          controller.abort();
        } catch (e) {
          // ignore
        }
      }, timeoutMs);

      try {
        await s3Client.send(command, { abortSignal: controller.signal as any });
      } finally {
        clearTimeout(t);
      }

      const duration = Date.now() - start;
      console.log(`[S3Service] Upload exitoso a S3 (took ${duration}ms)`);

      const fileUrl = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`;
      console.log(`[S3Service] URL del archivo: ${fileUrl}`);
      
      return { fileUrl, key };
    } catch (error: any) {
      // Si es PermanentRedirect, extraer la región correcta y reintentar
      if (error.Code === 'PermanentRedirect' && error.Endpoint) {
        const correctRegion = extractRegionFromEndpoint(error.Endpoint);
        if (correctRegion && correctRegion !== S3_REGION) {
          console.log(`[S3Service] PermanentRedirect detectado. Región correcta: ${correctRegion}`);
          console.log(`[S3Service] Reintentando con región ${correctRegion}...`);
          
          // Actualizar región global y recrear cliente
          S3_REGION = correctRegion;
          s3Client = createS3Client(S3_REGION);
          
          // Reintentar el comando (con timeout)
          const controller2 = new AbortController();
          const t2 = setTimeout(() => {
            try { controller2.abort(); } catch (e) {}
          }, 2 * 60 * 1000);
          try {
            const start2 = Date.now();
            await s3Client.send(command, { abortSignal: controller2.signal as any });
            const duration2 = Date.now() - start2;
            console.log(`[S3Service] Upload exitoso a S3 (después de retry, took ${duration2}ms)`);
          } finally {
            clearTimeout(t2);
          }
          
          const fileUrl = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`;
          console.log(`[S3Service] URL del archivo: ${fileUrl}`);
          
          return { fileUrl, key };
        }
      }
      
      console.error(`[S3Service] Error en S3 upload:`, error);
      throw error;
    }
  }

  /**
   * Elimina un archivo de S3
   */
  static async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    });

    await s3Client.send(command);
  }

  /**
   * Genera múltiples URLs pre-firmadas para subida
   */
  static async getMultiplePresignedUrls(
    files: Array<{ filename: string; contentType: string }>,
    folder: string = 'exercises',
  ): Promise<PresignedUrlResponse[]> {
    return Promise.all(
      files.map((file) =>
        this.getPresignedUploadUrl(file.filename, file.contentType, folder)
      )
    );
  }
  
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
  static extractKeyFromUrl(keyOrUrl: string): string | null {
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