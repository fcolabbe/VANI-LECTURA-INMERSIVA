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

const BASE_PROMPT = "TOK_LULU_VANI, a cute magical creature named Lulu made of soft cream and blue watercolor wool, big expressive eyes, holding a glowing geometric Truth Prism. Low stimulus organic art, minimalist matte watercolor style, charcoal outlines, desaturated cream and soft blue tones";
const LORA_URL = "https://v3b.fal.media/files/b/0a9eaa4e/xbdyPQnuWhJU558yPGwnp_pytorch_lora_weights.safetensors";

const luluPrompts = [
  // Cap 1
  { filename: 'lulu_cuento1_1.png', prompt: 'standing in a misty valley listening to a sad echo, holding her glowing prism' },
  { filename: 'lulu_cuento1_2.png', prompt: 'looking behind rocks at a small whispering bat hiding in the shadows' },
  { filename: 'lulu_cuento1_3.png', prompt: 'illuminating a dark cave corner with her glowing prism, comforting the small bat' },
  
  // Cap 2
  { filename: 'lulu_cuento2_1.png', prompt: 'walking through a crystal cave maze, looking at distorted reflections of herself' },
  { filename: 'lulu_cuento2_2.png', prompt: 'looking at a crying small fox standing in front of a distorted funhouse mirror crystal' },
  { filename: 'lulu_cuento2_3.png', prompt: 'touching the fox affectionately while projecting his true beautiful orange reflection with her prism' },
  
  // Cap 3
  { filename: 'lulu_cuento3_1.png', prompt: 'standing in a frozen path looking at a shivering, fragile ice flower' },
  { filename: 'lulu_cuento3_2.png', prompt: 'watching a white butterfly looking fearfully at the fragile ice flower' },
  { filename: 'lulu_cuento3_3.png', prompt: 'covering the ice flower with a warm glow from her prism, making it sparkle like stars' },
  
  // Cap 4
  { filename: 'lulu_cuento4_1.png', prompt: 'standing at the edge of a dark, murky swamp filled with dry leaves, looking slightly afraid' },
  { filename: 'lulu_cuento4_2.png', prompt: 'illuminating a large muddy silhouette in the water, revealing a grumpy old toad trapped in a branch' },
  { filename: 'lulu_cuento4_3.png', prompt: 'bravely stretching her wool arm to free the toad from the heavy branch' },
  
  // Cap 5
  { filename: 'lulu_cuento5_1.png', prompt: 'standing in a noisy wooden city in the trees, surrounded by busy beavers running around' },
  { filename: 'lulu_cuento5_2.png', prompt: 'watching a young beaver slipping while trying to stop a giant wooden gear spinning out of control' },
  { filename: 'lulu_cuento5_3.png', prompt: 'projecting a beautiful rainbow in the sky, making all the beavers pause and look up' },
  
  // Cap 6
  { filename: 'lulu_cuento6_1.png', prompt: 'walking into a valley covered in blue mist, listening to a sad wailing wind' },
  { filename: 'lulu_cuento6_2.png', prompt: 'looking at a large grey wolf crying tears that form small puddles on the dry grass' },
  { filename: 'lulu_cuento6_3.png', prompt: 'sitting silently next to the grey wolf, comforting him, her prism reflecting a new rock' },
  
  // Cap 7
  { filename: 'lulu_cuento7_1.png', prompt: 'standing at the edge of a huge abyss with a dangerous floating cloud bridge' },
  { filename: 'lulu_cuento7_2.png', prompt: 'watching a small deer trembling with fear, hesitating to step on the floating clouds' },
  { filename: 'lulu_cuento7_3.png', prompt: 'projecting a pink light beam onto the safe clouds, guiding the small deer confidently across' },
  
  // Cap 8
  { filename: 'lulu_cuento8_1.png', prompt: 'entering a strange village where animals are wearing wooden masks painted like other animals' },
  { filename: 'lulu_cuento8_2.png', prompt: 'looking at a raccoon who tripped because of his heavy mask, while other masked animals stare silently' },
  { filename: 'lulu_cuento8_3.png', prompt: 'shining her prism to melt the paint off the masks, revealing the animals true smiling faces' },
  
  // Cap 9
  { filename: 'lulu_cuento9_1.png', prompt: 'looking at a beautiful nightingale on a dry branch opening its beak but making no sound' },
  { filename: 'lulu_cuento9_2.png', prompt: 'watching the frustrated bird kicking dry leaves and hiding its head under its wing' },
  { filename: 'lulu_cuento9_3.png', prompt: 'projecting a warm yellow light onto the bird, humming a lullaby to help it sing again' },
  
  // Cap 10
  { filename: 'lulu_cuento10_1.png', prompt: 'walking into a dark, freezing cavern where giant spooky shadows stretch like claws' },
  { filename: 'lulu_cuento10_2.png', prompt: 'looking at a small hedgehog curled into a ball, crying and trembling in fear of the shadows' },
  { filename: 'lulu_cuento10_3.png', prompt: 'illuminating the cave with bright blue light, revealing the shadows are just small butterflies' },
  
  // Cap 11
  { filename: 'lulu_cuento11_1.png', prompt: 'standing in a garden of black soil watching an anxious squirrel digging holes everywhere' },
  { filename: 'lulu_cuento11_2.png', prompt: 'watching the crying squirrel accidentally destroy a tiny green sprout while digging too fast' },
  { filename: 'lulu_cuento11_3.png', prompt: 'sitting peacefully on the grass next to the squirrel, waiting patiently for morning flowers to bloom' },
  
  // Cap 12
  { filename: 'lulu_cuento12_1.png', prompt: 'standing by a furious river where sharp, ugly word-letters float and cut the willow leaves' },
  { filename: 'lulu_cuento12_2.png', prompt: 'watching mischievous monkeys throwing rough stone-words at a crying grey duckling' },
  { filename: 'lulu_cuento12_3.png', prompt: 'shining her prism at the monkeys, turning the sharp letters into floating lotus flowers' },
  
  // Cap 13
  { filename: 'lulu_cuento13_1.png', prompt: 'looking at a massive sparkling crystal door showing a perfect illusion of an easy world' },
  { filename: 'lulu_cuento13_2.png', prompt: 'watching paralyzed animals staring at the crystal door, afraid to cross into the real world' },
  { filename: 'lulu_cuento13_3.png', prompt: 'uniting her prism with the door, shattering the illusion into fresh air, animals feeling the real wind' },
  
  // Cap 14
  { filename: 'lulu_cuento14_1.png', prompt: 'standing in a vast dewy meadow under a giant waterfall of pure light, surrounded by happy animals' },
  { filename: 'lulu_cuento14_2.png', prompt: 'holding up her glowing prism as the waterfall of light hits it, exploding into a giant rainbow in the sky' },
  { filename: 'lulu_cuento14_3.png', prompt: 'closing her eyes peacefully, feeling the warm wind ruffle her wool as the rainbow shines brightly' }
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
  console.log(`\n🎨 INICIANDO PIPELINE DE ARTE TEMPORADA 1 LULÚ (FLUX-LORA REAL)`);
  
  for (const item of luluPrompts) {
    await generarImagen(item);
  }
  
  console.log(`\n🎉 Pipeline de arte completado. Todas las imágenes generadas.`);
}

run();
