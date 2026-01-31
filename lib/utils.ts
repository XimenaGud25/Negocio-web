import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea la duración de un plan en semanas
 * @param weeksMin - Duración mínima en semanas
 * @param weeksMax - Duración máxima en semanas (opcional)
 * @returns String formateado: "X semanas" o "X-Y semanas"
 */
export function formatPlanDuration(weeksMin: number, weeksMax?: number | null): string {
  if (weeksMax && weeksMax !== weeksMin) {
    return `${weeksMin}-${weeksMax} semanas`;
  }
  return `${weeksMin} semanas`;
}
