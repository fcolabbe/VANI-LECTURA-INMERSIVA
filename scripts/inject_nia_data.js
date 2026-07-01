import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const fileToEdit = path.join(rootDir, 'src/data/vaniData.js');
let content = fs.readFileSync(fileToEdit, 'utf-8');

const act1 = JSON.parse(fs.readFileSync('/Users/mariolabbe/.gemini/antigravity-ide/brain/9ab7f26b-8adb-4b40-94ad-2f77b46c5ae3/scratch/nia_acto1.json', 'utf-8'));
const act2 = JSON.parse(fs.readFileSync('/Users/mariolabbe/.gemini/antigravity-ide/brain/9ab7f26b-8adb-4b40-94ad-2f77b46c5ae3/scratch/nia_acto2.json', 'utf-8'));
const act3 = JSON.parse(fs.readFileSync('/Users/mariolabbe/.gemini/antigravity-ide/brain/9ab7f26b-8adb-4b40-94ad-2f77b46c5ae3/scratch/nia_acto3.json', 'utf-8'));

const combined = { ...act1, ...act2, ...act3 };
let jsonString = JSON.stringify(combined, null, 4);
jsonString = jsonString.substring(1, jsonString.length - 1);

const endPattern = "    }\n\n  }\n};";
if (content.includes(endPattern)) {
  content = content.replace(endPattern, "    },\n" + jsonString + "\n  }\n};");
  fs.writeFileSync(fileToEdit, content);
  console.log("✅ Datos de Nia inyectados correctamente.");
} else {
  console.error("❌ Falló la inyección. Busca otro patrón.");
}
