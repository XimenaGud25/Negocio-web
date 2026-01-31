-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "DocumentType" ADD VALUE 'TRAINING';
ALTER TYPE "DocumentType" ADD VALUE 'IMAGE';

-- AlterTable
ALTER TABLE "documents" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "fileName" TEXT,
ADD COLUMN     "filePath" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "userId" TEXT,
ALTER COLUMN "enrollmentId" DROP NOT NULL,
ALTER COLUMN "filename" DROP NOT NULL,
ALTER COLUMN "url" DROP NOT NULL,
ALTER COLUMN "uploadedAt" DROP NOT NULL,
ALTER COLUMN "uploadedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "plans" ADD COLUMN     "durationWeeksMax" INTEGER,
ADD COLUMN     "durationWeeksMin" INTEGER NOT NULL DEFAULT 4,
ALTER COLUMN "durationDays" DROP NOT NULL;

-- CreateTable
CREATE TABLE "user_videos" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "s3Key" TEXT,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "duration" INTEGER,
    "title" TEXT,
    "description" TEXT,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_videos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_videos_userId_uploadedAt_idx" ON "user_videos"("userId", "uploadedAt");

-- CreateIndex
CREATE INDEX "documents_userId_type_idx" ON "documents"("userId", "type");

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_videos" ADD CONSTRAINT "user_videos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
