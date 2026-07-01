import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const vaniDataPath = path.resolve(__dirname, '../src/data/vaniData.js');

let data = fs.readFileSync(vaniDataPath, 'utf-8');

// We have lulu_1 to lulu_14
for (let c = 1; c <= 14; c++) {
  for (let e = 1; e <= 3; e++) {
    const filename = `/lulu_cuento${c}_${e}.png`;
    // We replace the first occurrence of "/lulu_escena_temp.png" in the file 
    // since we do it sequentially, it should match the order of scenes.
    data = data.replace(/\/lulu_escena_temp\.png/, filename);
  }
}

fs.writeFileSync(vaniDataPath, data, 'utf-8');
console.log('✅ Updated lulu_escena_temp.png to actual filenames in vaniData.js');
