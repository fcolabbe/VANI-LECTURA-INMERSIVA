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

const PERSONAJES = {
  leo: {
    lora_url: "https://v3b.fal.media/files/b/0a9e7804/NjycUL8iANrvAV2pxaIna_pytorch_lora_weights.safetensors",
    base_prompt: "TOK_LEO_VANI, a 7-year-old explorer boy, hazel eyes, messy short brown hair, wearing a matte mustard-ochre wool jacket and brown mountain boots, holding an antique gold lantern emitting soft warm light. Low stimulus, minimalist watercolor style, charcoal outlines, cold press paper texture, desaturated earth tones",
    scenes: [
      "holding a gold lantern, looking for a path through high pine trees, full body shot, landscape orientation",
      "standing in a dense white fog, holding his gold lantern high to light the path, full body shot, landscape orientation",
      "standing in front of his wooden cabin on the mountain, thick foliage nearby, a glowing cave visible in the distance, landscape orientation"
    ]
  },
  koda: {
    lora_url: "https://v3b.fal.media/files/b/0a9e8fba/ZOci8mLKa5KB08y-JoMjg_pytorch_lora_weights.safetensors",
    base_prompt: "TOK_KODA_VANI, a native boy, dark messy hair, big eyes, wearing a torn rustic green tunic and bare feet, holding a small wooden drum. Low stimulus, minimalist watercolor style, charcoal outlines, cold press paper texture, desaturated earth tones",
    scenes: [
      "walking in a dense green forest, singing happily, full body shot, landscape orientation",
      "looking at forest animals screaming and arguing in a clearing, windy trees shaking, landscape orientation",
      "sitting on a rock playing his bamboo drum, animals listening quietly around him in peace, landscape orientation"
    ]
  },
  nia: {
    lora_url: "https://v3b.fal.media/files/b/0a9e939e/B5fNL8_0vwR2PvGjxTRkG_pytorch_lora_weights.safetensors",
    base_prompt: "TOK_NIA_VANI, a 7-year-old Asian girl, stylized child proportions, head slightly larger than body, 4.5 heads tall scale, peaceful and patient expression, dark hair floating gently, wearing a soft teal organic tunic and bare feet, holding a beautiful mother-of-pearl conch shell. Low stimulus organic art, minimalist matte watercolor style, charcoal outlines, cold press paper texture, desaturated aquatic tones",
    scenes: [
      "swimming peacefully underwater next to colourful coral reef and small fish, landscape orientation",
      "looking at a fast water current raising sand in the reef, small seahorses looking lost, landscape orientation",
      "blowing into a shiny mother-of-pearl conch shell, water calming down, a glowing shell in a cave nearby, landscape orientation"
    ]
  },
  lulu: {
    lora_url: "https://v3b.fal.media/files/b/0a9eaa4e/xbdyPQnuWhJU558yPGwnp_pytorch_lora_weights.safetensors",
    base_prompt: "TOK_LULU_VANI, a cute magical creature named Lulu made of soft cream and blue watercolor wool, big expressive eyes, holding a glowing geometric Truth Prism. Low stimulus organic art, minimalist matte watercolor style, charcoal outlines, desaturated cream and soft blue tones",
    scenes: [
      "walking inside a glowing crystal cave, watching a flash of warm light reflecting on the walls, landscape orientation",
      "sitting next to a sad small octopus in a corner of the cave, looking friendly, landscape orientation",
      "holding a glowing prism in front of a light beam, generating a beautiful rainbow that lights up the cave, landscape orientation"
    ]
  },
  sora: {
    lora_url: "https://v3b.fal.media/files/b/0a9e94ff/wyY1y3gxa7V_IWP4JC-N__pytorch_lora_weights.safetensors",
    base_prompt: "TOK_SORA_VANI, a 7-year-old girl, stylized child proportions, head slightly larger than body, 4.5 heads tall scale, serene expression, wearing very light flowy sky-blue organic clothes and bare feet, holding a delicate silk kite. Low stimulus organic art, minimalist matte watercolor style, charcoal outlines, cold press paper texture, desaturated sky tones",
    scenes: [
      "running on a floating grass island in the sky, holding the string of a light silk kite, landscape orientation",
      "standing in front of a strong wind gust, her kite tangled in a tree branch on the ground, landscape orientation",
      "launching her silk kite smoothly into the sky, drawing a bridge of wind between islands, landscape orientation"
    ]
  },
  bibi: {
    lora_url: "https://v3b.fal.media/files/b/0a9eacdd/Qkiahjj9h5NrbMfhhTnPi_pytorch_lora_weights.safetensors",
    base_prompt: "TOK_BIBI_VANI, a cute small explorer robot named Bibi made of matte ceramic, big expressive lens eyes, holding a glowing Cosmic Telescope. Low stimulus organic art, minimalist matte watercolor style, charcoal outlines, desaturated soft navy and warm grey tones",
    scenes: [
      "looking up at the vast dark blue sky filled with stars, standing on a floating island, landscape orientation",
      "holding a telescope, looking confused as he tries to point it in different directions, landscape orientation",
      "looking through his telescope at a single small star that is flashing brightly, landscape orientation"
    ]
  }
};

async function generarImagen(personajeId, sceneIdx) {
  const p = PERSONAJES[personajeId];
  const promptText = `${p.base_prompt}, ${p.scenes[sceneIdx]}`;
  const fileName = `${personajeId}_cuento${sceneIdx + 1}.png`;
  const filePath = path.join(rootDir, 'public', fileName);

  console.log(`\n⏳ Generando: ${fileName} ...`);
  
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
        loras: [{ path: p.lora_url, scale: 1.0 }],
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
    console.log(`✅ ¡Guardado con éxito! /public/${fileName}`);
  } catch (e) {
    console.error(`❌ Error generando ${fileName}:`, e.message);
  }
}

async function run() {
  const args = process.argv.slice(2);
  const targetPersonaje = args[0] ? args[0].toLowerCase() : null;

  if (targetPersonaje && !PERSONAJES[targetPersonaje]) {
    console.error(`❌ Personaje '${targetPersonaje}' no válido. Opciones: ${Object.keys(PERSONAJES).join(', ')}`);
    process.exit(1);
  }

  const personajesAGenerar = targetPersonaje ? [targetPersonaje] : Object.keys(PERSONAJES);

  console.log(`\n🎨 INICIANDO PIPELINE DE IMÁGENES FLUX-LORA`);
  console.log(`Target: ${targetPersonaje ? targetPersonaje.toUpperCase() : 'TODOS LOS PERSONAJES'}`);

  for (const pId of personajesAGenerar) {
    for (let i = 0; i < 3; i++) {
      await generarImagen(pId, i);
    }
  }
  console.log(`\n🎉 Pipeline completado.`);
}

run();
