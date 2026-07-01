import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import soraData from './sora_full_data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const vaniDataPath = path.resolve(__dirname, '../src/data/vaniData.js');

let data = fs.readFileSync(vaniDataPath, 'utf-8');

// Convert soraData object to a string format suitable for insertion
let insertString = '';
for (const [key, value] of Object.entries(soraData)) {
  let chapterStr = JSON.stringify(value, null, 2);
  chapterStr = chapterStr.split('\n').map(line => '    ' + line).join('\n');
  insertString += `\n    "${key}": ${chapterStr.trimStart()},\n`;
}

// Find the insertion point (before "bibi_0" chapter starts)
const searchStr = `    "bibi_0": {`;
if (data.includes(searchStr)) {
  data = data.replace(searchStr, `${insertString}${searchStr}`);
  fs.writeFileSync(vaniDataPath, data, 'utf-8');
  console.log('✅ Sora chapters injected successfully!');
} else {
  console.log('❌ Could not find insertion point "bibi_0": {');
}
