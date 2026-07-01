const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { getFirestore } = require("firebase-admin/firestore");
const { initializeApp } = require("firebase-admin/app");
const { GoogleGenAI } = require("@google/genai");

initializeApp();
const db = getFirestore();

// Inicializamos el SDK de Gemini. En producción, la API Key debe configurarse en Firebase Secret Manager
// o usar Application Default Credentials si la función corre bajo la cuenta de servicio de GCP.
const ai = new GoogleGenAI({}); 

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
