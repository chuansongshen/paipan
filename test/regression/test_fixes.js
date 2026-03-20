import { getDaLiuRenPaiPan } from '../../src/utils/daliuren.js';

console.log('Testing Zhi Zhi Lookup and Shen Sha Text...\n');

const date = new Date('2025-11-29T15:56:00');
const result = getDaLiuRenPaiPan(date, 2000, '男');

// Test 1: Zhi Zhi Lookup
console.log('=== Test 1: Zhi Zhi Lookup ===');
console.log('Day Pillar:', result.ganZhi.day);
console.log('First Ke Zhi:', result.siKe.first.zhi);
console.log('Zhi Zhi preview (first 100 chars):', result.zhiZhi.substring(0, 100));

// Check if it contains "干上"
const ganShangMatch = result.zhiZhi.match(/干上(.)/);
if (ganShangMatch) {
  console.log('✓ Zhi Zhi contains "干上":', ganShangMatch[1]);
  console.log('✓ Should match First Ke Zhi:', result.siKe.first.zhi);
  console.log('✓ Match correct:', ganShangMatch[1] === result.siKe.first.zhi);
} else {
  console.log('✗ Zhi Zhi does not contain "干上"');
}

// Test 2: Shen Sha Text
console.log('\n=== Test 2: Shen Sha Text ===');
if (result.shenShaText) {
  console.log('✓ Shen Sha Text generated');
  console.log('Preview (first 500 chars):');
  console.log(result.shenShaText.substring(0, 500));
} else {
  console.log('✗ Shen Sha Text NOT found');
}
