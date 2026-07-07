const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { getFirestore } = require("firebase-admin/firestore");
const { initializeApp } = require("firebase-admin/app");
const { GoogleGenAI } = require("@google/genai");

initializeApp();
const db = getFirestore();

// Inicializamos el SDK de Gemini. En producción, la API Key debe configurarse en Firebase Secret Manager
// o usar Application Default Credentials si la función corre bajo la cuenta de servicio de GCP.
const ai = new GoogleGenAI({}); 

// ---------------------------------------------------------------------------
// PARÁMETROS DE REFERENCIA POR EDAD / NIVEL ESCOLAR
// Valores orientativos de desarrollo típico, configurables por el equipo
// psicopedagógico. NO constituyen criterio diagnóstico: sirven para detectar
// brechas que ameritan refuerzo dirigido u orientación profesional.
// ---------------------------------------------------------------------------
const REFERENCIAS_POR_EDAD = [
  { edadMin: 0, edadMax: 5, nivel: 'Pre-kínder / Kínder', seguridadTrazoMin: 40, continuidadTrazoMin: 40, erroresMax: 6, comprensionMin: 40, asimetriaMax: 45 },
  { edadMin: 6, edadMax: 7, nivel: '1º - 2º Básico', seguridadTrazoMin: 55, continuidadTrazoMin: 55, erroresMax: 4, comprensionMin: 60, asimetriaMax: 35 },
  { edadMin: 8, edadMax: 9, nivel: '3º - 4º Básico', seguridadTrazoMin: 70, continuidadTrazoMin: 70, erroresMax: 3, comprensionMin: 75, asimetriaMax: 25 },
  { edadMin: 10, edadMax: 99, nivel: '5º Básico o superior', seguridadTrazoMin: 80, continuidadTrazoMin: 80, erroresMax: 2, comprensionMin: 85, asimetriaMax: 20 },
];

const referenciaParaEdad = (edadAnios) => {
  const edad = typeof edadAnios === 'number' ? edadAnios : 7;
  return REFERENCIAS_POR_EDAD.find(r => edad >= r.edadMin && edad <= r.edadMax) || REFERENCIAS_POR_EDAD[1];
};

// Promedia las métricas canónicas de una lista de registros históricos
const agregarHistorico = (registros) => {
  const acum = { seguridadTrazo: [], continuidadTrazo: [], errores: [], comprensionLectora: [], indiceLateralidad: [], indiceEjeVertical: [] };
  registros.forEach(r => {
    const m = r.metricas || {};
    if (m.seguridadTrazo != null) acum.seguridadTrazo.push(m.seguridadTrazo);
    if (m.continuidadTrazo != null) acum.continuidadTrazo.push(m.continuidadTrazo);
    if (m.errores != null) acum.errores.push(m.errores);
    if (m.comprensionLectora != null) acum.comprensionLectora.push(m.comprensionLectora);
    if (m.lateralidad?.indice != null) acum.indiceLateralidad.push(m.lateralidad.indice);
    if (m.ejeVertical?.indice != null) acum.indiceEjeVertical.push(m.ejeVertical.indice);
  });
  const prom = (arr) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null;
  return {
    totalActividades: registros.length,
    seguridadTrazoPromedio: prom(acum.seguridadTrazo),
    continuidadTrazoPromedio: prom(acum.continuidadTrazo),
    erroresPromedio: prom(acum.errores),
    comprensionLectoraPromedio: prom(acum.comprensionLectora),
    indiceLateralidadPromedio: prom(acum.indiceLateralidad),
    indiceEjeVerticalPromedio: prom(acum.indiceEjeVertical),
  };
};

