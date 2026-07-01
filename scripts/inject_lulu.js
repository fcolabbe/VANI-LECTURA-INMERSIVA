import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import luluData from './lulu_full_data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const vaniDataPath = path.resolve(__dirname, '../src/data/vaniData.js');

let data = fs.readFileSync(vaniDataPath, 'utf-8');

// Convert luluData object to a string format suitable for insertion
let insertString = '';
for (const [key, value] of Object.entries(luluData)) {
  // Convert each chapter to a formatted string and pad appropriately
  let chapterStr = JSON.stringify(value, null, 2);
  // Indent the chapter string
  chapterStr = chapterStr.split('\n').map(line => '    ' + line).join('\n');
  // Form the key-value pair string
  insertString += `\n    "${key}": ${chapterStr.trimStart()},\n`;
}

// Find the insertion point (after "lulu_0" chapter ends)
const searchStr = `    "sora_0": {`;
if (data.includes(searchStr)) {
  data = data.replace(searchStr, `${insertString}${searchStr}`);
  fs.writeFileSync(vaniDataPath, data, 'utf-8');
  console.log('✅ Lulú chapters injected successfully!');
} else {
  console.log('❌ Could not find insertion point "sora_0": {');
}
