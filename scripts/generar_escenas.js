import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Configurar paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Cargar variables de entorno
dotenv.config({ path: path.join(rootDir, '.env') });

const FAL_KEY = process.env.FAL_KEY;
if (!FAL_KEY) {
  console.error('❌ ERROR: No se encontró FAL_KEY en el archivo .env');
  process.exit(1);
}

// ---------------------------------------------------------
// REGISTRO DE PERSONAJES (CDD y LORAs)
// ---------------------------------------------------------
const PERSONAJES = {
  leo: {
    trigger_word: "TOK_LEO_VANI",
    lora_url: "https://v3b.fal.media/files/b/0a9e7804/NjycUL8iANrvAV2pxaIna_pytorch_lora_weights.safetensors",
    base_prompt: "A character design sheet of TOK_LEO_VANI, a 7-year-old explorer boy, hazel eyes, messy short brown hair, wearing a matte mustard-ochre wool jacket and brown mountain boots, holding an antique gold lantern emitting soft warm light. Low stimulus, minimalist watercolor style, charcoal outlines, cold press paper texture, desaturated earth tones",
    lora_scale: 1.0
  },
  koda: {
    trigger_word: "TOK_KODA_VANI",
    lora_url: "https://v3b.fal.media/files/b/0a9e8fba/ZOci8mLKa5KB08y-JoMjg_pytorch_lora_weights.safetensors",
    base_prompt: "A character design sheet of TOK_KODA_VANI, a native boy, dark messy hair, big eyes, wearing a torn rustic green tunic and bare feet, holding a small wooden drum. Low stimulus, minimalist watercolor style, charcoal outlines, cold press paper texture, desaturated earth tones",
    lora_scale: 1.0
  },
  nia: {
    trigger_word: "TOK_NIA_VANI",
    lora_url: "https://v3b.fal.media/files/b/0a9e939e/B5fNL8_0vwR2PvGjxTRkG_pytorch_lora_weights.safetensors",
    base_prompt: "TOK_NIA_VANI, a 7-year-old Asian girl, stylized child proportions, head slightly larger than body, 4.5 heads tall scale, peaceful and patient expression, dark hair floating gently, wearing a soft teal organic tunic and bare feet, holding a beautiful mother-of-pearl conch shell. Low stimulus organic art, minimalist matte watercolor style, charcoal outlines, cold press paper texture, desaturated aquatic tones",
    lora_scale: 1.0
  },
  sora: {
    trigger_word: "TOK_SORA_VANI",
    lora_url: "https://v3b.fal.media/files/b/0a9e94ff/wyY1y3gxa7V_IWP4JC-N__pytorch_lora_weights.safetensors",
    base_prompt: "TOK_SORA_VANI, a 7-year-old girl, stylized child proportions, head slightly larger than body, 4.5 heads tall scale, serene expression, wearing very light flowy sky-blue organic clothes and bare feet, holding a delicate silk kite. Low stimulus organic art, minimalist matte watercolor style, charcoal outlines, cold press paper texture, desaturated sky tones",
    lora_scale: 1.0
  },
  lulu: {
    trigger_word: "TOK_LULU_VANI",
    lora_url: "https://v3b.fal.media/files/b/0a9eaa4e/xbdyPQnuWhJU558yPGwnp_pytorch_lora_weights.safetensors",
    base_prompt: "TOK_LULU_VANI, a cute magical creature named Lulu made of soft cream and blue watercolor wool, big expressive eyes, holding a glowing geometric Truth Prism. Low stimulus organic art, minimalist matte watercolor style, charcoal outlines, desaturated cream and soft blue tones",
    lora_scale: 1.0
  },
  bibi: {
    trigger_word: "TOK_BIBI_VANI",
    lora_url: "https://v3b.fal.media/files/b/0a9eacdd/Qkiahjj9h5NrbMfhhTnPi_pytorch_lora_weights.safetensors",
    base_prompt: "TOK_BIBI_VANI, a cute small explorer robot named Bibi made of matte ceramic, big expressive lens eyes, holding a glowing Cosmic Telescope. Low stimulus organic art, minimalist matte watercolor style, charcoal outlines, desaturated soft navy and warm grey tones",
    lora_scale: 1.0
  }
};

// ---------------------------------------------------------
// ARGUMENTOS DE TERMINAL
// ---------------------------------------------------------
const args = process.argv.slice(2);
if (args.length < 2) {
  console.log('📌 Uso: npm run generar <personaje> "<accion/escena>"');
  console.log('💡 Ejemplo: npm run generar leo "walking bravely through a dark misty cave, full body shot"');
  process.exit(1);
}

const personajeId = args[0].toLowerCase();
const accionScene = args[1];

const configPersonaje = PERSONAJES[personajeId];

if (!configPersonaje) {
  console.error(`❌ ERROR: Personaje '${personajeId}' no encontrado en el registro. Disponibles: ${Object.keys(PERSONAJES).join(', ')}`);
  process.exit(1);
}

const finalPrompt = `${configPersonaje.base_prompt}, ${accionScene}`;

console.log(`\n🚀 Iniciando generación para: ${personajeId.toUpperCase()}`);
console.log(`📝 Prompt Completo: ${finalPrompt}`);
console.log(`🔗 Usando LoRA: ${configPersonaje.lora_url}`);

// ---------------------------------------------------------
// FUNCIÓN PRINCIPAL
// ---------------------------------------------------------
async function generarImagen() {
  try {
    console.log(`\n⏳ Solicitando imagen a Fal.ai (Flux LoRA)... esto puede tomar unos 15-20 segundos.`);
    
    // 1. Solicitar generación
    const response = await fetch('https://fal.run/fal-ai/flux-lora', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: finalPrompt,
        model_name: "fal-ai/flux/dev",
        loras: [
          {
            path: configPersonaje.lora_url,
            scale: configPersonaje.lora_scale
          }
        ],
        image_size: "landscape_4_3", // Ideal para pantallas de cuento
        num_inference_steps: 28,
        guidance_scale: 3.5,
        sync_mode: true
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Error de API (${response.status}): ${errorData}`);
    }

    const data = await response.json();
    
    if (!data.images || data.images.length === 0) {
      console.error("Respuesta cruda de la API:", JSON.stringify(data, null, 2));
      throw new Error('La API no retornó imágenes válidas.');
    }

    const imageUrl = data.images[0].url;
    console.log(`✅ ¡Imagen generada! URL temporal: ${imageUrl}`);
    console.log(`⬇️ Descargando a tu carpeta /public...`);

    // 2. Descargar la imagen
    const imageResponse = await fetch(imageUrl);
    const buffer = await imageResponse.arrayBuffer();

    // 3. Guardar localmente
    const publicDir = path.join(rootDir, 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir);
    }

    const timestamp = Date.now();
    const fileName = `${personajeId}_escena_${timestamp}.png`;
    const filePath = path.join(publicDir, fileName);

    fs.writeFileSync(filePath, Buffer.from(buffer));

    console.log(`\n🎉 ¡COMPLETADO!`);
    console.log(`📂 Imagen guardada en: /public/${fileName}`);
    console.log(`\n👉 Para usarla en el cuento, copia este nombre y pégalo en vaniData.js:`);
    console.log(`   imagenEstatica: '/${fileName}'\n`);

  } catch (error) {
    console.error(`\n❌ ERROR DURANTE LA GENERACIÓN:`);
    console.error(error.message);
  }
}

generarImagen();
