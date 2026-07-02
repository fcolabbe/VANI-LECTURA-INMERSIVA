/**
 * AI Adaptive Engine (Simulación determinista local)
 * Evalúa las métricas almacenadas en telemetría para determinar la Zona de Desarrollo Próximo (ZDP) del niño.
 * Retorna el nivel máximo recomendado para una categoría o global.
 */

// Heurísticas simples de evaluación
// 1. Si el niño ha completado al menos 5 actividades de nivel 1 con éxito (tiempo razonable, pocos errores), sugerimos desbloquear nivel 2.
// 2. Si hay muchos fallos en un nivel, se bloquea el siguiente nivel para evitar frustración (ZDP).

export function evaluateZDP(telemetry) {
  if (!telemetry) return 1;

  const totalPlays = (telemetry.trazo?.plays || 0) + (telemetry.lectura?.plays || 0) + (telemetry.atencion?.plays || 0);

  // Criterio de promoción heurístico:
  // - Para pasar al Nivel 2: Necesita haber jugado al menos 5 actividades en total.
  // - Para pasar al Nivel 3: Necesita haber jugado al menos 12 actividades en total.
  // Además, si el porcentaje de errores/fallos es muy alto, podríamos retenerlo, pero para esta versión
  // basaremos el avance en "experiencia" básica (plays).
  
  let recommendedMaxLevel = 1;

  if (totalPlays >= 5) {
    recommendedMaxLevel = 2;
  }

  if (totalPlays >= 12) {
    recommendedMaxLevel = 3;
  }

  return recommendedMaxLevel;
}
