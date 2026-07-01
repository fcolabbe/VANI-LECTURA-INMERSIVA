import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { vaniData } from '../src/data/vaniData.js';
import { leoRewrites } from './leo_rewrites.js';
import { kodaRewrites } from './koda_rewrites.js';
import { niaRewrites } from './nia_rewrites.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function applyRewrites(characterRewrites) {
  for (const [capituloId, escenasTexto] of Object.entries(characterRewrites)) {
    if (vaniData.capitulos[capituloId]) {
      for (let i = 0; i < escenasTexto.length; i++) {
        if (vaniData.capitulos[capituloId].escenas[i]) {
          vaniData.capitulos[capituloId].escenas[i].texto = escenasTexto[i];
        }
      }
    } else {
      console.warn(`Capitulo ${capituloId} no encontrado en vaniData.`);
    }
  }
}

applyRewrites(leoRewrites);
applyRewrites(kodaRewrites);
applyRewrites(niaRewrites);

const destFile = path.join(__dirname, '../src/data/vaniData.js');

// Convertir a string con formato
const fileContent = `export const vaniData = ${JSON.stringify(vaniData, null, 2)};\n`;

fs.writeFileSync(destFile, fileContent, 'utf8');

console.log('✅ Textos de Leo, Koda y Nia actualizados exitosamente en vaniData.js');
