import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(rootDir, '.env') });

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
if (!ELEVENLABS_API_KEY) {
  console.error("No se encontró ELEVENLABS_API_KEY en .env");
  process.exit(1);
}

// ID de voz de Vani
const VANI_VOICE_ID = "DrP0xLvGZl4dv2a0BrAE";

const text = "¡Hola! Te doy la bienvenida a mi mundo. Me llamo Vani y seré tu guía en esta aventura. Mi luz te acompañará en cada paso que des. Aquí viven muchos amigos increíbles. Algunos son muy traviesos y aventureros; otros, criaturas tiernas y adorables. ¡Toca a mis amigos para descubrir todas las historias y juegos que hemos preparado para ti! ¿Empezamos?";

async function generateWelcomeAudio() {
  console.log("Generando audio de bienvenida...");
  
  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VANI_VOICE_ID}`, {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Error de API: ${response.status} ${await response.text()}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const publicDir = path.join(rootDir, 'public', 'audio');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    const filePath = path.join(publicDir, `bienvenida_vani.mp3`);
    fs.writeFileSync(filePath, buffer);
    console.log(`Guardado: ${filePath}`);

  } catch (error) {
    console.error("Error generando audio:", error);
  }
}

generateWelcomeAudio();
