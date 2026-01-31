/**
 * Script de migración: Documentos Locales → AWS S3
 * 
 * Este script migra todos los documentos almacenados localmente en 
 * /public/uploads/documents a AWS S3.
 * 
 * Uso:
 * 1. Asegúrate de tener las variables de entorno de AWS configuradas
 * 2. Ejecuta: tsx scripts/migrate-documents-to-s3.ts
 */

import { PrismaClient } from '@prisma/client';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const S3_BUCKET = process.env.S3_BUCKET;
const S3_REGION = process.env.AWS_S3_REGION || 'us-east-1';

if (!S3_BUCKET) {
  console.error('❌ Error: S3_BUCKET no está configurado en las variables de entorno');
  process.exit(1);
}

interface MigrationStats {
  total: number;
  migrated: number;
  skipped: number;
  failed: number;
  errors: Array<{ document: string; error: string }>;
}

async function migrateDocumentsToS3(): Promise<MigrationStats> {
  const stats: MigrationStats = {
    total: 0,
    migrated: 0,
    skipped: 0,
    failed: 0,
    errors: [],
  };

  console.log('🚀 Iniciando migración de documentos a S3...\n');

  try {
    // Obtener todos los documentos de la base de datos
    const documents = await prisma.document.findMany({
      select: {
        id: true,
        filename: true,
        url: true,
        type: true,
        fileSize: true,
      },
    });

    stats.total = documents.length;
    console.log(`📊 Total de documentos encontrados: ${stats.total}\n`);

    for (const doc of documents) {
      console.log(`📄 Procesando: ${doc.filename || 'sin nombre'} (${doc.type})`);

      // Validar que tenga datos necesarios
      if (!doc.url || !doc.filename) {
        console.log(`  ⚠️  Documento sin URL o filename, omitiendo...\n`);
        stats.skipped++;
        continue;
      }

      // Verificar si ya está en S3
      if (doc.url.includes('s3.amazonaws.com')) {
        console.log(`  ⏭️  Ya está en S3, omitiendo...\n`);
        stats.skipped++;
        continue;
      }

      try {
        // Construir ruta local del archivo
        const localPath = path.join(process.cwd(), 'public', doc.url);
        
        if (!existsSync(localPath)) {
          console.log(`  ⚠️  Archivo no encontrado en: ${localPath}`);
          stats.failed++;
          stats.errors.push({
            document: doc.filename,
            error: 'Archivo no encontrado en el sistema de archivos local',
          });
          console.log('');
          continue;
        }

        // Leer el archivo
        const fileBuffer = await readFile(localPath);
        console.log(`  📖 Archivo leído: ${fileBuffer.length} bytes`);

        // Determinar content type
        const ext = path.extname(doc.filename).toLowerCase();
        let contentType = 'application/octet-stream';
        
        if (ext === '.pdf') contentType = 'application/pdf';
        else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
        else if (ext === '.png') contentType = 'image/png';
        else if (ext === '.webp') contentType = 'image/webp';
        else if (ext === '.gif') contentType = 'image/gif';

        // Generar key única para S3
        const uniqueFilename = `${uuidv4()}${ext}`;
        const key = `documents/${uniqueFilename}`;

        console.log(`  ☁️  Subiendo a S3: ${key}`);

        // Subir a S3
        const command = new PutObjectCommand({
          Bucket: S3_BUCKET,
          Key: key,
          Body: fileBuffer,
          ContentType: contentType,
        });

        await s3Client.send(command);

        const s3Url = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${key}`;
        console.log(`  ✅ Subido exitosamente a: ${s3Url}`);

        // Actualizar base de datos
        await prisma.document.update({
          where: { id: doc.id },
          data: { 
            url: s3Url,
            updatedAt: new Date(),
          },
        });

        console.log(`  💾 Base de datos actualizada\n`);
        stats.migrated++;

      } catch (error) {
        console.error(`  ❌ Error procesando ${doc.filename}:`, error);
        stats.failed++;
        stats.errors.push({
          document: doc.filename,
          error: error instanceof Error ? error.message : 'Error desconocido',
        });
        console.log('');
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE MIGRACIÓN');
    console.log('='.repeat(60));
    console.log(`Total de documentos:     ${stats.total}`);
    console.log(`✅ Migrados exitosamente: ${stats.migrated}`);
    console.log(`⏭️  Ya estaban en S3:     ${stats.skipped}`);
    console.log(`❌ Fallidos:              ${stats.failed}`);
    console.log('='.repeat(60) + '\n');

    if (stats.errors.length > 0) {
      console.log('⚠️  ERRORES ENCONTRADOS:\n');
      stats.errors.forEach(({ document, error }, index) => {
        console.log(`${index + 1}. ${document}`);
        console.log(`   Error: ${error}\n`);
      });
    }

    return stats;

  } catch (error) {
    console.error('\n❌ Error fatal durante la migración:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar migración
if (require.main === module) {
  migrateDocumentsToS3()
    .then((stats) => {
      if (stats.failed === 0) {
        console.log('✅ Migración completada exitosamente!');
        process.exit(0);
      } else {
        console.log('⚠️  Migración completada con errores. Revisa el resumen arriba.');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('❌ Error fatal:', error);
      process.exit(1);
    });
}

export { migrateDocumentsToS3 };
