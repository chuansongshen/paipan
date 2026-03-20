const { Lunar, Solar, Qimen } = require('lunar-javascript');

console.log('Testing Lunar Javascript for Qimen');

const date = new Date();
const solar = Solar.fromDate(date);
const lunar = solar.getLunar();

console.log('Date:', date.toISOString());
console.log('Solar Term:', lunar.getJieQi());
console.log('GanZhi Day:', lunar.getDayInGanZhi());

// Check if Qimen class exists and what methods it has
try {
    // Note: usage might vary, checking if there is a Qimen class exposed directly or via Lunar
    // In some versions it is separate.
    // Let's try to instantiate or find documentation-like usage.
    // Usually it's not directly in the main package export in some versions, but let's see.
    
    // If Qimen is not exported, we might need to rely on manual calculation using Lunar/Solar helpers.
    if (typeof Qimen !== 'undefined') {
        console.log('Qimen class found');
    } else {
        console.log('Qimen class NOT found in main export');
    }
} catch (e) {
    console.log('Error checking Qimen:', e.message);
}