// Detección determinista de brechas (fallback y semilla para Gemini)
const detectarGaps = (agregado, referencia) => {
  const gaps = [];
  const brecha = (habilidad, valor, umbral, invertido = false) => {
    if (valor == null) return;
    const supera = invertido ? valor > umbral : valor < umbral;
    if (supera) {
      const distancia = invertido ? valor - umbral : umbral - valor;
      gaps.push({
        habilidad,
        severidad: distancia > umbral * 0.4 ? 'alta' : distancia > umbral * 0.15 ? 'moderada' : 'leve',
        valorObservado: valor,
        valorReferencia: umbral,
      });
    }
  };
  brecha('SEGURIDAD_TRAZO', agregado.seguridadTrazoPromedio, referencia.seguridadTrazoMin);
  brecha('CONTINUIDAD_TRAZO', agregado.continuidadTrazoPromedio, referencia.continuidadTrazoMin);
  brecha('PRECISION', agregado.erroresPromedio, referencia.erroresMax, true);
  brecha('COMPRENSION_LECTORA', agregado.comprensionLectoraPromedio, referencia.comprensionMin);
  if (agregado.indiceLateralidadPromedio != null && Math.abs(agregado.indiceLateralidadPromedio) > referencia.asimetriaMax) {
    gaps.push({ habilidad: 'LATERALIDAD', severidad: 'moderada', valorObservado: agregado.indiceLateralidadPromedio, valorReferencia: referencia.asimetriaMax });
  }
  if (agregado.indiceEjeVerticalPromedio != null && Math.abs(agregado.indiceEjeVerticalPromedio) > referencia.asimetriaMax) {
    gaps.push({ habilidad: 'EJE_VERTICAL', severidad: 'moderada', valorObservado: agregado.indiceEjeVerticalPromedio, valorReferencia: referencia.asimetriaMax });
  }
  return gaps;
};

// Al completarse una actividad, compara con el histórico del niño y los
// parámetros de referencia, genera un informe para el tutor con Gemini y
// actualiza el plan de apoyo (gaps → actividades dirigidas en la app).
exports.generarInformeActividades = onDocumentCreated("telemetria_actividades/{docId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) return;

  const registro = snapshot.data();
  const { perfilId, edadAnios, nivelEscolar } = registro;
  if (!perfilId || perfilId === 'huesped') {
    console.log("Registro sin perfil identificado; se omite informe.");
    return;
  }

  // Histórico del niño (sin orderBy para no requerir índice compuesto; se ordena en memoria)
  const histSnap = await db.collection('telemetria_actividades')
    .where('perfilId', '==', perfilId)
    .limit(60)
    .get();
  const historicos = [];
  histSnap.forEach(d => { if (d.id !== event.params.docId) historicos.push(d.data()); });
  historicos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  const agregadoHistorico = agregarHistorico(historicos.slice(0, 30));
  const agregadoActual = agregarHistorico([registro]);
  const referencia = referenciaParaEdad(edadAnios);
  const gapsDetectados = detectarGaps(agregarHistorico([registro, ...historicos.slice(0, 30)]), referencia);

  const payload = {
    nino: { edadAnios: edadAnios ?? null, nivelEscolar: nivelEscolar || null },
    actividadActual: { motor: registro.motor, eje: registro.eje, nivel: registro.nivel, metricas: agregadoActual },
    historico: agregadoHistorico,
    referenciaOrientativaPorEdad: referencia,
    gapsDetectadosPorSistema: gapsDetectados,
  };

  const prompt = `
Eres un Psicopedagogo Experto del Método VANI. Recibes la telemetría silenciosa de las actividades de un niño (seguridad y continuidad de trazo, errores, respuesta de lateralidad izquierda-derecha, orientación arriba-abajo y comprensión lectora), su histórico, y parámetros de referencia ORIENTATIVOS por edad y nivel escolar.

DATOS (JSON):
${JSON.stringify(payload, null, 2)}

Instrucciones estrictas:
1. Compara el desempeño actual con el histórico del niño (¿mejora, se mantiene, retrocede?) y con la referencia orientativa por edad.
2. Valida o descarta los gaps detectados por el sistema. Puedes ajustar severidades.
3. NO emitas diagnósticos clínicos ni etiquetas de neurodivergencia: solo describe observaciones y, si un patrón es persistente y marcado, sugiere consultar a un especialista.
4. Usa lenguaje cálido, no técnico, dirigido al tutor.

Responde SOLO con JSON válido con esta forma exacta:
{
  "informeTutor": "2-3 párrafos breves para el tutor",
  "gaps": [{ "habilidad": "SEGURIDAD_TRAZO|CONTINUIDAD_TRAZO|PRECISION|LATERALIDAD|EJE_VERTICAL|COMPRENSION_LECTORA", "severidad": "leve|moderada|alta", "recomendacion": "1 frase" }],
  "sugerirEvaluacionProfesional": false
}
`;

  let informe = null;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });
    informe = JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini no disponible o respuesta inválida; se usa análisis determinista:", error.message);
    informe = {
      informeTutor: `Informe automático: ${registro.nombreNino || 'El niño'} completó una actividad de ${registro.eje} (nivel ${registro.nivel}). ` +
        (gapsDetectados.length
          ? `El sistema observó brechas en: ${gapsDetectados.map(g => g.habilidad).join(', ')}. Las próximas actividades se enfocarán en reforzarlas.`
          : `Su desempeño está dentro de los rangos orientativos para su edad. ¡Buen trabajo!`) +
        ` Este resumen es orientativo y no constituye un diagnóstico.`,
      gaps: gapsDetectados.map(g => ({ habilidad: g.habilidad, severidad: g.severidad, recomendacion: 'Reforzar con las actividades dirigidas del plan de apoyo.' })),
      sugerirEvaluacionProfesional: false,
    };
  }

  const fecha = new Date().toISOString();

  // 1. Informe para el tutor (visible en el Dashboard de Padres)
  await db.collection('informes_tutor').add({
    perfilId,
    tutorId: registro.tutorId || null,
    nombreNino: registro.nombreNino || null,
    fecha,
    edadAnios: edadAnios ?? null,
    nivelEscolar: nivelEscolar || null,
    actividadOrigen: { id: registro.actividadId, motor: registro.motor, eje: registro.eje, nivel: registro.nivel },
    informe: informe.informeTutor,
    gaps: informe.gaps || [],
    sugerirEvaluacionProfesional: !!informe.sugerirEvaluacionProfesional,
    metricasComparadas: payload,
    descargoResponsabilidad: 'Informe orientativo generado por IA a partir del juego. No constituye diagnóstico clínico.',
  });

  // 2. Plan de apoyo: con gaps activos la app solo desbloquea actividades dirigidas
  await db.collection('planes_apoyo').doc(perfilId).set({
    gaps: informe.gaps || [],
    actualizado: fecha,
    origen: event.params.docId,
  }, { merge: true });

  console.log(`Informe de actividades generado para perfil ${perfilId} (${(informe.gaps || []).length} gaps).`);
});

