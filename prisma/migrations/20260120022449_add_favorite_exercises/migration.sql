-- CreateTable
CREATE TABLE "favorite_exercises" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseApiId" TEXT NOT NULL,
    "exerciseName" TEXT NOT NULL,
    "exerciseNameEs" TEXT,
    "bodyPart" TEXT NOT NULL,
    "bodyPartEs" TEXT,
    "equipment" TEXT NOT NULL,
    "equipmentEs" TEXT,
    "target" TEXT NOT NULL,
    "targetEs" TEXT,
    "gifUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorite_exercise_progress" (
    "id" TEXT NOT NULL,
    "favoriteExerciseId" TEXT NOT NULL,
    "sets" INTEGER NOT NULL,
    "reps" INTEGER NOT NULL,
    "weight" DECIMAL(6,2),
    "duration" INTEGER,
    "notes" TEXT,
    "logDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_exercise_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "favorite_exercises_userId_idx" ON "favorite_exercises"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "favorite_exercises_userId_exerciseApiId_key" ON "favorite_exercises"("userId", "exerciseApiId");

-- CreateIndex
CREATE INDEX "favorite_exercise_progress_favoriteExerciseId_logDate_idx" ON "favorite_exercise_progress"("favoriteExerciseId", "logDate");

-- AddForeignKey
ALTER TABLE "favorite_exercises" ADD CONSTRAINT "favorite_exercises_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_exercise_progress" ADD CONSTRAINT "favorite_exercise_progress_favoriteExerciseId_fkey" FOREIGN KEY ("favoriteExerciseId") REFERENCES "favorite_exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;
