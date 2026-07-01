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
  console.error("No se encontró FAL_KEY en .env");
  process.exit(1);
}

const prompt = "A premium minimalist app icon logo concept featuring a single perfect circle that acts as a portal. Inside the circle, three soft, interlocking, fluid abstract waves are artfully combined. Each wave represents a natural element using a strictly desaturated, calming color palette: a muted moss-green wave, a quiet washed-out sea-blue wave, and a faint pale gray-azure wave. The design features exceptionally subtle, fine outer boundary lines mimicking a soft charcoal sketch. The entire symbol displays a rich tactile cold-press watercolor paper texture. Strictly low-stimulus organic art style, soothing children's book illustration aesthetic. Absolutely no text, no neon glows, no vibrant digital gradients, no photorealism, and no 3D effects. Completely centered and isolated on a flat, pure white background.";

async function generateLogo() {
  console.log("Iniciando generación de Logo VANI en FAL.ai...");
  
  try {
    const response = await fetch("https://fal.run/fal-ai/flux/dev", {
      method: "POST",
      headers: {
        "Authorization": `Key ${FAL_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt: prompt,
        image_size: "square_hd",
        num_inference_steps: 40,
        num_images: 4,
        guidance_scale: 7.5,
        enable_safety_checker: true
      })
    });

    if (!response.ok) {
      throw new Error(`Error de API: ${response.status} ${await response.text()}`);
    }

    const data = await response.json();
    console.log("Generación exitosa. Descargando 4 imágenes...");

    const publicDir = path.join(rootDir, 'public');
    
    for (let i = 0; i < data.images.length; i++) {
      const imgUrl = data.images[i].url;
      const imgRes = await fetch(imgUrl);
      const buffer = Buffer.from(await imgRes.arrayBuffer());
      
      const filePath = path.join(publicDir, `logo_vani_${i+1}.png`);
      fs.writeFileSync(filePath, buffer);
      console.log(`Guardado: ${filePath}`);
    }
    
    console.log("Proceso terminado.");

  } catch (error) {
    console.error("Error generando logo:", error);
  }
}

generateLogo();