exports.generarDiagnosticoClinico = onDocumentCreated("telemetria_tests/{docId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    console.log("No hay datos asociados al evento.");
    return;
  }
  
  const telemetria = snapshot.data();
  const { wpm, tiempo_total_s, personaje_id, usuario_id } = telemetria;

  const prompt = `
Eres un Psicopedagogo Experto del Método VANI.
Un niño ha terminado el Test Transparente de lectura.
Métricas crudas:
- Velocidad: ${wpm} Palabras Por Minuto (WPM)
- Tiempo total: ${tiempo_total_s} segundos
- Ecosfera (Personaje): ${personaje_id}

Teniendo en cuenta que el Cuento fue un "Santuario de Lectura" y esta evaluación clínica es transparente y formal, redacta un diagnóstico breve y empático para los padres.
Usa un lenguaje no técnico, explica qué significa este WPM en el contexto del aprendizaje inmersivo, y añade un refuerzo positivo.
Limita tu respuesta a 2 o 3 párrafos cortos.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash", 
      contents: prompt,
    });

    const diagnostico = response.text;

    await db.collection("diagnosticos_padres").add({
      usuario_id: usuario_id || "jugador_sesion_actual",
      test_id: event.params.docId,
      fecha: new Date().toISOString(),
      diagnostico: diagnostico,
      wpm: wpm
    });

    console.log("Diagnóstico generado y guardado exitosamente para el test:", event.params.docId);
  } catch (error) {
    console.error("Error al generar el diagnóstico con Gemini:", error);
  }
});
