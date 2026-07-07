// Parametrización clínica de las actividades VANI.
//
// Cada motor de juego emite métricas crudas distintas; aquí se normalizan a un
// esquema canónico único que es el que se persiste en Firestore
// (telemetria_actividades) y el que consume la Cloud Function que genera el
// informe para el tutor con Gemini.
//
// Dimensiones evaluadas "por debajo" (invisibles para el niño):
// - SEGURIDAD_TRAZO:      firmeza del trazo (inversa de la desviación del camino)
// - CONTINUIDAD_TRAZO:    trazo sostenido (inversa de levantamientos del dedo)
// - PRECISION:            errores / intentos fallidos en la tarea
// - LATERALIDAD:          respuesta ante estímulos a la izquierda vs derecha
// - EJE_VERTICAL:         respuesta ante estímulos arriba vs abajo
// - COMPRENSION_LECTORA:  aciertos en quiz / deletreo

export const HABILIDADES = {
  SEGURIDAD_TRAZO: 'SEGURIDAD_TRAZO',
  CONTINUIDAD_TRAZO: 'CONTINUIDAD_TRAZO',
  PRECISION: 'PRECISION',
  LATERALIDAD: 'LATERALIDAD',
  EJE_VERTICAL: 'EJE_VERTICAL',
  COMPRENSION_LECTORA: 'COMPRENSION_LECTORA',
};

// Qué motores de juego ejercitan cada habilidad. Se usa en dos direcciones:
// para saber qué habilidades evalúa una actividad, y para armar el plan de
// apoyo (con gaps activos, solo se desbloquean los motores que los trabajan).
export const MOTORES_POR_HABILIDAD = {
  SEGURIDAD_TRAZO: ['trazo', 'laberinto', 'color'],
  CONTINUIDAD_TRAZO: ['trazo', 'laberinto'],
  PRECISION: ['busqueda', 'diferencias', 'arrastre', 'memory', 'secuencias', 'sombras', 'rompecabezas', 'reveal'],
  LATERALIDAD: ['arrastre', 'busqueda', 'diferencias'],
  EJE_VERTICAL: ['busqueda', 'sombras', 'reveal'],
  COMPRENSION_LECTORA: ['quiz', 'deletreo'],
};

export const NOMBRES_HABILIDAD = {
  SEGURIDAD_TRAZO: 'Seguridad de trazo',
  CONTINUIDAD_TRAZO: 'Continuidad de trazo',
  PRECISION: 'Precisión',
  LATERALIDAD: 'Lateralidad (izquierda-derecha)',
  EJE_VERTICAL: 'Orientación arriba-abajo',
  COMPRENSION_LECTORA: 'Comprensión lectora',
};

export function motoresParaGaps(gaps) {
  const motores = new Set();
  (gaps || []).forEach(gap => {
    (MOTORES_POR_HABILIDAD[gap.habilidad || gap] || []).forEach(m => motores.add(m));
  });
  return [...motores];
}

const clamp100 = (v) => Math.max(0, Math.min(100, Math.round(v)));

export function calcularEdadAnios(fechaNacimiento) {
  if (!fechaNacimiento) return null;
  const nacimiento = new Date(fechaNacimiento);
  if (Number.isNaN(nacimiento.getTime())) return null;
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const m = hoy.getMonth() - nacimiento.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
  return edad;
}

// Índice de asimetría entre dos zonas: -100 (solo domina A) .. +100 (solo domina B).
// Cerca de 0 = respuesta equilibrada. null si no hubo estímulos suficientes.
function indiceAsimetria(zonaA, zonaB) {
  const totalA = (zonaA?.aciertos || 0) + (zonaA?.errores || 0);
  const totalB = (zonaB?.aciertos || 0) + (zonaB?.errores || 0);
  if (totalA === 0 || totalB === 0) return null;
  const tasaA = (zonaA.aciertos || 0) / totalA;
  const tasaB = (zonaB.aciertos || 0) / totalB;
  return Math.round((tasaB - tasaA) * 100);
}

