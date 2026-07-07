// Base de Datos Programática de Actividades VANI - V2 (Master Library)
// Genera las actividades por personaje cruzando motores x 3 niveles (una instancia por combinación).

const PERSONAJES = ['leo', 'lulu', 'koda', 'nia', 'sora', 'bibi'];
const CAPITULOS = 15; // Capítulos del 0 al 14

export const ENGINE_TYPES = {
  // Foco y Atención
  LABERINTO: 'laberinto',
  DIFERENCIAS: 'diferencias',
  BUSQUEDA: 'busqueda',
  PAUSA_ACTIVA: 'pausa_activa',
  REVEAL: 'reveal',
  COLOR: 'color',
  // Lógica y Memoria
  SECUENCIAS: 'secuencias',
  SOMBRAS: 'sombras',
  ROMPECABEZAS: 'rompecabezas',
  MEMORY: 'memory',
  // Lectoescritura
  TRAZO: 'trazo',
  ARRASTRE: 'arrastre',
  DELETREO: 'deletreo',
  QUIZ: 'quiz'
};

const EJES = {
  ATENCION: [ENGINE_TYPES.LABERINTO, ENGINE_TYPES.DIFERENCIAS, ENGINE_TYPES.BUSQUEDA, ENGINE_TYPES.PAUSA_ACTIVA, ENGINE_TYPES.REVEAL, ENGINE_TYPES.COLOR],
  MEMORIA: [ENGINE_TYPES.SECUENCIAS, ENGINE_TYPES.SOMBRAS, ENGINE_TYPES.ROMPECABEZAS, ENGINE_TYPES.MEMORY],
  LECTURA: [ENGINE_TYPES.TRAZO, ENGINE_TYPES.ARRASTRE, ENGINE_TYPES.DELETREO, ENGINE_TYPES.QUIZ]
};

const PROPS_POR_PERSONAJE = {
  leo: ['lámpara_antigua', 'mochila_explorador', 'lupa_dorada'],
  lulu: ['nube_brillante', 'ostra_perla', 'gema_marina'],
  koda: ['pez_colores', 'red_pesca', 'bote_madera'],
  nia: ['hoja_cristalina', 'rama_magica', 'flor_luminosa'],
  sora: ['pluma_viento', 'nido_alto', 'brisa_suave'],
  bibi: ['flor_desierto', 'roca_caliente', 'sol_brillante']
};

const getAssetForIndex = (personaje, index) => {
  // Cada personaje tiene 42 imágenes de escena reales: {p}_cuento{1..14}_{1..3}.png,
  // exactamente una por actividad (14 motores x 3 niveles). Asignación 1:1 sin repetir.
  const i = (index - 1) % 42;               // 0..41
  const capitulo = Math.floor(i / 3) + 1;   // 1..14
  const escena = (i % 3) + 1;               // 1..3
  return `/${personaje}_cuento${capitulo}_${escena}.png`;
};

const generarMasterLibrary = () => {
  const library = {};

  PERSONAJES.forEach(personaje => {
    library[personaje] = [];
    let actIndex = 0;
    
    const propsDisponibles = PROPS_POR_PERSONAJE[personaje] || ['objeto_mágico'];

    // Generamos actividades para cada eje: exactamente UNA por motor y por nivel,
    // de modo que cada juego exista en sus 3 niveles y el filtro de dificultad
    // muestre una sola instancia de cada uno (14 motores x 3 niveles = 42 por pj).
    Object.entries(EJES).forEach(([ejeName, motores]) => {
      motores.forEach(motor => {
        for (let nivel = 1; nivel <= 3; nivel++) {
          actIndex++;

          // Asignar prop contextual (rotativo)
          const propAsignado = propsDisponibles[actIndex % propsDisponibles.length];

          library[personaje].push({
            id: `${personaje}_${motor}_n${nivel}`,
            eje: ejeName,
            motor: motor,
            nivel: nivel,
            imagenAsset: getAssetForIndex(personaje, actIndex),
            contextAssets: {
              propPrincipal: `${personaje}_${propAsignado}`
            },
            isUnlocked: false // Por defecto bloqueada (se manejará en estado/telemetría)
          });
        }
      });
    });
  });

  return library;
};

export const MASTER_LIBRARY = generarMasterLibrary();

// Obtiene todas las actividades de un eje para un personaje
export const getActividadesPorEje = (personaje, ejeName) => {
  return MASTER_LIBRARY[personaje]?.filter(a => a.eje === ejeName) || [];
};

// Obtiene una actividad específica
export const getActividad = (personaje, id) => {
  return MASTER_LIBRARY[personaje]?.find(a => a.id === id) || null;
};
