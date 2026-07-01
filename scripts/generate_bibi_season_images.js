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

const BASE_PROMPT = "TOK_BIBI_VANI, a cute small explorer robot named Bibi made of matte ceramic, big expressive lens eyes, holding a glowing Cosmic Telescope. Low stimulus organic art, minimalist matte watercolor style, charcoal outlines, desaturated soft navy and warm grey tones";
const LORA_URL = "https://v3b.fal.media/files/b/0a9eacdd/Qkiahjj9h5NrbMfhhTnPi_pytorch_lora_weights.safetensors";

const bibiPrompts = [
  // Cap 1
  { filename: 'bibi_cuento1_1.png', prompt: 'looking up at a huge blurry blue moon in the night sky, his vision out of focus' },
  { filename: 'bibi_cuento1_2.png', prompt: 'shaking his telescope in frustration, looking upset and almost dropping it to the ground' },
  { filename: 'bibi_cuento1_3.png', prompt: 'carefully cleaning the telescope lens with a soft cloth, the bright moon clear in the background' },
  
  // Cap 2
  { filename: 'bibi_cuento2_1.png', prompt: 'staring at a single blinking star far away in the dark night sky' },
  { filename: 'bibi_cuento2_2.png', prompt: 'looking distracted by fast-moving grey clouds, losing sight of his star' },
  { filename: 'bibi_cuento2_3.png', prompt: 'sitting perfectly still, staring patiently at a fixed point until the star blinks again' },
  
  // Cap 3
  { filename: 'bibi_cuento3_1.png', prompt: 'looking shocked as a small metal screw falls from his arm onto the rocky grey ground' },
  { filename: 'bibi_cuento3_2.png', prompt: 'running in panicked circles, kicking rocks and creating a messy cloud of dark dust' },
  { filename: 'bibi_cuento3_3.png', prompt: 'calmly inspecting the sand closely, finding the tiny shiny screw next to a rock' },
  
  // Cap 4
  { filename: 'bibi_cuento4_1.png', prompt: 'standing inside a dark echoing cave, looking dizzy and overwhelmed by the loud wind' },
  { filename: 'bibi_cuento4_2.png', prompt: 'closing his glowing lens eyes, finding inner silence to ignore the loud echoes' },
  { filename: 'bibi_cuento4_3.png', prompt: 'following a soft beep, discovering a beautiful glowing crystal hidden behind a large rock' },
  
  // Cap 5
  { filename: 'bibi_cuento5_1.png', prompt: 'looking confused at a messy box full of chaotic scattered gears of many colors and sizes' },
  { filename: 'bibi_cuento5_2.png', prompt: 'trying to force a square gear into a round hole, creating sparks and scratching noises' },
  { filename: 'bibi_cuento5_3.png', prompt: 'neatly sorting the gears by shape and color, the completed machine playing a sweet melody' },
  
  // Cap 6
  { filename: 'bibi_cuento6_1.png', prompt: 'staring at a giant messy maze of tangled blue and green cables on the ground' },
  { filename: 'bibi_cuento6_2.png', prompt: 'trying to pull the tight cables with his claw hands, looking frustrated and afraid of breaking them' },
  { filename: 'bibi_cuento6_3.png', prompt: 'using his big lens eyes to trace the correct red cable path, the valley lighting up beautifully' },
  
  // Cap 7
  { filename: 'bibi_cuento7_1.png', prompt: 'meeting a massive rusty giant robot under a bridge, the giant looking down sadly' },
  { filename: 'bibi_cuento7_2.png', prompt: 'zooming his lens to look closely at a black oil drop falling like a tear on the giant’s rusty face' },
  { filename: 'bibi_cuento7_3.png', prompt: 'gently hugging the giant robot’s thick iron leg, the giant turning on a warm yellow light' },
  
  // Cap 8
  { filename: 'bibi_cuento8_1.png', prompt: 'looking at his reflection in a huge oval mirror, seeing dents on his matte ceramic chest' },
  { filename: 'bibi_cuento8_2.png', prompt: 'hiding his face in shame with his claws, looking sadly at a scratch on his right lens' },
  { filename: 'bibi_cuento8_3.png', prompt: 'smiling proudly next to an old seagull, accepting his unique dents as marks of adventure' },
  
  // Cap 9
  { filename: 'bibi_cuento9_1.png', prompt: 'walking heavily in hot desert sand, a red low-battery warning light blinking on his chest' },
  { filename: 'bibi_cuento9_2.png', prompt: 'dropping a heavy box of parts, his metal arms failing completely from exhaustion' },
  { filename: 'bibi_cuento9_3.png', prompt: 'sitting peacefully under a dry tree shadow with his eyes turned off, resting and recharging' },
  
  // Cap 10
  { filename: 'bibi_cuento10_1.png', prompt: 'walking eagerly towards a shining blue castle floating in the hot salt desert' },
  { filename: 'bibi_cuento10_2.png', prompt: 'looking confused as the blue castle disappears, realizing it was an optical illusion in the heat' },
  { filename: 'bibi_cuento10_3.png', prompt: 'touching the dry sand with his claws, trusting his touch instead of distant visual illusions' },
  
  // Cap 11
  { filename: 'bibi_cuento11_1.png', prompt: 'walking sadly on a dark grey concrete factory floor covered in rusty nuts' },
  { filename: 'bibi_cuento11_2.png', prompt: 'crouching in surprise, looking at a tiny yellow flower growing bravely from a concrete crack' },
  { filename: 'bibi_cuento11_3.png', prompt: 'carefully watering the tiny fragile plant with a single drop of water from an aluminum cup' },
  
  // Cap 12
  { filename: 'bibi_cuento12_1.png', prompt: 'looking up at a massive jammed copper gear door in a dark control tower' },
  { filename: 'bibi_cuento12_2.png', prompt: 'pushing the giant wheel alone, his wheels slipping and sparking on the floor in vain' },
  { filename: 'bibi_cuento12_3.png', prompt: 'pushing the giant gear together with three small flying drones in perfect teamwork' },
  
  // Cap 13
  { filename: 'bibi_cuento13_1.png', prompt: 'unrolling an old thick paper scroll on a rusty table, realizing the map is completely blank' },
  { filename: 'bibi_cuento13_2.png', prompt: 'frozen in fear, staring at the empty white paper, afraid of not having clear instructions' },
  { filename: 'bibi_cuento13_3.png', prompt: 'bravely drawing a new path on the blank paper with a charcoal pencil, creating his own destiny' },
  
  // Cap 14
  { filename: 'bibi_cuento14_1.png', prompt: 'standing inside a giant dome observatory, looking up at the immense starry night sky' },
  { filename: 'bibi_cuento14_2.png', prompt: 'discovering beautiful glowing spiral galaxy patterns dancing in the dark cosmic sky' },
  { filename: 'bibi_cuento14_3.png', prompt: 'sitting peacefully on the edge of the dome, his lights turned off, feeling deep cosmic calm' }
];

async function generarImagen(item) {
  const promptText = `${BASE_PROMPT}, ${item.prompt}`;
  const filePath = path.join(rootDir, 'public', item.filename);

  if (fs.existsSync(filePath)) {
    console.log(`⏩ Saltando ${item.filename} (Ya existe)`);
    return;
  }

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
  console.log(`\n🎨 INICIANDO PIPELINE DE ARTE TEMPORADA 1 BIBI (FLUX-LORA REAL)`);
  
  for (const item of bibiPrompts) {
    await generarImagen(item);
  }
  
  console.log(`\n🎉 Pipeline de arte completado. Todas las imágenes generadas.`);
}

run();
