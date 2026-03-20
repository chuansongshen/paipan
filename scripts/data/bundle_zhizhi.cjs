const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '..', '..', 'public', 'zhizhi');
const outputFile = path.join(__dirname, '..', '..', 'src', 'utils', 'zhizhi_data.js');

console.log('Bundling Zhi Zhi files...');

const files = fs.readdirSync(sourceDir).filter(f => f.startsWith('liurenzhizhi_') && f.endsWith('.txt'));

// Sort files numerically
files.sort((a, b) => {
  const idxA = parseInt(a.match(/liurenzhizhi_(\d+)\.txt/)[1]);
  const idxB = parseInt(b.match(/liurenzhizhi_(\d+)\.txt/)[1]);
  return idxA - idxB;
});

const data = [];

// We need to ensure the array index corresponds to the file index.
// The file indices are 1-based (1 to 720).
// So we'll put null at index 0, or just adjust the lookup logic.
// Let's put null at index 0 to make lookup easier (index 1 -> data[1]).
data.push(null); 

for (const file of files) {
  const filePath = path.join(sourceDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  // Normalize line endings
  content = content.replace(/\r\n/g, '\n');
  data.push(content);
}

const outputContent = `// Auto-generated file. Do not edit manually.
// Contains 720 Da Liu Ren Zhi Zhi entries.

export const ZHI_ZHI_DATA = ${JSON.stringify(data, null, 2)};
`;

fs.writeFileSync(outputFile, outputContent);

console.log(`Successfully bundled ${files.length} files into ${outputFile}`);
