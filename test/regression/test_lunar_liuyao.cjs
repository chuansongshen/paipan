const { Lunar, EightChar, Gua64 } = require('lunar-javascript');

console.log('Checking lunar-javascript capabilities...');

try {
  // Check if Gua64 exists or similar
  // Note: lunar-javascript might use different class names. 
  // Common ones: FuXi64, IChing, etc.
  // Let's try to find 64 Gua support.
  
  // Actually, let's just print available exports if possible or try standard ones
  // Since I can't inspect the module easily, I'll try to use the library's features 
  // based on common usage patterns or just check if I can get a Hexagram.
  
  // If I can't find it, I'll have to implement the data myself.
  
  // Let's try to see if we can get a Gua by name or index
  // Assuming 'lunar-javascript' might not have full Liu Yao Pai Pan (Najia), 
  // but might have Hexagram data.
  
  console.log('Lunar:', Lunar);
} catch (e) {
  console.error(e);
}
