import { getBaZiPaiPan } from '../../src/utils/bazi.js';

const date = new Date('1999-01-16T02:00:00');
const result = getBaZiPaiPan(date, 1999, '男');

console.log('Basic Info:');
console.log('Gender:', result.性别);
console.log('Solar:', result.阳历);
console.log('Lunar:', result.农历);
console.log('Ba Zi:', result.八字);

['年柱', '月柱', '日柱', '时柱'].forEach(p => {
  const pillar = result[p];
  console.log(`\n${p}: ${pillar.干支}`);
  console.log('Na Yin:', pillar.纳音);
  console.log('Shen Sha:', pillar.神煞.join(', '));
  // Missing: Xun, Kong Wang, Star Luck, Self-Sitting
});

console.log('\nSpecial Info:');
console.log('Tai Yuan:', result.胎元);
console.log('Tai Xi:', result.胎息);
console.log('Ming Gong:', result.命宫);
console.log('Shen Gong:', result.身宫);
// Missing: Tai Xi

console.log('\nInteractions:', result.刑冲合会);
