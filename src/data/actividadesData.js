// Base de Datos Programática de Actividades VANI - V2 (Master Library)
// Genera más de 100 actividades dinámicas por personaje cruzando motores, niveles y 45 assets.

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
  // Rotamos entre cuento0 a cuento14, e img 1 a 3. Por ahora mock con personaje_cuentoX.png
  // Cuando estén todas las imgs: `/${personaje}_cap${Math.floor((index%45)/3)}_img${(index%3)+1}.png`
  const imgNum = (index % 3); 
  return `/${personaje}_cuento${imgNum}.png`; 
};

const generarMasterLibrary = () => {
  const library = {};

  PERSONAJES.forEach(personaje => {
    library[personaje] = [];
    let actIndex = 0;
    
    const propsDisponibles = PROPS_POR_PERSONAJE[personaje] || ['objeto_mágico'];

    // Generamos actividades para cada eje, iterando por motores y 3 niveles de dificultad.
    Object.entries(EJES).forEach(([ejeName, motores]) => {
      motores.forEach(motor => {
        // Cada motor tendrá múltiples variaciones (Nivel 1, 2, 3) repetidas unas cuantas veces para volumen.
        for (let nivel = 1; nivel <= 3; nivel++) {
          // 3 instancias de cada (motor x nivel) = 3 * 3 * 14 = 126 actividades por pj
          for (let rep = 1; rep <= 3; rep++) {
            actIndex++;
            
            // Asignar prop contextual (rotativo)
            const propAsignado = propsDisponibles[actIndex % propsDisponibles.length];
            
            library[personaje].push({
              id: `${personaje}_${motor}_n${nivel}_r${rep}`,
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
