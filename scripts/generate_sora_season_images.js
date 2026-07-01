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

const BASE_PROMPT = "TOK_SORA_VANI, a 7-year-old girl, stylized child proportions, head slightly larger than body, 4.5 heads tall scale, serene expression, wearing very light flowy sky-blue organic clothes and bare feet, holding a delicate silk kite. Low stimulus organic art, minimalist matte watercolor style, charcoal outlines, cold press paper texture, desaturated sky tones";
const LORA_URL = "https://v3b.fal.media/files/b/0a9e94ff/wyY1y3gxa7V_IWP4JC-N__pytorch_lora_weights.safetensors";

const soraPrompts = [
  // Cap 1
  { filename: 'sora_cuento1_1.png', prompt: 'standing on a cloud bridge looking up at the empty white sky, holding the thin string of her kite' },
  { filename: 'sora_cuento1_2.png', prompt: 'looking surprised and slightly scared as a sudden gust of wind pulls hard on her kite string, tightening her hands' },
  { filename: 'sora_cuento1_3.png', prompt: 'sighing with relief, gently letting the kite string loose as the kite dances beautifully in the breeze' },
  
  // Cap 2
  { filename: 'sora_cuento2_1.png', prompt: 'flying her kite near the tall peak of a mountain, looking at a small grey cloud stuck on the sharp rocks' },
  { filename: 'sora_cuento2_2.png', prompt: 'watching the grey cloud crying and pushing hard against the hard mountain stone' },
  { filename: 'sora_cuento2_3.png', prompt: 'sitting patiently next to the mountain peak until the wind changes, the cloud floating away freely' },
  
  // Cap 3
  { filename: 'sora_cuento3_1.png', prompt: 'standing on a floating island watching a small blue bird flying in confused circles' },
  { filename: 'sora_cuento3_2.png', prompt: 'looking at the tired blue bird looking down and north, visibly lost and confused' },
  { filename: 'sora_cuento3_3.png', prompt: 'singing a sweet rhyme with her eyes closed, the blue bird flying confidently towards the horizon' },
  
  // Cap 4
  { filename: 'sora_cuento4_1.png', prompt: 'looking shocked as a large bird flies past and snaps her thin kite string' },
  { filename: 'sora_cuento4_2.png', prompt: 'looking calmly at her kite falling slowly through the sky, holding the broken string' },
  { filename: 'sora_cuento4_3.png', prompt: 'carefully tying a small tight knot to repair her kite string, the kite flying beautifully again' },
  
  // Cap 5
  { filename: 'sora_cuento5_1.png', prompt: 'walking on low clouds, looking at many dry autumn leaves scattered chaotically in the blue sky' },
  { filename: 'sora_cuento5_2.png', prompt: 'watching the dry leaves spin in a dizzying chaotic whirlwind of wind' },
  { filename: 'sora_cuento5_3.png', prompt: 'making her kite dance in slow waves, the dry leaves following her rhythm and falling gently like a carpet' },
  
  // Cap 6
  { filename: 'sora_cuento6_1.png', prompt: 'standing on a wooden bridge as a huge dark shadow covers the sky, small birds hiding in fear' },
  { filename: 'sora_cuento6_2.png', prompt: 'closing her eyes and taking a deep breath while a massive thunder crashes loudly in the dark sky' },
  { filename: 'sora_cuento6_3.png', prompt: 'singing happily in rhythm with the thunder, small birds peeking out, the sky clearing up' },
  
  // Cap 7
  { filename: 'sora_cuento7_1.png', prompt: 'looking at a broken rainbow, its colors separated: red flying north, blue in the river, yellow in a pine tree' },
  { filename: 'sora_cuento7_2.png', prompt: 'flying gracefully with her kite, collecting the separated ribbons of colored light' },
  { filename: 'sora_cuento7_3.png', prompt: 'tying the blue, green, red and yellow ribbons together, the rainbow shining warmly over the grateful animals' },
  
  // Cap 8
  { filename: 'sora_cuento8_1.png', prompt: 'standing on a cloud bridge looking at a fragile golden butterfly struggling to fly in the cold, heavy wind' },
  { filename: 'sora_cuento8_2.png', prompt: 'looking thoughtfully at the fragile butterfly, keeping her hands away so she doesn’t hurt it' },
  { filename: 'sora_cuento8_3.png', prompt: 'blowing a soft, warm breath from her lips to create an invisible cushion of air, guiding the butterfly safely' },
  
  // Cap 9
  { filename: 'sora_cuento9_1.png', prompt: 'looking frustrated as her kite string is terribly tangled in the hard branches of a large oak tree' },
  { filename: 'sora_cuento9_2.png', prompt: 'pulling the kite string hard, making the knot tighter against the branches, looking annoyed' },
  { filename: 'sora_cuento9_3.png', prompt: 'breathing deeply and gently untying the complex knot with delicate fingers, freeing the kite' },
  
  // Cap 10
  { filename: 'sora_cuento10_1.png', prompt: 'landing her kite in a hurry as dark clouds bring a sudden cold rain, soaking her clothes' },
  { filename: 'sora_cuento10_2.png', prompt: 'sitting inside a small cozy grass cave shelter, listening to the rain hitting the rocks' },
  { filename: 'sora_cuento10_3.png', prompt: 'jumping playfully in the transparent puddles outside the cave, splashing sparkling water drops and laughing' },
  
  // Cap 11
  { filename: 'sora_cuento11_1.png', prompt: 'sitting on the ground surprised as the furious North Wind violently snatches her kite away' },
  { filename: 'sora_cuento11_2.png', prompt: 'clinching her fists in anger as the wind creates a massive swirling cloud of dust and dry leaves' },
  { filename: 'sora_cuento11_3.png', prompt: 'relaxing her hands and blowing a long, steady breath from her mouth, calming the furious wind into a warm breeze' },
  
  // Cap 12
  { filename: 'sora_cuento12_1.png', prompt: 'standing on a wooden bridge completely surrounded by a dense, blinding white fog, holding her kite string' },
  { filename: 'sora_cuento12_2.png', prompt: 'taking a hesitant step in the absolute white fog, her hands trembling slightly in fear of falling' },
  { filename: 'sora_cuento12_3.png', prompt: 'walking confidently with her eyes closed, listening to the water and feeling the moss under her bare feet' },
  
  // Cap 13
  { filename: 'sora_cuento13_1.png', prompt: 'standing at the edge of a broken hanging bridge over a massive, dark, terrifying abyss' },
  { filename: 'sora_cuento13_2.png', prompt: 'looking down into the cold dark canyon, doubting if she should jump, feeling afraid' },
  { filename: 'sora_cuento13_3.png', prompt: 'jumping bravely over the abyss, her kite catching the strong updraft, gliding happily across the giant canyon' },
  
  // Cap 14
  { filename: 'sora_cuento14_1.png', prompt: 'standing on a golden peak under a dark velvet night sky, smiling peacefully among birds and clouds' },
  { filename: 'sora_cuento14_2.png', prompt: 'looking at small birds holding fragile paper lanterns, afraid to let them fly into the dark sky' },
  { filename: 'sora_cuento14_3.png', prompt: 'teaching the birds to release the lanterns gently, thousands of lights floating magically into the starry sky' }
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
  console.log(`\n🎨 INICIANDO PIPELINE DE ARTE TEMPORADA 1 SORA (FLUX-LORA REAL)`);
  
  for (const item of soraPrompts) {
    await generarImagen(item);
  }
  
  console.log(`\n🎉 Pipeline de arte completado. Todas las imágenes generadas.`);
}

run();
