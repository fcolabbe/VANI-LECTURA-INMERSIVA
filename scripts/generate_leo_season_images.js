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

const BASE_PROMPT = "TOK_LEO_VANI, a 7-year-old explorer boy, hazel eyes, messy short brown hair, wearing a matte mustard-ochre wool jacket and brown mountain boots, holding an antique gold lantern emitting soft warm light. Low stimulus, minimalist watercolor style, charcoal outlines, cold press paper texture, desaturated earth tones";
const LORA_URL = "https://v3b.fal.media/files/b/0a9e7804/NjycUL8iANrvAV2pxaIna_pytorch_lora_weights.safetensors";

// Prompts manuales curados para garantizar la consistencia visual y la Regla de Cero Fricción
const LEO_SEASON_SCENES = {
  1: [
    "walking patiently in a quiet green forest, ground covered in soft green moss, full body shot, landscape orientation",
    "kneeling down to look at a small golden light reflection under a fern leaf, holding his lantern, landscape orientation",
    "holding a small glowing musical round stone in his hands, soft light, landscape orientation"
  ],
  2: [
    "standing in front of a huge old bridge made of thick intertwined tree roots, looking focused, landscape orientation",
    "taking a deep breath while looking down from a high root bridge into a dark abyss, holding his lantern high, landscape orientation",
    "standing on the other side of the bridge, holding a second glowing stone, wind blowing his jacket, landscape orientation"
  ],
  3: [
    "entering a dark pine cave, holding his gold lantern high to light the dark shadows, landscape orientation",
    "walking inside a cave with bright glowing amber walls, warm golden light reflecting everywhere, landscape orientation",
    "putting a glowing round stone in his backpack, small animal footprints visible on the dusty floor, landscape orientation"
  ],
  4: [
    "standing near a small dirt burrow, looking kindly at a sad little fox shivering outside, landscape orientation",
    "sitting next to a small fox, covering the fox with his heavy wool jacket to keep it warm, landscape orientation",
    "the small fox happily digging the ground and giving a glowing stone to the boy, landscape orientation"
  ],
  5: [
    "standing next to a very loud and fast river waterfall, looking patiently at the strong water current, landscape orientation",
    "pushing heavy fallen tree branches blocking the crystal clear water stream, showing great effort, landscape orientation",
    "holding a glowing stone near calm clear water, a steep stone staircase visible carved into the mountain rock above, landscape orientation"
  ],
  6: [
    "climbing very steep stone stairs carved in the mountain, looking exhausted but determined, landscape orientation",
    "taking a deep breath on the high stairs, holding his gold lantern, looking up with hope, landscape orientation",
    "sitting on a flat rock at the top of the stairs, holding a glowing stone, a golden flying beetle pointing the way, landscape orientation"
  ],
  7: [
    "walking in extremely thick white fog, dark bushes looking like scary monsters in the blurry background, landscape orientation",
    "using his gold lantern to reveal a friendly large sloth sleeping near an old tree, fog clearing up, landscape orientation",
    "finding a glowing stone under the sleeping sloth's paw, cold wind blowing snow onto his face, landscape orientation"
  ],
  8: [
    "walking on a rocky path completely covered in slippery white frost and ice, holding onto a fallen branch to avoid falling, landscape orientation",
    "sitting on the snowy ground after slipping, laughing happily, no injuries, snow on his clothes, landscape orientation",
    "holding a frozen glowing stone that is melting in his warm hands, looking up at a flying eagle in the distance, landscape orientation"
  ],
  9: [
    "standing in a strong white snowstorm, looking at a small scared baby bird hiding behind a rock, landscape orientation",
    "using his heavy wool jacket and some rocks to build a small safe shelter for the baby bird, landscape orientation",
    "the baby bird giving him a glowing blue feather and a stone, thick white fog clearing up to show a giant mountain peak, landscape orientation"
  ],
  10: [
    "walking through a long canyon with high grey rock walls, looking slightly worried about the echoing wind, landscape orientation",
    "walking confidently forward with courage through the grey rock canyon, ignoring the loud wind, landscape orientation",
    "putting a round rock inside a hole in the canyon wall to stop the wind, holding a glowing stone, a bright ice cave entrance opening up, landscape orientation"
  ],
  11: [
    "entering a spectacular deep ice cave filled with giant sharp icicles hanging from the high ceiling, touching a frozen rock, landscape orientation",
    "walking rhythmically and very carefully on tiptoes on a slippery frozen crystal floor, extreme focus, landscape orientation",
    "a thin blue ice wall peacefully breaking to reveal a glowing stone, boy smiling proudly with relief, landscape orientation"
  ],
  12: [
    "struggling against a brutal freezing wind gust and heavy snowstorm outside the ice cave, fighting the violent weather, landscape orientation",
    "leaning forward with extreme determination against the heavy snowstorm, eyes closed, holding his lantern tight, landscape orientation",
    "the snowstorm dissipating, finding a glowing stone buried in fresh snow, the ultimate huge mountain peak visible just ahead, landscape orientation"
  ],
  13: [
    "looking exhausted while standing in front of a giant vertical smooth rock wall blocking his path, looking up, landscape orientation",
    "taking a deep breath and climbing the vertical rock wall with extreme effort and brave heart, landscape orientation",
    "crossing the top edge of the wall, finding a glowing stone on a small white marble pedestal, an epic tall stone lighthouse in the background, landscape orientation"
  ],
  14: [
    "standing in awe in front of a majestic ancient stone lighthouse at the absolute top of the world, taking out glowing stones from his bag, landscape orientation",
    "placing the final glowing stone into the lighthouse, a massive golden light beam illuminating the entire sky and mountain, landscape orientation",
    "celebrating happily bathed in warm golden light, a strange turquoise sea breeze blowing around him, landscape orientation"
  ]
};

async function generarImagen(capitulo, escenaIdx) {
  const promptText = `${BASE_PROMPT}, ${LEO_SEASON_SCENES[capitulo][escenaIdx]}`;
  const fileName = `leo_cuento${capitulo}_${escenaIdx + 1}.png`;
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
    console.log(`✅ ¡Guardado con éxito! /public/${fileName}`);
  } catch (e) {
    console.error(`❌ Error generando ${fileName}:`, e.message);
  }
}

async function run() {
  console.log(`\n🎨 INICIANDO PIPELINE DE ARTE TEMPORADA 1 LEO (FLUX-LORA)`);
  
  const capitulos = Object.keys(LEO_SEASON_SCENES).map(Number).sort((a, b) => a - b);
  
  for (const cap of capitulos) {
    console.log(`\n--- PROCESANDO CAPÍTULO ${cap} ---`);
    for (let i = 0; i < 3; i++) {
      await generarImagen(cap, i);
    }
  }
  
  console.log(`\n🎉 Pipeline de arte completado. Todas las imágenes generadas.`);
}

run();
