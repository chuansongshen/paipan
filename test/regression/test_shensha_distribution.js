import { getDaLiuRenPaiPan } from '../../src/utils/daliuren.js';

console.log('Testing Shen Sha Distribution...');

const date = new Date('2025-11-29T15:56:00');
const result = getDaLiuRenPaiPan(date, 1999, '男');

if (result.shenShaDistribution) {
  console.log('Shen Sha Distribution found!');
  console.log(JSON.stringify(result.shenShaDistribution, null, 2));
  
  // Basic validation
  const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const missing = branches.filter(b => !result.shenShaDistribution[b]);
  
  if (missing.length === 0) {
    console.log('All 12 branches are present.');
  } else {
    console.error('Missing branches:', missing);
  }
} else {
  console.error('Shen Sha Distribution NOT found in result!');
}
