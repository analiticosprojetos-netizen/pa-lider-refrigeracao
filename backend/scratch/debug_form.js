const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../../src/components/OrderForm.vue');
let content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');

// Find ALL lines containing applyCase
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('applyCase') && lines[i].includes('item.description')) {
    console.log('Found at line', i+1, ':');
    for (let j = Math.max(0, i-8); j <= Math.min(lines.length-1, i+10); j++) {
      console.log(`${j+1}: |${lines[j]}|`);
    }
  }
}
