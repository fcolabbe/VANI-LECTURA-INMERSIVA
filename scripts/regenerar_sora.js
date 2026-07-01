import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(rootDir, '.env') });
const FAL_KEY = process.env.FAL_KEY;

const sora_config = {
  lora_url: "https://v3b.fal.media/files/b/0a9e94ff/wyY1y3gxa7V_IWP4JC-N__pytorch_lora_weights.safetensors",
  base_prompt: "TOK_SORA_VANI, a 7-year-old girl, stylized child proportions, head slightly larger than body, 4.5 heads tall scale, serene expression, wearing very light flowy sky-blue organic clothes and bare feet, holding a delicate silk kite. Low stimulus organic art, minimalist matte watercolor style, charcoal outlines, cold press paper texture, desaturated sky tones",
  biome_prompt: "A quiet landscape of a single simple floating land island hanging in a pale blue sky, surrounded by soft, flat-washed clouds. The environment must be depicted in a low stimulus organic art style, minimalist matte watercolor painting, soft charcoal outlines, cold press paper texture, and desaturated, calming tones. Absolutely no bright lights, no neon, no photorealism, and no high-contrast harsh shadows. The scenery should feel like a gentle, slow-paced, soothing children's book illustration."
};

async function regenerarSora() {
  console.log(`\nRegenerando presentacion para: SORA`);
  // Forzamos a que esté en primer plano y mirando al frente
  const finalPrompt = `${sora_config.base_prompt}, medium shot from the waist up, standing in the very foreground facing the camera directly, character fills the frame. Background: ${sora_config.biome_prompt}`;
  
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
        loras: [{ path: sora_config.lora_url, scale: 1.0 }],
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
    const fileName = `sora_presentacion_cap0_v2.png`;
    fs.writeFileSync(path.join(publicDir, fileName), Buffer.from(buffer));
    console.log(`✅ Guardado: /public/${fileName}`);
  } catch (e) {
    console.error(`❌ Error en SORA:`, e.message);
  }
}

regenerarSora();
