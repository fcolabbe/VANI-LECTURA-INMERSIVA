import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { vaniData } from '../src/data/vaniData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(rootDir, '.env') });

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

// Mapeo de personajes a sus Voice IDs de ElevenLabs diseñadas en la plataforma.
// Reemplazar estos IDs temporales con los IDs generados tras el proceso de diseño en ElevenLabs.
const VOICE_IDS = {
  vani_narrador: "DrP0xLvGZl4dv2a0BrAE", // Voz cálida, pausada y maternal de la hada VANI (usa este ID para leer el cuento)
  leo: "DrP0xLvGZl4dv2a0BrAE",          // Opcional: Voz propia infantil para diálogos de Leo
  koda: "21m00Tcm4TlvDq8ikWAM",         // Opcional: Voz para Koda
  nia: "AZnzlk1XvdvUeBnXmlld",          // Opcional: Voz para Nia
  lulu: "DrP0xLvGZl4dv2a0BrAE",         // Opcional: Voz para Lulú
  sora: "cgS7DpaSpwBhClMxaUOd",         // Opcional: Voz para Sora
  bibi: "piTKgcLEGmPEeZsZywCB"          // Opcional: Voz para Bibi
};

async function generateSceneAudio(capituloId, personajeId, escenaId, text) {
  // Por defecto, usamos la voz maternal y dulce de la hada VANI para narrar las escenas de los cuentos.
  const voiceId = VOICE_IDS.vani_narrador || VOICE_IDS[personajeId];
  
  // Limpiamos la sintaxis markdown de Palabras Mágicas antes de sintetizar
  // ej: "busca el [sendero](magic-word:sendero)" -> "busca el sendero"
  const cleanText = text.replace(/\[(.*?)\]\(magic-word:(.*?)\)/g, '$1');

  console.log(`[ElevenLabs] Procesando ${capituloId} Escena ${escenaId}: "${cleanText.substring(0, 40)}..."`);

  if (!ELEVENLABS_API_KEY) {
    console.warn("  ⚠️ ELEVENLABS_API_KEY no encontrada en el archivo .env. Creando archivos de prueba simulados.");
    
    // Crear recursos simulados de prueba si no hay API Key configurada
    const audioDir = path.join(rootDir, 'public', 'audio');
    if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });
    
    fs.writeFileSync(path.join(audioDir, `${capituloId}_escena${escenaId}.mp3`), Buffer.from([]));
    
    // Crear alineación simulada (una estimación de tiempos de 0.5s por palabra para testing local)
    const words = cleanText.split(/\s+/).map((w, idx) => ({
      word: w,
      start: idx * 500,
      end: (idx + 1) * 500 - 50
    }));
    fs.writeFileSync(path.join(audioDir, `${capituloId}_escena${escenaId}.json`), JSON.stringify(words, null, 2));
    
    console.log("  ➔ Simulación guardada exitosamente (vacía).");
    return;
  }

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`;

  try {
    // Asegurar directorio de salida
    const audioDir = path.join(rootDir, 'public', 'audio');
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }

    const mp3Path = path.join(audioDir, `${capituloId}_escena${escenaId}.mp3`);
    const jsonPath = path.join(audioDir, `${capituloId}_escena${escenaId}.json`);

    if (fs.existsSync(mp3Path) && fs.existsSync(jsonPath)) {
      console.log(`  ➔ Saltando (Ya existe): ${mp3Path}`);
      return;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: cleanText,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.85
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Error ElevenLabs API ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    const audioBuffer = Buffer.from(data.audio_base64, 'base64');
    
    fs.writeFileSync(mp3Path, audioBuffer);
    console.log(`  ➔ MP3 Guardado: ${mp3Path}`);

    // 2. Procesar la alineación a nivel de caracteres para convertirla a nivel de palabras
    const characters = data.alignment.characters;
    const startTimes = data.alignment.character_start_times_seconds;
    const endTimes = data.alignment.character_end_times_seconds;

    const words = [];
    let currentWord = "";
    let currentStart = null;

    for (let i = 0; i < characters.length; i++) {
      const char = characters[i];
      const start = startTimes[i];
      const end = endTimes[i];

      if (char.trim() !== "") {
        if (currentStart === null) {
          currentStart = start;
        }
        currentWord += char;
      } else {
        if (currentWord !== "") {
          words.push({
            word: currentWord,
            start: Math.round(currentStart * 1000), // En milisegundos
            end: Math.round(endTimes[i - 1] * 1000)
          });
          currentWord = "";
          currentStart = null;
        }
      }
    }

    // Agregar última palabra residual si aplica
    if (currentWord !== "") {
      words.push({
        word: currentWord,
        start: Math.round(currentStart * 1000),
        end: Math.round(endTimes[endTimes.length - 1] * 1000)
      });
    }

    // 3. Guardar archivo JSON de timestamps
    fs.writeFileSync(jsonPath, JSON.stringify(words, null, 2));
    console.log(`  ➔ JSON Alineación Guardado: ${jsonPath}`);

  } catch (error) {
    console.error(`❌ Error procesando ${capituloId} Escena ${escenaId}:`, error.message);
  }
}

async function generateDescriptionAudio(filename, text) {
  const voiceId = VOICE_IDS.vani_narrador;
  const cleanText = text.replace(/"/g, '');

  console.log(`[ElevenLabs] Procesando descripción ${filename}: "${cleanText.substring(0, 45)}..."`);

  if (!ELEVENLABS_API_KEY) {
    console.warn(`  ⚠️ ELEVENLABS_API_KEY no encontrada. Creando archivo de prueba simulado para ${filename}.mp3`);
    const audioDir = path.join(rootDir, 'public', 'audio');
    if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });
    fs.writeFileSync(path.join(audioDir, `${filename}.mp3`), Buffer.from([]));
    return;
  }

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: cleanText,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.85
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Error ElevenLabs API ${response.status}: ${await response.text()}`);
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    const audioDir = path.join(rootDir, 'public', 'audio');
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }

    const mp3Path = path.join(audioDir, `${filename}.mp3`);
    fs.writeFileSync(mp3Path, audioBuffer);
    console.log(`  ➔ MP3 Guardado: ${mp3Path}`);
  } catch (error) {
    console.error(`❌ Error procesando descripción ${filename}:`, error.message);
  }
}

