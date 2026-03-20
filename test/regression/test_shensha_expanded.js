import { getBaZiPaiPan } from '../../src/utils/bazi.js';

// Test date: 2023-11-20 10:00 (Gui Mao Year, Gui Hai Month, Geng Yin Day, Xin Si Hour)
// Geng Yin Day:
// - Yi Ma (Tiger day -> Monkey? No, Shen-Zi-Chen -> Yin. Yin-Wu-Xu -> Shen. Hai-Mao-Wei -> Si. Si-You-Chou -> Hai.)
//   Wait, Yi Ma map in code:
//   Shen-Zi-Chen -> Yin
//   Yin-Wu-Xu -> Shen
//   Hai-Mao-Wei -> Si
//   Si-You-Chou -> Hai
//
// Let's just run and see the output for a few dates to verify coverage.

const testDate = new Date('2023-11-20T10:00:00');
const result = getBaZiPaiPan(testDate, 2023, '男');

console.log('Ba Zi:', result.八字);
console.log('Day Master:', result.日主);

['年柱', '月柱', '日柱', '时柱'].forEach(pillar => {
  console.log(`\n${pillar} (${result[pillar].干支}):`);
  console.log('Shen Sha:', result[pillar].神煞.join(', '));
});
