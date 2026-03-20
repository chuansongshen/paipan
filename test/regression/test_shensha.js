import { Lunar } from 'lunar-javascript';

const date = new Date();
const lunar = Lunar.fromDate(date);
const eightChar = lunar.getEightChar();

console.log('Day Gan:', eightChar.getDayGan());
console.log('Day Zhi:', eightChar.getDayZhi());

// Check for built-in Shen Sha methods
const shenShaList = [
  'getYearShenSha', 'getMonthShenSha', 'getDayShenSha', 'getTimeShenSha',
  'getShenSha'
];

shenShaList.forEach(method => {
  if (typeof eightChar[method] === 'function') {
    console.log(`EightChar has method: ${method}`);
    console.log(eightChar[method]());
  } else if (typeof lunar[method] === 'function') {
    console.log(`Lunar has method: ${method}`);
    console.log(lunar[method]());
  } else {
    // console.log(`Method not found: ${method}`);
  }
});

// Check DaYun/Yun for Shen Sha
const yun = eightChar.getYun(1);
console.log('Yun created');
console.log('Yun start age:', yun.getStartYear?.());
