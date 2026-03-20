const { Lunar, Solar } = require('lunar-javascript');

const date = new Date();
const solar = Solar.fromDate(date);
const lunar = solar.getLunar();

console.log('Day GanZhi:', lunar.getDayInGanZhi());
console.log('Day Xun Kong:', lunar.getDayXunKong());
console.log('Time GanZhi:', lunar.getTimeInGanZhi());
console.log('Time Xun Kong:', lunar.getTimeXunKong());

// Check for Yi Ma? Usually not direct.
// Logic:
// Shen Zi Chen -> Yin
// Yin Wu Xu -> Shen
// Hai Mao Wei -> Si
// Si You Chou -> Hai
