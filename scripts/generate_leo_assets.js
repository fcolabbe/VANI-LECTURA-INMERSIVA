import fs from 'fs';
import path from 'path';

const FAL_KEY = "ae00b61e-7901-4f90-953f-f9c57184a220:837c7fb638d8fbf99ec9c49c10a7f033";
const LORA_URL = "https://v3b.fal.media/files/b/0a9e7804/NjycUL8iANrvAV2pxaIna_pytorch_lora_weights.safetensors";
const OUTPUT_DIR = path.join(process.cwd(), 'public');

const LEO_ANCHOR = "TOK_LEO_VANI, a 7-year-old explorer boy, hazel eyes, messy short brown hair, wearing a matte mustard-ochre wool jacket and brown mountain boots, holding an antique gold lantern emitting soft warm light. Low stimulus, minimalist watercolor style, charcoal outlines, cold press paper texture, desaturated earth tones";

const prompts = [
  {
    name: "leo_fase1_sendero",
    prompt: `A character design sheet of ${LEO_ANCHOR}. The scene shows Leo standing at the end of a long, straight, flat dirt path in a calm forest. The path is clear and waiting to be drawn on. Wide shot, landscape.`
  },
  {
    name: "leo_fase2_piedras",
    prompt: `A character design sheet of ${LEO_ANCHOR}. Leo is sitting quietly on the ground next to a large glowing mossy stone in a serene forest clearing. Peaceful, static pose. Landscape orientation.`
  },
  {
    name: "leo_fase3_nidos",
    prompt: `A character design sheet of ${LEO_ANCHOR}. The scene shows three large empty nests made of soft twigs on the forest floor, ready to receive geometric shapes. Leo is standing nearby watching. Minimalist background. Landscape orientation.`
  }
];

async function generateImage(promptObj) {
  console.log(`Generating ${promptObj.name}...`);
  try {
    const response = await fetch("https://fal.run/fal-ai/flux-lora", {
      method: "POST",
      headers: {
        "Authorization": `Key ${FAL_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt: promptObj.prompt,
        image_size: "landscape_4_3",
        num_inference_steps: 28,
        guidance_scale: 3.5,
        loras: [
          {
            path: LORA_URL,
            scale: 1.0
          }
        ]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error(`Error from Fal.ai for ${promptObj.name}:`, err);
      return;
    }

    const data = await response.json();
    const imageUrl = data.images[0].url;
    console.log(`Image generated at URL: ${imageUrl}`);
    
    // Download image
    const imgResponse = await fetch(imageUrl);
    const buffer = await imgResponse.arrayBuffer();
    const filePath = path.join(OUTPUT_DIR, `${promptObj.name}.png`);
    fs.writeFileSync(filePath, Buffer.from(buffer));
    console.log(`Saved to ${filePath}`);

  } catch (error) {
    console.error(`Fetch error for ${promptObj.name}:`, error);
  }
}

async function run() {
  for (const p of prompts) {
    await generateImage(p);
  }
  console.log("All generation tasks completed.");
}

run();
