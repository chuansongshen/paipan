import { getBaZiPaiPan } from '../../src/utils/bazi.js';
import { Lunar } from 'lunar-javascript';

const date = new Date('1999-01-16T02:00:00');
const lunar = Lunar.fromDate(date);
const eightChar = lunar.getEightChar();
const yun = eightChar.getYun(1); // Male
const daYunList = yun.getDaYun();

console.log('Start Age:', yun.getStartYear());
console.log('Total Da Yun items:', daYunList.length);
daYunList.slice(0, 12).forEach((dy, i) => {
  console.log(`Raw Index ${i}: GanZhi="${dy.getGanZhi()}"`);
});

console.log('\n--- Processed Result ---');
const result = getBaZiPaiPan(date, 1999, '男');
result.大运.大运.forEach((dy, i) => {
  console.log(`Index ${i}: GanZhi=${dy.干支}, StartYear=${dy.开始年份}, StartAge=${dy.开始年龄}`);
});
