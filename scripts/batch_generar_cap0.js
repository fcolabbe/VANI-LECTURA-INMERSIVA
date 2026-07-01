import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(rootDir, '.env') });
const FAL_KEY = process.env.FAL_KEY;

const PERSONAJES = {
  leo: {
    lora_url: "https://v3b.fal.media/files/b/0a9e7804/NjycUL8iANrvAV2pxaIna_pytorch_lora_weights.safetensors",
    base_prompt: "A character design sheet of TOK_LEO_VANI, a 7-year-old explorer boy, hazel eyes, messy short brown hair, wearing a matte mustard-ochre wool jacket and brown mountain boots, holding an antique gold lantern emitting soft warm light. Low stimulus, minimalist watercolor style, charcoal outlines, cold press paper texture, desaturated earth tones",
    biome_prompt: "A minimalist serene mountain landscape with soft rounded peaks, gentle dirt pathways covered with large soft leaves, and a few sparse muted pine trees. The environment must be depicted in a low stimulus organic art style, minimalist matte watercolor painting, soft charcoal outlines, cold press paper texture, and desaturated, calming tones. Absolutely no bright lights, no neon, no photorealism, and no high-contrast harsh shadows. The scenery should feel like a gentle, slow-paced, soothing children's book illustration."
  },
  koda: {
    lora_url: "https://v3b.fal.media/files/b/0a9e8fba/ZOci8mLKa5KB08y-JoMjg_pytorch_lora_weights.safetensors",
    base_prompt: "A character design sheet of TOK_KODA_VANI, a native boy, dark messy hair, big eyes, wearing a torn rustic green tunic and bare feet, holding a small wooden drum. Low stimulus, minimalist watercolor style, charcoal outlines, cold press paper texture, desaturated earth tones",
    biome_prompt: "A peaceful, simple forest clearing with smooth bamboo stalks and soft-edged tropical leaves. The environment must be depicted in a low stimulus organic art style, minimalist matte watercolor painting, soft charcoal outlines, cold press paper texture, and desaturated, calming tones. Absolutely no bright lights, no neon, no photorealism, and no high-contrast harsh shadows. The scenery should feel like a gentle, slow-paced, soothing children's book illustration."
  },
  nia: {
    lora_url: "https://v3b.fal.media/files/b/0a9e939e/B5fNL8_0vwR2PvGjxTRkG_pytorch_lora_weights.safetensors",
    base_prompt: "TOK_NIA_VANI, a 7-year-old Asian girl, stylized child proportions, head slightly larger than body, 4.5 heads tall scale, peaceful and patient expression, dark hair floating gently, wearing a soft teal organic tunic and bare feet, holding a beautiful mother-of-pearl conch shell. Low stimulus organic art, minimalist matte watercolor style, charcoal outlines, cold press paper texture, desaturated aquatic tones",
    biome_prompt: "A calm, shallow coastal shoreline where soft desaturated sand meets quiet, still ocean water, with subtle, simple seaweed shapes beneath the surface. The environment must be depicted in a low stimulus organic art style, minimalist matte watercolor painting, soft charcoal outlines, cold press paper texture, and desaturated, calming tones. Absolutely no bright lights, no neon, no photorealism, and no high-contrast harsh shadows. The scenery should feel like a gentle, slow-paced, soothing children's book illustration."
  },
  lulu: {
    lora_url: "https://v3b.fal.media/files/b/0a9eaa4e/xbdyPQnuWhJU558yPGwnp_pytorch_lora_weights.safetensors",
    base_prompt: "TOK_LULU_VANI, a cute magical creature named Lulu made of soft cream and blue watercolor wool, big expressive eyes, holding a glowing geometric Truth Prism. Low stimulus organic art, minimalist matte watercolor style, charcoal outlines, desaturated cream and soft blue tones",
    biome_prompt: "An underwater gentle cave interior made of smooth, rounded rocks with soft warm amber tones, calm and protective. The environment must be depicted in a low stimulus organic art style, minimalist matte watercolor painting, soft charcoal outlines, cold press paper texture, and desaturated, calming tones. Absolutely no bright lights, no neon, no photorealism, and no high-contrast harsh shadows. The scenery should feel like a gentle, slow-paced, soothing children's book illustration."
  },
  sora: {
    lora_url: "https://v3b.fal.media/files/b/0a9e94ff/wyY1y3gxa7V_IWP4JC-N__pytorch_lora_weights.safetensors",
    base_prompt: "TOK_SORA_VANI, a 7-year-old girl, stylized child proportions, head slightly larger than body, 4.5 heads tall scale, serene expression, wearing very light flowy sky-blue organic clothes and bare feet, holding a delicate silk kite. Low stimulus organic art, minimalist matte watercolor style, charcoal outlines, cold press paper texture, desaturated sky tones",
    biome_prompt: "A quiet landscape of a single simple floating land island hanging in a pale blue sky, surrounded by soft, flat-washed clouds. The environment must be depicted in a low stimulus organic art style, minimalist matte watercolor painting, soft charcoal outlines, cold press paper texture, and desaturated, calming tones. Absolutely no bright lights, no neon, no photorealism, and no high-contrast harsh shadows. The scenery should feel like a gentle, slow-paced, soothing children's book illustration."
  },
  bibi: {
    lora_url: "https://v3b.fal.media/files/b/0a9eacdd/Qkiahjj9h5NrbMfhhTnPi_pytorch_lora_weights.safetensors",
    base_prompt: "TOK_BIBI_VANI, a cute small explorer robot named Bibi made of matte ceramic, big expressive lens eyes, holding a glowing Cosmic Telescope. Low stimulus organic art, minimalist matte watercolor style, charcoal outlines, desaturated soft navy and warm grey tones",
    biome_prompt: "A quiet, simple outer space background with flat-colored pastel planets and hand-drawn faint stars on a desaturated dark blue sky. The environment must be depicted in a low stimulus organic art style, minimalist matte watercolor painting, soft charcoal outlines, cold press paper texture, and desaturated, calming tones. Absolutely no bright lights, no neon, no photorealism, and no high-contrast harsh shadows. The scenery should feel like a gentle, slow-paced, soothing children's book illustration."
  }
};

async function generarLote() {
  for (const [id, config] of Object.entries(PERSONAJES)) {
    console.log(`\nGenerando presentacion para: ${id.toUpperCase()}`);
    const finalPrompt = `${config.base_prompt}, full body shot, standing straight looking forward. Background: ${config.biome_prompt}`;
    
    try {
      const response = await fetch('https://fal.run/fal-ai/flux-lora', {
        method: 'POST',
        headers: {
          'Authorization': `Key ${FAL_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: finalPrompt,
          model_name: "fal-ai/flux/dev",
          loras: [{ path: config.lora_url, scale: 1.0 }],
          image_size: "landscape_4_3",
          num_inference_steps: 28,
          guidance_scale: 3.5,
          sync_mode: true
        })
      });

      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      const imageUrl = data.images[0].url;
      
      const imageResponse = await fetch(imageUrl);
      const buffer = await imageResponse.arrayBuffer();
      const publicDir = path.join(rootDir, 'public');
      const fileName = `${id}_presentacion_cap0.png`;
      fs.writeFileSync(path.join(publicDir, fileName), Buffer.from(buffer));
      console.log(`✅ Guardado: /public/${fileName}`);
    } catch (e) {
      console.error(`❌ Error en ${id}:`, e.message);
    }
  }
}

generarLote();
