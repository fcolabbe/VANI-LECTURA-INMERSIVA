export const ELEVENLABS_VOICE_ID = 'DrP0xLvGZl4dv2a0BrAE';

// Cache para no consumir cuota repitiendo las mismas instrucciones
const audioCache = new Map();

/**
 * Función genérica para reproducir texto usando la API de ElevenLabs
 * @param {string} text - El texto a narrar
 * @param {boolean} forceRefresh - Si es true, ignora la caché
 * @returns {Promise<void>}
 */
export async function playVaniVoice(text, forceRefresh = false) {
  if (!text) return;

  const cacheKey = text.toLowerCase().trim();

  // 1. Revisar caché
  if (!forceRefresh && audioCache.has(cacheKey)) {
    const audioUrl = audioCache.get(cacheKey);
    return playAudio(audioUrl);
  }

  // 2. Obtener la key de entorno
  const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.warn("Falta la API Key de ElevenLabs (VITE_ELEVENLABS_API_KEY). Usando TTS del navegador como fallback.");
    return fallbackTTS(text);
  }

  try {
    const response = await fetch(\`https://api.elevenlabs.io/v1/text-to-speech/\${ELEVENLABS_VOICE_ID}?output_format=mp3_44100_128\`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'xi-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.7,
          style: 0.2,
          use_speaker_boost: true
        }
      })
    });

    if (!response.ok) {
      throw new Error(\`Error de ElevenLabs: \${response.status}\`);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    
    // Guardar en caché
    audioCache.set(cacheKey, audioUrl);

    // Reproducir
    return playAudio(audioUrl);

  } catch (error) {
    console.error("Error al generar voz con ElevenLabs:", error);
    return fallbackTTS(text);
  }
}

function playAudio(url) {
  return new Promise((resolve, reject) => {
    const audio = new Audio(url);
    audio.onended = () => resolve();
    audio.onerror = (e) => reject(e);
    audio.play().catch(reject);
  });
}

function fallbackTTS(text) {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      console.warn("Speech Synthesis no soportado");
      resolve();
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 0.9; // Un poco más lento para Vani
    utterance.pitch = 1.2; // Tono ligeramente más agudo/amigable
    
    utterance.onend = () => resolve();
    utterance.onerror = (e) => reject(e);
    
    window.speechSynthesis.speak(utterance);
  });
}
