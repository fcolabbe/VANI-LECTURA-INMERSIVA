import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(rootDir, '.env') });

const FAL_KEY = process.env.FAL_KEY;
if (!FAL_KEY) {
  console.error('❌ ERROR: FAL_KEY no encontrada en .env');
  process.exit(1);
}

// Configuración unificada de Modelos LoRA para que no vuelva a ocurrir el error de "Koda luciendo como Leo"
const PERSONAJES = {
  leo: {
    lora_url: "https://v3b.fal.media/files/b/0a9e7804/NjycUL8iANrvAV2pxaIna_pytorch_lora_weights.safetensors",
    base_prompt: "TOK_LEO_VANI, a 7-year-old explorer boy, hazel eyes, messy short brown hair, wearing a matte mustard-ochre wool jacket and brown mountain boots, holding an antique gold lantern emitting soft warm light. Low stimulus, minimalist watercolor style, charcoal outlines, cold press paper texture, desaturated earth tones"
  },
  koda: {
    lora_url: "https://v3b.fal.media/files/b/0a9e8fba/ZOci8mLKa5KB08y-JoMjg_pytorch_lora_weights.safetensors",
    base_prompt: "TOK_KODA_VANI, a native boy, dark messy hair, big eyes, wearing a torn rustic green tunic and bare feet, holding a small wooden drum. Low stimulus, minimalist watercolor style, charcoal outlines, cold press paper texture, desaturated earth tones"
  },
  nia: {
    lora_url: "https://v3b.fal.media/files/b/0a9e939e/B5fNL8_0vwR2PvGjxTRkG_pytorch_lora_weights.safetensors",
    base_prompt: "TOK_NIA_VANI, a 7-year-old Asian girl, stylized child proportions, head slightly larger than body, 4.5 heads tall scale, peaceful and patient expression, dark hair floating gently, wearing a soft teal organic tunic and bare feet, holding a beautiful mother-of-pearl conch shell. Low stimulus organic art, minimalist matte watercolor style, charcoal outlines, cold press paper texture, desaturated aquatic tones"
  }
};

import { niaPrompts } from './nia_prompts.js';

// Mapa de prompts disponibles por personaje
const PROMPTS = {
  nia: niaPrompts
};

const args = process.argv.slice(2);
const targetChar = args[0] ? args[0].toLowerCase() : null;

if (!targetChar || !PERSONAJES[targetChar] || !PROMPTS[targetChar]) {
  console.error(`❌ ERROR: Debes proporcionar un personaje válido con prompts. Ejemplo: node generate_season_images.js nia`);
  process.exit(1);
}

const config = PERSONAJES[targetChar];
const characterPrompts = PROMPTS[targetChar];

console.log(`\n🎨 INICIANDO PIPELINE DE ARTE TEMPORADA 1 - ${targetChar.toUpperCase()}`);
console.log(`LORA UTILIZADA: ${config.lora_url}`);
console.log(`PROMPT BASE: ${config.base_prompt}\n`);

async function generarImagen(item) {
  const promptText = `${config.base_prompt}, ${item.prompt}`;
  const filePath = path.join(rootDir, 'public', item.filename);

  console.log(`⏳ Generando: ${item.filename} ...`);
  
  try {
    const response = await fetch('https://fal.run/fal-ai/flux-lora', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: promptText,
        model_name: "fal-ai/flux/dev",
        loras: [{ path: config.lora_url, scale: 1.0 }],
        image_size: "landscape_4_3",
        num_inference_steps: 28,
        guidance_scale: 3.5,
        sync_mode: true
      })
    });

    if (!response.ok) {
      throw new Error(`API Error (${response.status}): ${await response.text()}`);
    }

    const data = await response.json();
    const imageUrl = data.images[0].url;
    
    const imgResponse = await fetch(imageUrl);
    const buffer = await imgResponse.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(buffer));
    console.log(`✅ ¡Guardado con éxito! /public/${item.filename}`);
  } catch (e) {
    console.error(`❌ Error generando ${item.filename}:`, e.message);
  }
}

async function run() {
  for (const item of characterPrompts) {
    await generarImagen(item);
  }
  console.log(`\n🎉 Pipeline de arte completado. Todas las imágenes de ${targetChar.toUpperCase()} generadas.`);
}

run();
