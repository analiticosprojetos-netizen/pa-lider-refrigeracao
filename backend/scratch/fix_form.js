const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../../src/components/OrderForm.vue');
let content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

// Find and replace the service description block (lines 449-464, 0-indexed: 448-463)
// Look for the specific div.relative that wraps the service input
let serviceStart = -1;
let serviceEnd = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === '<div class="relative flex items-center">') {
    // Check if next lines contain item.description with applyCase
    if (i + 3 < lines.length && lines[i+3].includes('applyCase(item.description')) {
      serviceStart = i;
      // Find the closing </div>
      for (let j = i + 1; j < Math.min(i + 20, lines.length); j++) {
        if (lines[j].trim() === '</div>') {
          serviceEnd = j;
          break;
        }
      }
      break;
    }
  }
}

console.log('Service block: lines', serviceStart+1, 'to', serviceEnd+1);

if (serviceStart !== -1 && serviceEnd !== -1) {
  // Determine indentation from the div line
  const indentMatch = lines[serviceStart].match(/^(\s*)/);
  const indent = indentMatch ? indentMatch[1] : '                 ';
  
  const newLines = [
    `${indent}<input`,
    `${indent}   v-model="item.description"`,
    `${indent}   placeholder="Ex: Carga de Gás"`,
    `${indent}   class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 outline-none focus:border-blue-500 font-bold text-sm dark:text-white transition-all shadow-sm"`,
    `${indent}   spellcheck="true" lang="pt-BR"`,
    `${indent}/>`
  ];
  
  lines.splice(serviceStart, serviceEnd - serviceStart + 1, ...newLines);
  console.log('✅ Service description field fixed!');
} else {
  console.log('❌ Could not find service block');
}

// Now fix part description block too (if still has applyCase)
const updatedContent = lines.join('\n');
const lines2 = updatedContent.split('\n');

let partStart = -1;
let partEnd = -1;

for (let i = 0; i < lines2.length; i++) {
  if (lines2[i].trim() === '<div class="relative flex items-center">') {
    if (i + 3 < lines2.length && lines2[i+3] && lines2[i+3].includes('applyCase(part.description')) {
      partStart = i;
      for (let j = i + 1; j < Math.min(i + 20, lines2.length); j++) {
        if (lines2[j].trim() === '</div>') {
          partEnd = j;
          break;
        }
      }
      break;
    }
  }
}

console.log('Part block: lines', partStart !== -1 ? partStart+1 : 'not found', 'to', partEnd !== -1 ? partEnd+1 : 'not found');

if (partStart !== -1 && partEnd !== -1) {
  const indentMatch = lines2[partStart].match(/^(\s*)/);
  const indent = indentMatch ? indentMatch[1] : '                  ';
  
  const newLines = [
    `${indent}<input`,
    `${indent}   v-model="part.description"`,
    `${indent}   placeholder="Descrição da Peça"`,
    `${indent}   class="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 outline-none focus:border-blue-500 font-bold text-sm dark:text-white shadow-sm transition-all"`,
    `${indent}   spellcheck="true" lang="pt-BR"`,
    `${indent}/>`
  ];
  
  lines2.splice(partStart, partEnd - partStart + 1, ...newLines);
  console.log('✅ Part description field fixed!');
} else {
  // Check if already fixed
  const hasPart = lines2.some(l => l.includes('applyCase(part.description'));
  if (!hasPart) {
    console.log('ℹ️ Part block already clean (no applyCase found)');
  }
}

fs.writeFileSync(filePath, lines2.join('\n'));
console.log('✅ File saved.');
