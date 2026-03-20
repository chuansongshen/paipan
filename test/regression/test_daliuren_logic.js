import { getDaLiuRenPaiPan } from '../../src/utils/daliuren.js';

try {
    const date = new Date();
    console.log("Testing date:", date);
    const data = getDaLiuRenPaiPan(date, 2000);
    console.log("Calculation successful!");
    console.log("Data keys:", Object.keys(data));
    console.log("San Chuan:", data.sanChuan);
    console.log("Tian Pan:", data.tianPan);
    console.log("Tian Jiang:", data.tianJiang);
} catch (e) {
    console.error("Calculation failed:");
    console.error(e);
}
