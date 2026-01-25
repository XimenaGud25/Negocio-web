import { prisma } from "../lib/prisma";

async function migrateDocuments() {
  try {
    console.log("Starting document migration...");

    // Obtener todos los documentos sin userId
    const documentsToMigrate = await prisma.document.findMany({
      where: {
        userId: null,
      },
      include: {
        enrollment: {
          include: {
            user: true,
          },
        },
      },
    });

    console.log(`Found ${documentsToMigrate.length} documents to migrate`);

    for (const doc of documentsToMigrate) {
      if (doc.enrollment?.user) {
        await prisma.document.update({
          where: { id: doc.id },
          data: {
            userId: doc.enrollment.user.id,
            fileName: doc.filename || `document_${doc.id}`,
            filePath: doc.url || `/uploads/documents/${doc.filename}`,
          },
        });
        console.log(`Migrated document ${doc.id} to user ${doc.enrollment.user.id}`);
      }
    }

    console.log("Document migration completed successfully");
  } catch (error) {
    console.error("Error during migration:", error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateDocuments();