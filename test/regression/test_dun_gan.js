const GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

function getDunGan(dayGan, branch) {
  const map = {
    '甲': '甲', '己': '甲',
    '乙': '丙', '庚': '丙',
    '丙': '戊', '辛': '戊',
    '丁': '庚', '壬': '庚',
    '戊': '壬', '癸': '壬'
  };
  
  const startStem = map[dayGan];
  if (!startStem) return 'Error';
  
  const startIdx = GAN.indexOf(startStem);
  const branchIdx = ZHI.indexOf(branch); // Zi=0
  
  const stemIdx = (startIdx + branchIdx) % 10;
  return GAN[stemIdx];
}

// Test Cases
console.log("Testing Wu Zi Dun Logic:");
console.log("Jia Day, Zi Branch -> Expect Jia. Result:", getDunGan('甲', '子'));
console.log("Jia Day, Yin Branch -> Expect Bing. Result:", getDunGan('甲', '寅'));
console.log("Yi Day, Zi Branch -> Expect Bing. Result:", getDunGan('乙', '子'));
console.log("Yi Day, Chou Branch -> Expect Ding. Result:", getDunGan('乙', '丑'));
console.log("Bing Day, Zi Branch -> Expect Wu. Result:", getDunGan('丙', '子'));
console.log("Ding Day, Zi Branch -> Expect Geng. Result:", getDunGan('丁', '子'));
console.log("Wu Day, Zi Branch -> Expect Ren. Result:", getDunGan('戊', '子'));
console.log("Ji Day, Zi Branch -> Expect Jia. Result:", getDunGan('己', '子'));
console.log("Geng Day, Zi Branch -> Expect Bing. Result:", getDunGan('庚', '子'));
console.log("Xin Day, Zi Branch -> Expect Wu. Result:", getDunGan('辛', '子'));
console.log("Ren Day, Zi Branch -> Expect Geng. Result:", getDunGan('壬', '子'));
console.log("Gui Day, Zi Branch -> Expect Ren. Result:", getDunGan('癸', '子'));

// Test specific user case if possible?
// User didn't provide specific case, but said "San Chuan Stem is wrong".
// Maybe they mean the San Chuan calculation itself is wrong (the branches)?
// Or the Stem logic.
// If the branches are wrong, that's a different issue.
// But user said "San Chuan's Stem calculation is wrong".
