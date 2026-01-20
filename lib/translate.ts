// Comprehensive translation dictionary for exercise terms
const translations: Record<string, string> = {
  // Body parts
  "back": "espalda",
  "cardio": "cardio",
  "chest": "pecho",
  "lower arms": "antebrazos",
  "lower legs": "piernas inferiores",
  "neck": "cuello",
  "shoulders": "hombros",
  "upper arms": "brazos superiores",
  "upper legs": "piernas superiores",
  "waist": "cintura",
  
  // Equipment
  "barbell": "barra",
  "dumbbell": "mancuerna",
  "body weight": "peso corporal",
  "cable": "polea",
  "machine": "máquina",
  "kettlebell": "pesa rusa",
  "stretches": "estiramientos",
  "band": "banda elástica",
  "medicine ball": "balón medicinal",
  "stability ball": "pelota de estabilidad",
  "roller": "rodillo",
  "assisted": "asistido",
  "leverage machine": "máquina de palanca",
  "ez barbell": "barra EZ",
  "sled machine": "máquina trineo",
  "upper body": "tren superior",
  "weighted": "con peso",
  "bosu ball": "bosu",
  "resistance band": "banda de resistencia",
  "suspension": "suspensión",
  "tire": "neumático",
  "trap bar": "barra hexagonal",
  "rope": "cuerda",
  "wheel roller": "rueda abdominal",
  "smith machine": "máquina smith",
  "olympic barbell": "barra olímpica",
  "hammer": "martillo",
  "elliptical machine": "máquina elíptica",
  "skierg machine": "máquina de ski",
  "stationary bike": "bicicleta estática",
  
  // Targets / Muscles
  "abductors": "abductores",
  "abs": "abdominales",
  "adductors": "aductores",
  "biceps": "bíceps",
  "calves": "pantorrillas",
  "cardiovascular system": "sistema cardiovascular",
  "delts": "deltoides",
  "forearms": "antebrazos",
  "glutes": "glúteos",
  "hamstrings": "isquiotibiales",
  "lats": "dorsales",
  "levator scapulae": "elevador de la escápula",
  "pectorals": "pectorales",
  "quads": "cuádriceps",
  "serratus anterior": "serrato anterior",
  "spine": "columna",
  "traps": "trapecios",
  "triceps": "tríceps",
  "upper back": "espalda superior",
  "obliques": "oblicuos",
  "hip flexors": "flexores de cadera",
  "lower back": "espalda baja",
  "rhomboids": "romboides",
  "rear delts": "deltoides posterior",
  "front delts": "deltoides anterior",
  "lateral delts": "deltoides lateral",
  
  // Common exercise words
  "press": "press",
  "curl": "curl",
  "extension": "extensión",
  "fly": "aperturas",
  "raise": "elevación",
  "row": "remo",
  "pull": "jalón",
  "push": "empuje",
  "squat": "sentadilla",
  "lunge": "zancada",
  "deadlift": "peso muerto",
  "crunch": "crunch",
  "plank": "plancha",
  "dip": "fondo",
  "pullup": "dominada",
  "pull-up": "dominada",
  "pushup": "flexión",
  "push-up": "flexión",
  "bench": "banco",
  "incline": "inclinado",
  "decline": "declinado",
  "seated": "sentado",
  "standing": "de pie",
  "lying": "acostado",
  "supine": "supino",
  "prone": "prono",
  "reverse": "reverso",
  "alternating": "alternado",
  "single": "único",
  "double": "doble",
  "leg": "pierna",
  "arm": "brazo",
  "shoulder": "hombro",
  "grip": "agarre",
  "wide": "ancho",
  "narrow": "estrecho",
  "close": "cerrado",
  "overhand": "pronación",
  "underhand": "supinación",
  "neutral": "neutro",
};

// Common instruction phrases translations
const instructionTranslations: Record<string, string> = {
  "stand": "párate",
  "sit": "siéntate",
  "lie": "acuéstate",
  "hold": "sostén",
  "grab": "agarra",
  "grip": "agarra",
  "lower": "baja",
  "raise": "levanta",
  "lift": "levanta",
  "push": "empuja",
  "pull": "jala",
  "extend": "extiende",
  "flex": "flexiona",
  "bend": "dobla",
  "straighten": "endereza",
  "squeeze": "aprieta",
  "contract": "contrae",
  "relax": "relaja",
  "repeat": "repite",
  "return": "regresa",
  "slowly": "lentamente",
  "quickly": "rápidamente",
  "maintain": "mantén",
  "keep": "mantén",
  "your": "tu",
  "the": "el/la",
  "and": "y",
  "with": "con",
  "to": "a",
  "of": "de",
  "in": "en",
  "at": "en",
  "from": "desde",
  "for": "por",
  "on": "sobre",
  "feet": "pies",
  "hands": "manos",
  "arms": "brazos",
  "legs": "piernas",
  "back": "espalda",
  "chest": "pecho",
  "core": "core",
  "body": "cuerpo",
  "head": "cabeza",
  "neck": "cuello",
  "shoulders": "hombros",
  "elbows": "codos",
  "wrists": "muñecas",
  "knees": "rodillas",
  "hips": "caderas",
  "ankles": "tobillos",
  "position": "posición",
  "starting": "inicial",
  "movement": "movimiento",
  "exercise": "ejercicio",
  "rep": "repetición",
  "reps": "repeticiones",
  "set": "serie",
  "sets": "series",
  "rest": "descanso",
  "pause": "pausa",
  "seconds": "segundos",
  "minutes": "minutos",
  "weight": "peso",
  "resistance": "resistencia",
  "parallel": "paralelo",
  "perpendicular": "perpendicular",
  "floor": "suelo",
  "ground": "suelo",
  "up": "arriba",
  "down": "abajo",
  "forward": "adelante",
  "backward": "atrás",
  "left": "izquierda",
  "right": "derecha",
  "side": "lado",
  "front": "frente",
  "behind": "detrás",
};

export function translateTerm(term: string): string {
  if (!term) return "";
  const lower = term.toLowerCase().trim();
  return translations[lower] || term;
}

export function translateExerciseName(name: string): string {
  if (!name) return "";
  
  // Simple word-by-word translation for common patterns
  const words = name.toLowerCase().split(" ");
  const translated = words.map(word => {
    // Remove punctuation for lookup
    const clean = word.replace(/[^a-z-]/g, "");
    return translations[clean] || word;
  });
  
  // Capitalize first letter
  const result = translated.join(" ");
  return result.charAt(0).toUpperCase() + result.slice(1);
}

export function translateInstruction(instruction: string): string {
  if (!instruction) return "";
  
  let result = instruction.toLowerCase();
  
  // Replace common words and phrases
  Object.entries(instructionTranslations).forEach(([en, es]) => {
    // Use word boundaries to avoid partial replacements
    const regex = new RegExp(`\\b${en}\\b`, "gi");
    result = result.replace(regex, es);
  });
  
  // Also apply muscle/body part translations
  Object.entries(translations).forEach(([en, es]) => {
    const regex = new RegExp(`\\b${en}\\b`, "gi");
    result = result.replace(regex, es);
  });
  
  // Capitalize first letter
  return result.charAt(0).toUpperCase() + result.slice(1);
}

export function translateInstructions(instructions: string[]): string[] {
  return instructions.map(translateInstruction);
}

export function translateSecondaryMuscles(muscles: string[]): string[] {
  return muscles.map(muscle => translateTerm(muscle));
}