/**
 * Normaliza las métricas crudas de cualquier motor al esquema canónico.
 * @param {object} actividad - { motor, eje, nivel, ... }
 * @param {object} raw - payload de onComplete del motor
 */
export function normalizarMetricas(actividad, raw = {}) {
  const errores = raw.errores ?? raw.intentosFallidos ?? raw.erroresOrtograficos ?? 0;

  const metricas = {
    seguridadTrazo: null,
    continuidadTrazo: null,
    errores,
    lateralidad: null,
    ejeVertical: null,
    comprensionLectora: null,
    tiempoSegundos: raw.tiempoCompletadoSegundos ?? null,
    tiempoPromedioRespuestaSegundos: raw.tiempoPromedioPorObjeto != null ? Number(raw.tiempoPromedioPorObjeto) : null,
  };

  // Trazo: continuidad desde levantamientos, seguridad desde la desviación del camino
  if (raw.levantamientosDedo != null) {
    metricas.continuidadTrazo = clamp100(100 - raw.levantamientosDedo * 15);
  }
  if (raw.desviacionPromedioTrazo != null) {
    metricas.seguridadTrazo = clamp100(100 - raw.desviacionPromedioTrazo * 2);
  } else if (raw.levantamientosDedo != null) {
    // Motores de trazo sin medición de desviación: aproximar con levantamientos + errores
    metricas.seguridadTrazo = clamp100(100 - raw.levantamientosDedo * 10 - errores * 5);
  }

  // Comprensión lectora (quiz / deletreo): cada error descuenta sobre una base de 100
  if (['quiz', 'deletreo'].includes(actividad.motor)) {
    metricas.comprensionLectora = clamp100(100 - errores * 20);
  }

  // Respuesta espacial (motores instrumentados: arrastre, búsqueda visual)
  // raw.respuestasEspaciales = { izquierda: {aciertos, errores}, derecha: {...}, arriba: {...}, abajo: {...} }
  if (raw.respuestasEspaciales) {
    const e = raw.respuestasEspaciales;
    const indiceLat = indiceAsimetria(e.izquierda, e.derecha);
    if (indiceLat !== null) {
      metricas.lateralidad = {
        izquierda: { aciertos: e.izquierda.aciertos || 0, errores: e.izquierda.errores || 0 },
        derecha: { aciertos: e.derecha.aciertos || 0, errores: e.derecha.errores || 0 },
        // > 0: responde mejor a la derecha; < 0: mejor a la izquierda
        indice: indiceLat,
      };
    }
    const indiceVert = indiceAsimetria(e.arriba, e.abajo);
    if (indiceVert !== null) {
      metricas.ejeVertical = {
        arriba: { aciertos: e.arriba.aciertos || 0, errores: e.arriba.errores || 0 },
        abajo: { aciertos: e.abajo.aciertos || 0, errores: e.abajo.errores || 0 },
        // > 0: responde mejor abajo; < 0: mejor arriba
        indice: indiceVert,
      };
    }
  }

  return metricas;
}

/**
 * Construye el documento completo que se guarda en telemetria_actividades.
 */
export function construirRegistroActividad({ actividad, raw, perfil, personajeId }) {
  return {
    perfilId: perfil?.id || 'huesped',
    tutorId: perfil?.tutorId || null,
    nombreNino: perfil?.nombre || null,
    edadAnios: calcularEdadAnios(perfil?.fechaNacimiento),
    nivelEscolar: perfil?.nivelEducacional || null,
    personajeId: personajeId || actividad.id.split('_')[0],
    actividadId: actividad.id,
    motor: actividad.motor,
    eje: actividad.eje,
    nivel: actividad.nivel,
    fecha: new Date().toISOString(),
    metricas: normalizarMetricas(actividad, raw),
    metricasCrudas: raw,
  };
}