async function startBatchGeneration() {
  console.log("==============================================");
  console.log("INICIANDO PRODUCCIÓN DE AUDIO CON ELEVENLABS ");
  console.log("==============================================");
  
  if (!ELEVENLABS_API_KEY) {
    console.log("⚠️  Aviso: Ejecutando en MODO PRUEBA/SIMULADO ya que no hay ELEVENLABS_API_KEY.");
  }

  // 1. Recorrer los capítulos 0 cargados dinámicamente en vaniData
  for (const [capKey, capData] of Object.entries(vaniData.capitulos)) {
    console.log(`\n📂 Procesando capítulo: ${capKey}`);
    const escenas = capData.escenas || [];
    
    for (let i = 0; i < escenas.length; i++) {
      const escena = escenas[i];
      await generateSceneAudio(capKey, capData.personajeId, i + 1, escena.texto);
    }
  }

  // 2. Procesar las descripciones de los Biomas
  console.log("\n📂 Procesando descripciones de Biomas...");
  for (const [ecoKey, ecoData] of Object.entries(vaniData.ecoesferas)) {
    const text = `${ecoData.textoEcoesfera} ${ecoData.rolPersonajes}`;
    await generateDescriptionAudio(`bioma_${ecoKey}`, text);
  }

  // 3. Procesar las descripciones de los Personajes
  console.log("\n📂 Procesando descripciones de Personajes...");
  for (const [perKey, perData] of Object.entries(vaniData.personajes)) {
    const text = `${perData.quienEs} ${perData.caracteristicas} ${perData.queHace}`;
    await generateDescriptionAudio(`descripcion_${perKey}`, text);
  }

  console.log("\n==============================================");
  console.log("✅ FIN DEL PROCESAMIENTO");
  console.log("==============================================");
}

startBatchGeneration();
