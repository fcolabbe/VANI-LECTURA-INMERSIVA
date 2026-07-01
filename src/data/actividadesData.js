// Base de Datos Programática de Actividades VANI
// Genera ~252 actividades (6 personajes x 14 capítulos x 3 fases) con curva de dificultad dinámica (1 al 6)

const PERSONAJES = ['leo', 'lulu', 'koda', 'nia', 'sora', 'bibi'];
const CAPITULOS = 14;

// Tipos de motores disponibles
export const ENGINE_TYPES = {
  LABERINTO: 'laberinto',
  BUSQUEDA: 'busqueda',
  ROMPECABEZAS: 'rompecabezas',
  DIFERENCIAS: 'diferencias',
  SECUENCIAS: 'secuencias',
  SOMBRAS: 'sombras',
  MEMORY: 'memory',
  REVEAL: 'reveal',
  COLOR: 'color'
};

// Mapeo temático de motores preferidos por personaje para dar variedad
const PREFERRED_ENGINES = {
  leo: [ENGINE_TYPES.LABERINTO, ENGINE_TYPES.ROMPECABEZAS, ENGINE_TYPES.SOMBRAS, ENGINE_TYPES.COLOR], // Tierra (Trazos, formas)
  lulu: [ENGINE_TYPES.BUSQUEDA, ENGINE_TYPES.DIFERENCIAS, ENGINE_TYPES.LABERINTO, ENGINE_TYPES.REVEAL], // Agua (Flotar, buscar)
  koda: [ENGINE_TYPES.SECUENCIAS, ENGINE_TYPES.SOMBRAS, ENGINE_TYPES.ROMPECABEZAS, ENGINE_TYPES.MEMORY], // Nieve (Huellas, lógica)
  nia: [ENGINE_TYPES.ROMPECABEZAS, ENGINE_TYPES.COLOR, ENGINE_TYPES.SECUENCIAS], // Fuego (Energía, armar)
  sora: [ENGINE_TYPES.REVEAL, ENGINE_TYPES.SOMBRAS, ENGINE_TYPES.BUSQUEDA], // Aire (Perspectiva, descubrir)
  bibi: [ENGINE_TYPES.MEMORY, ENGINE_TYPES.SECUENCIAS, ENGINE_TYPES.ROMPECABEZAS] // Cristal (Reflejos, orden)
};

/**
 * Calcula la dificultad cognitiva (1 al 6) basada en el progreso del niño (capítulo actual).
 * Cap 1-2: Nivel 1 (Intro)
 * Cap 3-5: Nivel 2 (Desarrollo Temprano)
 * Cap 6-8: Nivel 3 (Consolidación)
 * Cap 9-11: Nivel 4 (Desafío Medio)
 * Cap 12-13: Nivel 5 (Desafío Alto)
 * Cap 14: Nivel 6 (Maestría)
 */
const calcularDificultad = (capitulo) => {
  if (capitulo <= 2) return 1;
  if (capitulo <= 5) return 2;
  if (capitulo <= 8) return 3;
  if (capitulo <= 11) return 4;
  if (capitulo <= 13) return 5;
  return 6;
};

// Generador de Actividades
const generarActividades = () => {
  const db = {};

  PERSONAJES.forEach(personaje => {
    db[personaje] = {};
    const motores = PREFERRED_ENGINES[personaje];

    for (let cap = 1; cap <= CAPITULOS; cap++) {
      const dificultadBase = calcularDificultad(cap);
      
      // Cada capítulo tiene 3 actividades (Fase 1, Fase 2, Fase 3)
      db[personaje][`capitulo_${cap}`] = {
        fase1: {
          id: `${personaje}_c${cap}_f1`,
          motor: motores[0],
          dificultad: dificultadBase,
          imagenAsset: `/${personaje}_cuento1.png`, // Imagen provisional del Cuento 0
          metadata: { descripcion: "Desarrollo motriz y percepción inicial" }
        },
        fase2: {
          id: `${personaje}_c${cap}_f2`,
          motor: motores[1],
          dificultad: dificultadBase,
          imagenAsset: `/${personaje}_cuento2.png`, // Imagen provisional del Cuento 0
          metadata: { descripcion: "Desafío cognitivo intermedio" }
        },
        fase3: {
          id: `${personaje}_c${cap}_f3`,
          motor: motores[2],
          dificultad: Math.min(6, dificultadBase + (cap % 2 === 0 ? 1 : 0)), 
          imagenAsset: `/${personaje}_cuento3.png`, // Imagen provisional del Cuento 0
          metadata: { descripcion: "Cierre e integración" }
        }
      };
    }
  });

  return db;
};

export const actividadesData = generarActividades();

// Helper function para consultar una actividad específica
export const getActividad = (personaje, capitulo, fase) => {
  try {
    return actividadesData[personaje][`capitulo_${capitulo}`][`fase${fase}`];
  } catch (e) {
    console.error(`Actividad no encontrada: ${personaje} Cap${capitulo} Fase${fase}`);
    return null;
  }
};
