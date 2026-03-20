import { getPaiPan } from '../../src/utils/qimen.js';

console.log('Testing Qimen Logic...');

const date = new Date('2023-10-01T12:00:00'); // Use a fixed date
console.log('Date:', date.toISOString());

try {
  const result = getPaiPan(date, 'chaibu');
  if (result.error) {
    console.error('Error:', result.error);
  } else {
    console.log('JieQi:', result.jieQi);
    console.log('Ju:', result.type, result.juNum, 'Ju');
    console.log('Yuan:', result.yuan);
    console.log('Day GanZhi:', result.dayGanZhi);
    console.log('Hour GanZhi:', result.hourGanZhi);
    console.log('Xun Leader:', result.xun);
    console.log('Zhi Fu (Star):', result.zhiFuStar);
    console.log('Zhi Shi (Gate):', result.zhiShiGate);
    
    console.log('--- Di Pan ---');
    console.log(result.diPan);
    
    console.log('--- Tian Pan ---');
    console.log(result.tianPan);
    
    console.log('--- Ren Pan ---');
    console.log(result.renPan);
    
    console.log('--- Shen Pan ---');
    console.log(result.shenPan);
  }
} catch (e) {
  console.error('Exception:', e);
}

console.log('\nTesting Li Chun boundary pillars:');
const beforeLiChun = new Date('2026-02-04T00:00:00+08:00');
const afterLiChun = new Date('2026-02-04T06:00:00+08:00');
const beforeResult = getPaiPan(beforeLiChun, 'chaibu');
const afterResult = getPaiPan(afterLiChun, 'chaibu');
console.log('Before Li Chun year/month:', beforeResult.yearGanZhi, beforeResult.monthGanZhi, beforeResult.jieQi);
console.log('After  Li Chun year/month:', afterResult.yearGanZhi, afterResult.monthGanZhi, afterResult.jieQi);

console.log('\nTesting Chaibu vs Zhirun (same timestamp):');
const compareDate = new Date('2026-01-05T00:00:00+08:00');
const chaibu = getPaiPan(compareDate, 'chaibu');
const zhirun = getPaiPan(compareDate, 'zhirun');
console.log('Chaibu:', chaibu.jieQi, chaibu.juNum, chaibu.type);
console.log('Zhirun:', zhirun.jieQi, zhirun.juNum, zhirun.type);
