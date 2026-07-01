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

const BASE_PROMPT = "TOK_KODA_VANI, a native boy, dark messy hair, big eyes, wearing a torn rustic green tunic and bare feet, holding a small wooden drum. Low stimulus, minimalist watercolor style, charcoal outlines, cold press paper texture, desaturated earth tones";
const LORA_URL = "https://v3b.fal.media/files/b/0a9e8fba/ZOci8mLKa5KB08y-JoMjg_pytorch_lora_weights.safetensors";

const kodaPrompts = [
  // Cap 1
  { filename: 'koda_cuento1_1.png', prompt: 'standing on the forest floor, looking down at a large vibrating tree root' },
  { filename: 'koda_cuento1_2.png', prompt: 'looking at a giant beetle tapping its legs on the ground next to a tree root' },
  { filename: 'koda_cuento1_3.png', prompt: 'sitting on the ground playing a bamboo drum while the beetle listens calmly' },
  
  // Cap 2
  { filename: 'koda_cuento2_1.png', prompt: 'standing at the entrance of a mossy green cave with a large beetle' },
  { filename: 'koda_cuento2_2.png', prompt: 'looking at a large stone door with animal carvings inside a cave' },
  { filename: 'koda_cuento2_3.png', prompt: 'breathing calmly with his eyes closed as the stone door opens, revealing a glowing tunnel' },
  
  // Cap 3
  { filename: 'koda_cuento3_1.png', prompt: 'standing near an underground river flowing violently against large tree roots' },
  { filename: 'koda_cuento3_2.png', prompt: 'looking at loose rocks in the violent river, water splashing' },
  { filename: 'koda_cuento3_3.png', prompt: 'sitting by the river bank with his eyes closed, playing his bamboo drum softly like rain' },
  
  // Cap 4
  { filename: 'koda_cuento4_1.png', prompt: 'playing his drum as the underground river flows calmly around the roots' },
  { filename: 'koda_cuento4_2.png', prompt: 'A glowing golden leaf falling gently onto the bamboo drum' },
  { filename: 'koda_cuento4_3.png', prompt: 'holding a glowing seed of light that sprouted from the golden leaf' },
  
  // Cap 5
  { filename: 'koda_cuento5_1.png', prompt: 'walking down a twisted root path towards a lagoon full of many jumping frogs' },
  { filename: 'koda_cuento5_2.png', prompt: 'looking at stressed, noisy frogs in the lagoon' },
  { filename: 'koda_cuento5_3.png', prompt: 'standing on a large lily pad playing his drum, guiding the frogs into a peaceful silence' },
  
  // Cap 6
  { filename: 'koda_cuento6_1.png', prompt: 'looking at a huge, tired brown bear walking in circles breaking branches' },
  { filename: 'koda_cuento6_2.png', prompt: 'watching the large bear roaring up at the starry sky, birds flying away' },
  { filename: 'koda_cuento6_3.png', prompt: 'sitting at a safe distance playing a calm lullaby on his drum, the bear sleeping peacefully' },
  
  // Cap 7
  { filename: 'koda_cuento7_1.png', prompt: 'surrounded by colorful, moving vines in the deep jungle' },
  { filename: 'koda_cuento7_2.png', prompt: 'walking with his eyes closed, guided only by the soft glow of his light seed, ignoring the vines' },
  { filename: 'koda_cuento7_3.png', prompt: 'marching steadily with his drum towards a secret passage hidden behind ferns' },
  
  // Cap 8
  { filename: 'koda_cuento8_1.png', prompt: 'standing at the edge of a deep vertical canyon, looking at a fragile hanging wooden ladder' },
  { filename: 'koda_cuento8_2.png', prompt: 'carefully testing a wooden step on the hanging ladder while playing his drum' },
  { filename: 'koda_cuento8_3.png', prompt: 'slowly and balanced climbing down the hanging ladder into the canyon, breathing calmly' },
  
  // Cap 9
  { filename: 'koda_cuento9_1.png', prompt: 'standing at the bottom of the canyon in a beautiful cavern bathed in soft emerald and gold light' },
  { filename: 'koda_cuento9_2.png', prompt: 'looking at a huge crystalline stone pulsating rapidly in the center of the cavern' },
  { filename: 'koda_cuento9_3.png', prompt: 'resting his hands on his bamboo drum, standing respectfully before the giant crystal' },
  
  // Cap 10
  { filename: 'koda_cuento10_1.png', prompt: 'looking at the giant crystal flashing erratically and violently, causing the cavern to shake' },
  { filename: 'koda_cuento10_2.png', prompt: 'standing still as small rocks fall from the cavern roof, ignoring the noise' },
  { filename: 'koda_cuento10_3.png', prompt: 'with closed eyes, playing a steady, calm, motherly rhythm on his bamboo drum' },
  
  // Cap 11
  { filename: 'koda_cuento11_1.png', prompt: 'playing his drum while the giant crystal projects scary wolf illusions' },
  { filename: 'koda_cuento11_2.png', prompt: 'calmly ignoring the wolf illusions, completely unfazed, continuing his drum beat' },
  { filename: 'koda_cuento11_3.png', prompt: 'stopping his drum, standing in absolute, powerful silence as the giant crystal pauses to listen' },
  
  // Cap 12
  { filename: 'koda_cuento12_1.png', prompt: 'slowly playing his drum, synchronizing with the calmer breathing of the glowing emerald crystal' },
  { filename: 'koda_cuento12_2.png', prompt: 'smiling peacefully in the warm, serene light of the calm cavern' },
  { filename: 'koda_cuento12_3.png', prompt: 'touching the giant crystal gently with both hands, feeling deeply connected to the roots of the forest' },
  
  // Cap 13
  { filename: 'koda_cuento13_1.png', prompt: 'A peaceful forest above ground, animals coming out of hiding to celebrate in the sunlight' },
  { filename: 'koda_cuento13_2.png', prompt: 'The underground cavern looking like a peaceful sanctuary, tiny green leaves sprouting on the grey rocks' },
  { filename: 'koda_cuento13_3.png', prompt: 'putting away his bamboo drum with deep gratitude, his heart full of peace' },
  
  // Cap 14
  { filename: 'koda_cuento14_1.png', prompt: 'A perfect drop of bright blue dew falling from the emerald crystal onto a seashell' },
  { filename: 'koda_cuento14_2.png', prompt: 'holding the ancient seashell with the blue water drop, looking at it with wonder' },
  { filename: 'koda_cuento14_3.png', prompt: 'holding the seashell to his ear, smiling as he listens to the sound of ocean waves and whales' }
];

async function generarImagen(item) {
  const promptText = `${BASE_PROMPT}, ${item.prompt}`;
  const filePath = path.join(rootDir, 'public', item.filename);

  console.log(`\n⏳ Generando: ${item.filename} ...`);
  
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
        loras: [{ path: LORA_URL, scale: 1.0 }],
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
  console.log(`\n🎨 INICIANDO PIPELINE DE ARTE TEMPORADA 1 KODA (FLUX-LORA REAL)`);
  
  for (const item of kodaPrompts) {
    await generarImagen(item);
  }
  
  console.log(`\n🎉 Pipeline de arte completado. Todas las imágenes generadas.`);
}

run();
