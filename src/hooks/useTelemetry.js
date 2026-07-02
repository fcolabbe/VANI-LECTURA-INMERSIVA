import { useState, useEffect } from 'react';

// Estructura de telemetría:
// { trazo: { fallos: 0, total: 0 }, lectura: { errores: 0, total: 0 }, atencion: { errores: 0, total: 0 } }

export const useTelemetry = () => {
  const [telemetry, setTelemetry] = useState({
    trazo: { lifts: 0, deviations: 0, plays: 0 },
    lectura: { errors: 0, plays: 0 },
    atencion: { errors: 0, reactionTime: 0, plays: 0 }
  });

  useEffect(() => {
    // Load from local storage
    const saved = localStorage.getItem('vani_telemetry');
    if (saved) {
      try {
        setTelemetry(JSON.parse(saved));
      } catch(e) {}
    }
  }, []);

  const saveTelemetry = (newTelemetry) => {
    setTelemetry(newTelemetry);
    localStorage.setItem('vani_telemetry', JSON.stringify(newTelemetry));
  };

  const recordActivity = (engineType, metrics) => {
    const next = { ...telemetry };
    
    if (['laberinto', 'trazo'].includes(engineType)) {
      next.trazo.lifts += metrics.levantamientosDedo || 0;
      next.trazo.deviations += metrics.desviacionPromedioTrazo || 0;
      next.trazo.plays += 1;
    } 
    else if (['quiz', 'deletreo'].includes(engineType)) {
      next.lectura.errors += metrics.erroresOrtograficos || metrics.errores || 0;
      next.lectura.plays += 1;
    }
    else if (['busqueda', 'pausaActiva', 'arrastre', 'secuencias'].includes(engineType)) {
      next.atencion.errors += metrics.intentosFallidos || metrics.errores || 0;
      if (metrics.tiempoReaccionPromedio) {
        next.atencion.reactionTime = (next.atencion.reactionTime + metrics.tiempoReaccionPromedio) / 2;
      }
      next.atencion.plays += 1;
    }

    saveTelemetry(next);
  };

  const getRecommendations = () => {
    const recomendations = [];
    
    // Si hay muchos levantamientos de dedo, sugerir más Grafomotricidad
    if (telemetry.trazo.plays > 0 && (telemetry.trazo.lifts / telemetry.trazo.plays) > 2) {
      recomendations.push('trazo');
    }
    
    // Si hay errores de lectura, sugerir Quiz y Deletreo visual
    if (telemetry.lectura.plays > 0 && (telemetry.lectura.errors / telemetry.lectura.plays) > 1.5) {
      recomendations.push('quiz');
    }

    // Atención dispersa
    if (telemetry.atencion.plays > 0 && (telemetry.atencion.errors / telemetry.atencion.plays) > 3) {
      recomendations.push('pausaActiva');
    }

    return recomendations;
  };

  return {
    telemetry,
    recordActivity,
    getRecommendations
  };
};
