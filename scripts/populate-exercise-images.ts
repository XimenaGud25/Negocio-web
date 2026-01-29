import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const EXERCISE_IMAGES = {
  // Mapeo de ejercicios a imágenes en S3
  'sentadilla libre': ['exercises/bodyweight-squat.jpg'],
  'peso muerto rumano': ['exercises/romanian-deadlift.jpg'],
  'desplantes': ['exercises/lunges.jpg'],
  'dominadas': ['exercises/pull-ups.jpg'],
  'lagartijas': ['exercises/push-ups.jpg'],
  'plancha': ['exercises/plank.jpg'],
  'crunch': ['exercises/crunch.jpg'],
  'puente': ['exercises/glute-bridge.jpg'],
  'sentadilla sumo': ['exercises/sumo-squat.jpg'],
  'búlgara': ['exercises/bulgarian-split-squat.jpg'],
  'step up': ['exercises/step-up.jpg'],
  'extensiones': ['exercises/leg-extension.jpg'],
  'femoral acostado': ['exercises/lying-leg-curl.jpg'],
  'pantorrilla de pie': ['exercises/standing-calf-raise.jpg'],
  'press banca plano': ['exercises/bench-press.jpg'],
  'press militar': ['exercises/shoulder-press.jpg'],
  'curl bíceps mancuernas': ['exercises/dumbbell-curl.jpg'],
  'extensión tríceps cuerda': ['exercises/rope-triceps-pushdown.jpg'],
  'elevaciones laterales': ['exercises/lateral-raises.jpg'],
  'jalón al pecho': ['exercises/lat-pulldown.jpg'],
  'remo mancuernas': ['exercises/dumbbell-row.jpg'],
  // Agregar más según tus ejercicios...
};

async function populateExerciseImages() {
  console.log('🎯 Poblando imágenes de ejercicios...');

  for (const [exerciseName, images] of Object.entries(EXERCISE_IMAGES)) {
    try {
      const exercise = await prisma.exercise.findFirst({
        where: {
          OR: [
            { nameEs: { contains: exerciseName, mode: 'insensitive' } },
            { nameEn: { contains: exerciseName, mode: 'insensitive' } },
          ],
        },
      });

      if (exercise) {
        await prisma.exercise.update({
          where: { id: exercise.id },
          data: { images },
        });
        console.log(`✅ ${exercise.nameEs} → ${images.join(', ')}`);
      } else {
        console.log(`⚠️  No encontrado: ${exerciseName}`);
      }
    } catch (error) {
      console.error(`❌ Error con ${exerciseName}:`, error);
    }
  }

  console.log('✨ Población completada!');
}

populateExerciseImages()
  .catch(console.error)
  .finally(() => prisma.$disconnect());