import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bibiData from './bibi_full_data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const vaniDataPath = path.join(__dirname, '../src/data/vaniData.js');

let vaniDataContent = fs.readFileSync(vaniDataPath, 'utf8');

// Find the last closing brace of the capitulos object.
// It ends with:
//         }
//       ]
//     }
//   }
// };

// Find the position of the end of the capitulos object
const capitulosEndIndex = vaniDataContent.lastIndexOf('  }\n};');
if (capitulosEndIndex === -1) {
  console.error("Could not find the end of capitulos object");
  process.exit(1);
}

// Convert bibiData object to formatted string, removing the outer brackets
let bibiString = JSON.stringify(bibiData, null, 2);
bibiString = bibiString.substring(1, bibiString.length - 1).trim(); // remove { and }

// Insert the bibi string with a comma
const newContent = vaniDataContent.substring(0, capitulosEndIndex) +
  ',\n  ' + bibiString + '\n' +
  vaniDataContent.substring(capitulosEndIndex);

fs.writeFileSync(vaniDataPath, newContent, 'utf8');
console.log("Successfully injected Bibi chapters into vaniData.js");
