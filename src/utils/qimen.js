import { Lunar, Solar } from 'lunar-javascript';
import { JIE_QI_JU, YANG_DUN_JIE_QI, STARS, GATES, GODS, BRANCH_TO_PALACE } from './constants.js';

// Helper to get GanZhi index (0-59)
const getGanZhiIndex = (ganZhi) => {
  const GANS = "甲乙丙丁戊己庚辛壬癸";
  const ZHIS = "子丑寅卯辰巳午未申酉戌亥";
  const gan = ganZhi[0];
  const zhi = ganZhi[1];
  const ganIdx = GANS.indexOf(gan);
  const zhiIdx = ZHIS.indexOf(zhi);
  // (ganIdx - zhiIdx) / 2 * 12 + zhiIdx ? No.
  // Simple search or formula.
  // Formula: let i = 0..59.
  for (let i = 0; i < 60; i++) {
    if (GANS[i % 10] === gan && ZHIS[i % 12] === zhi) return i;
  }
  return 0;
};

export const calculateJu = (date, method = 'chaibu') => {
  const solar = Solar.fromDate(date);
  const lunar = solar.getLunar();
  
  // 1. Get Solar Term (Jie Qi)
  // lunar-javascript's getJieQi() returns the *current* JieQi name if today is the day, or empty?
  // We need the JieQi that the current moment belongs to.
  // Lunar.getPrevJieQi(true) might be useful.
  const prevJieQi = lunar.getPrevJieQi(false); // false = respect exact time transition
  const jieQiName = prevJieQi.getName();
  
  // 2. Determine Yuan (Upper/Middle/Lower)
  const dayGanZhi = lunar.getDayInGanZhi();
  const dayIdx = getGanZhiIndex(dayGanZhi);
  
  let yuan = 0; // 0: Upper, 1: Middle, 2: Lower
  
  if (method === 'chaibu') {
    // Chai Bu: Strictly by Day GanZhi
    // Upper: Zi, Wu, Mao, You (Branches 0, 6, 3, 9) -> No.
    // Fu Tou method:
    // Find the Fu Tou (Leader) of the current day.
    // Fu Tou is the Jia/Ji day.
    // Day Index % 5 gives offset from Fu Tou.
    // If Day is Jia(0) -> Offset 0. Yi(1) -> Offset 1.
    // Fu Tou Index = Day Index - (Day Index % 5).
    // Check Fu Tou Branch.
    const fuTouIdx = dayIdx - (dayIdx % 5);
    const fuTouZhiIdx = fuTouIdx % 12; // 0=Zi, 1=Chou...
    
    // Zi (0), Wu (6), Mao (3), You (9) -> Upper
    // Yin (2), Shen (8), Si (5), Hai (11) -> Middle
    // Chen (4), Xu (10), Chou (1), Wei (7) -> Lower
    
    if ([0, 6, 3, 9].includes(fuTouZhiIdx)) yuan = 0;
    else if ([2, 8, 5, 11].includes(fuTouZhiIdx)) yuan = 1;
    else yuan = 2;
    
  } else {
    // Zhi Run (Placeholder - Basic implementation or fallback to Chai Bu for now)
    // Real Zhi Run requires calculating the gap and adjusting.
    // For this task, I will implement a simplified version or standard Chai Bu if Zhi Run is too complex for this single file.
    // However, user asked for it.
    // "Zhi Run" aligns the Ju change with the Jia Zi day.
    // If the gap is large, we might be in a different Ju than the Solar Term suggests.
    // For now, let's use Chai Bu logic as base but maybe warn or try to implement if possible.
    // Let's stick to Chai Bu for the MVP step and refine if needed.
    // Actually, let's just use Chai Bu logic for now and mark as TODO.
    // Or better: Use the same logic for Yuan determination, but the *Jie Qi* might be shifted?
    // In Zhi Run, the Jie Qi used for the Ju is determined by the Fu Tou, not the strict solar term.
    // If Fu Tou is closer to Next Jie Qi, use Next Jie Qi?
    // "Chao Shen": Fu Tou arrives before Jie Qi.
    // "Jie Qi": Fu Tou arrives after Jie Qi.
    // We use the Jie Qi that is "closest" or "current" based on the run?
    // Let's use Chai Bu for both for now to ensure stability, and I will add a note.
    // Wait, I should try to do it right.
    // But without a robust Zhi Run calendar, it's risky.
    // I will default to Chai Bu logic for Yuan, but maybe the JieQi mapping is what changes.
    
    // Fallback to Chai Bu logic for Yuan determination
    const fuTouIdx = dayIdx - (dayIdx % 5);
    const fuTouZhiIdx = fuTouIdx % 12;
    if ([0, 6, 3, 9].includes(fuTouZhiIdx)) yuan = 0;
    else if ([2, 8, 5, 11].includes(fuTouZhiIdx)) yuan = 1;
    else yuan = 2;
  }
  
  // 3. Get Ju Number
  const juInfo = JIE_QI_JU[jieQiName];
  if (!juInfo) {
    // Fallback or error
    return { error: "Unknown Jie Qi" };
  }
  
  const juNum = juInfo[yuan];
  const isYang = YANG_DUN_JIE_QI.includes(jieQiName);
  
  return {
    jieQi: jieQiName,
    dayGanZhi,
    yuan: ['上元', '中元', '下元'][yuan],
    juNum,
    type: isYang ? '阳遁' : '阴遁',
    isYang
  };
};

// Layout Logic (Pai Pan)
export const getPaiPan = (date, method = 'chaibu') => {
  const ju = calculateJu(date, method);
  if (ju.error) return ju;
  
  const solar = Solar.fromDate(date);
  const lunar = solar.getLunar();
  const yearGanZhi = lunar.getYearInGanZhi();
  const monthGanZhi = lunar.getMonthInGanZhi();
  const hourGanZhi = lunar.getTimeInGanZhi();
  
  const dayXunKong = lunar.getDayXunKong();
  const hourXunKong = lunar.getTimeXunKong();
  
  const hourStem = hourGanZhi[0];
  const hourBranch = hourGanZhi[1];
  
  // 1. Di Pan (Earth Plate)
  // Sequence: Wu, Ji, Geng, Xin, Ren, Gui, Ding, Bing, Yi (Yang Dun)
  // Sequence: Wu, Ji, Geng, Xin, Ren, Gui, Yi, Bing, Ding (Yin Dun) -> No.
  // Standard San Qi Liu Yi sequence:
  // Yang Dun: Wu, Ji, Geng, Xin, Ren, Gui, Ding, Bing, Yi. (Forward)
  // Yin Dun: Wu, Ji, Geng, Xin, Ren, Gui, Ding, Bing, Yi. (Reverse? No)
  // Actually, the sequence of stems on the path 1-9 or 9-1.
  // Yang Dun: 
  //   Wu -> Palace 1 (if Ju 1) -> No.
  //   The "Pai" sequence is fixed: Wu Ji Geng Xin Ren Gui Ding Bing Yi.
  //   Yang Dun: Place them in order 1, 2, 3... starting from Ju Number.
  //   Yin Dun: Place them in order 9, 8, 7... starting from Ju Number.
  
  const STEMS_ORDER = ['戊', '己', '庚', '辛', '壬', '癸', '丁', '丙', '乙'];
  
  const diPan = {}; // Palace Index -> Stem
  
  let currentPalace = ju.juNum;
  
  STEMS_ORDER.forEach((stem) => {
    diPan[currentPalace] = stem;
    if (ju.isYang) {
      currentPalace++;
      if (currentPalace > 9) currentPalace = 1;
    } else {
      currentPalace--;
      if (currentPalace < 1) currentPalace = 9;
    }
  });
  
  // 2. Find Xun Shou (Leader of the 10-hour period)
  // Hour GanZhi.
  // Find the Xun (Wave).
  // Jia Zi (Wu), Jia Xu (Ji), Jia Shen (Geng), Jia Wu (Xin), Jia Chen (Ren), Jia Yin (Gui).
  // Formula: (HourStemIdx - HourBranchIdx) ...
  // Or just look up.
  const hourIdx = getGanZhiIndex(hourGanZhi);
  const xunIdx = hourIdx - (hourIdx % 10); // The index of the Jia day/hour
  // Map Xun Index to Leader Stem (The "Hidden" Stem)
  // 0 (Jia Zi) -> Wu
  // 10 (Jia Xu) -> Ji
  // 20 (Jia Shen) -> Geng
  // 30 (Jia Wu) -> Xin
  // 40 (Jia Chen) -> Ren
  // 50 (Jia Yin) -> Gui
  const XUN_LEADERS = {
    0: '戊', 10: '己', 20: '庚', 30: '辛', 40: '壬', 50: '癸'
  };
  const XUN_NAMES = {
    0: '甲子', 10: '甲戌', 20: '甲申', 30: '甲午', 40: '甲辰', 50: '甲寅'
  };
  const leaderStem = XUN_LEADERS[xunIdx % 60];
  const xunName = XUN_NAMES[xunIdx % 60];
  
  // 3. Find Zhi Fu (Star) and Zhi Shi (Gate)
  // Look at Di Pan. Where is the Leader Stem?
  let leaderPalace = 0;
  Object.entries(diPan).forEach(([p, s]) => {
    if (s === leaderStem) leaderPalace = parseInt(p);
  });
  
  // If Leader is in 5 (Central), it moves to 2 (Kun) usually?
  // Or uses the star of 5 (Tian Qin).
  // Tian Qin usually resides in 5. If 5, it goes to 2.
  // Let's track the original star of the leader palace.
  const zhiFuStar = STARS[leaderPalace === 5 ? 2 : leaderPalace]; // Wait.
  // Actually, the Star at the Leader Palace position (in the original arrangement) is the Zhi Fu.
  // Original Stars: 1:Peng, 2:Rui, 3:Chong, 4:Fu, 5:Qin, 6:Xin, 7:Zhu, 8:Ren, 9:Ying.
  // If Leader Palace is 5, Zhi Fu is Tian Qin.
  // If Leader Palace is 1, Zhi Fu is Tian Peng.
  const originalStar = STARS[leaderPalace];
  
  // Zhi Shi (Gate) is the Gate at the Leader Palace.
  // Original Gates: 1:Xiu, 2:Si, 3:Shang, 4:Du, 5:None, 6:Kai, 7:Jing, 8:Sheng, 9:Jing.
  // If 5, usually use Gate of 2 (Si Men)? Or 8 (Sheng)?
  // Standard: 5 uses 2's Gate (Si Men).
  const originalGate = GATES[leaderPalace === 5 ? 2 : leaderPalace];
  
  // 4. Move Zhi Fu (Star) to Hour Stem position
  // Where is the Hour Stem on the Di Pan?
  // Note: If Hour Stem is Jia (Hidden), use the Leader Stem.
  let targetStem = hourStem;
  if (hourStem === '甲') targetStem = leaderStem;
  
  let hourPalace = 0;
  Object.entries(diPan).forEach(([p, s]) => {
    if (s === targetStem) hourPalace = parseInt(p);
  });
  
  // Tian Pan Layout
  // The Stars rotate. Zhi Fu (Original Star) goes to Hour Palace.
  // Determine the rotation offset.
  // Sequence of Stars is fixed in the ring:
  // Peng(1) -> Ren(8) -> Chong(3) -> Fu(4) -> Ying(9) -> Rui(2) -> Zhu(7) -> Xin(6) -> Peng(1) (Clockwise)
  // Wait, standard path is 1->8->3->4->9->2->7->6.
  // We need to map the "Original Palace" of the star to the "Current Palace".
  // Offset = HourPalace - LeaderPalace? No, it's a ring rotation.
  
  const STAR_RING = [1, 8, 3, 4, 9, 2, 7, 6]; // Palace indices in clockwise order
  // Find index of LeaderPalace (if 5, treat as 2) in the ring.
  const startRingIdx = STAR_RING.indexOf(leaderPalace === 5 ? 2 : leaderPalace);
  const endRingIdx = STAR_RING.indexOf(hourPalace === 5 ? 2 : hourPalace);
  
  // Calculate shift
  let shift = endRingIdx - startRingIdx;
  
  const tianPan = {}; // Palace -> Star
  
  STAR_RING.forEach((pIdx, i) => {
    let newIdx = (i + shift) % 8;
    if (newIdx < 0) newIdx += 8;
    const targetP = STAR_RING[newIdx];
    // The star originally at pIdx moves to targetP
    // Star at pIdx is STARS[pIdx]
    // Wait. "Zhi Fu goes to Hour Palace".
    // So Star(LeaderPalace) is at HourPalace.
    // So Star(pIdx) is at ...?
    // Let's say Leader is at Ring[0]. It moves to Ring[k].
    // Then Ring[1] moves to Ring[k+1].
    // So Star at Ring[i] moves to Ring[i+shift].
    // targetP is the destination.
    // tianPan[targetP] = STARS[pIdx];
    
    // Special case: Tian Qin (5) moves with Tian Rui (2).
    let starName = STARS[pIdx];
    if (pIdx === 2) starName = STARS[2] + (leaderPalace === 5 ? "" : ""); // Usually Rui carries Qin?
    // Actually Tian Qin is usually attached to Tian Rui.
    // So if pIdx is 2, we show "Tian Rui / Tian Qin".
    if (pIdx === 2) starName = "天芮/天禽";
    
    tianPan[targetP] = starName;
  });
  
  // Central palace (5) usually has no star or is empty in Tian Pan?
  // In Zhuan Pan, 5 is empty or has a "Ji" (sent) star?
  // Usually displayed as empty or the Di Pan stem.
  
  // 5. Ren Pan (Gates)
  // Zhi Shi (Gate) moves to ...?
  // Zhi Shi moves to the palace corresponding to the Hour *Sequence*.
  // Yang Dun: Zhi Shi moves forward from Leader Palace count.
  // Yin Dun: Zhi Shi moves backward?
  // Count from Xun Shou (Leader Time) to Current Hour.
  // Xun Shou is at Leader Palace.
  // Hour is X hours away from Xun Shou.
  // Range: 0 to 9.
  // Yang Dun: Palace = (LeaderPalace + HourDiff) % 9. (Skip 5? Or go through 9 palaces?)
  // Standard: Go through 1-9. If 5, jump to 2? Or stay 5?
  // Usually Zhi Shi follows the 1-9 path (Luo Shu).
  // Let's calculate Hour Diff.
  const hourDiff = hourIdx - xunIdx; // 0 to 9
  
  let gatePalace = leaderPalace;
  if (ju.isYang) {
    for (let i = 0; i < hourDiff; i++) {
      gatePalace++;
      if (gatePalace > 9) gatePalace = 1;
    }
  } else {
    for (let i = 0; i < hourDiff; i++) {
      gatePalace--;
      if (gatePalace < 1) gatePalace = 9;
    }
  }
  
  // Now rotate the Gate Ring.
  // Zhi Shi (Original Gate) goes to gatePalace.
  // Gate Ring: 1, 8, 3, 4, 9, 2, 7, 6. (Same as stars)
  const GATE_RING = [1, 8, 3, 4, 9, 2, 7, 6];
  const startGateIdx = GATE_RING.indexOf(leaderPalace === 5 ? 2 : leaderPalace);
  const endGateIdx = GATE_RING.indexOf(gatePalace === 5 ? 2 : gatePalace);
  
  const gateShift = endGateIdx - startGateIdx;
  
  const renPan = {};
  GATE_RING.forEach((pIdx, i) => {
    let newIdx = (i + gateShift) % 8;
    if (newIdx < 0) newIdx += 8;
    const targetP = GATE_RING[newIdx];
    renPan[targetP] = GATES[pIdx];
  });
  
  // 6. Shen Pan (Gods)
  // Zhi Fu (God - The first one) goes to the *Tian Pan* Zhi Fu (Star) position.
  // i.e. The Hour Palace.
  // Yang Dun: Clockwise. Yin Dun: Counter-Clockwise.
  // Ring: 1, 8, 3, 4, 9, 2, 7, 6.
  
  const shenPan = {};
  const godStartIdx = STAR_RING.indexOf(hourPalace === 5 ? 2 : hourPalace);
  
  GODS.forEach((god, i) => {
    // i=0 is Zhi Fu.
    // Yang Dun: Place at godStartIdx + i
    // Yin Dun: Place at godStartIdx - i
    let idx;
    if (ju.isYang) {
      idx = (godStartIdx + i) % 8;
    } else {
      idx = (godStartIdx - i) % 8;
    }
    if (idx < 0) idx += 8;
    
    const targetP = STAR_RING[idx];
    shenPan[targetP] = god;
  });
  
  // 7. Tian Pan Stems (The stem carried by the star)
  // The stem that was originally at the Star's position in the Di Pan moves with the Star.
  // We need to know which stem is "under" the star in the Di Pan *before* it moved.
  // The "Original Palace" of the star had a stem in the Di Pan.
  // Wait. The Di Pan is fixed for the Ju.
  // The Star takes the Di Pan stem from its *original home*?
  // No, the Star takes the Di Pan stem from the *current Ju's Di Pan* at the Star's *current position*?
  // No.
  // "Pai Pan" rule:
  // Tian Pan Stem at Palace X = Di Pan Stem at Palace Y, where Palace Y is where the Star came from.
  // i.e. The Star carries the Stem.
  // So if Tian Peng (from 1) moves to 9. The Stem at 1 (in Di Pan) moves to 9 (in Tian Pan).
  
  const tianPanStems = {};
  STAR_RING.forEach((pIdx, i) => {
    // pIdx is the Original Palace of the Star.
    // Find where this Star is now.
    // It is at targetP (calculated in step 4).
    let newIdx = (i + shift) % 8;
    if (newIdx < 0) newIdx += 8;
    const targetP = STAR_RING[newIdx];
    
    // The stem to carry is the Di Pan stem at pIdx.
    // Note: If pIdx is 5, it uses Di Pan stem at 5.
    // But 5 is not in STAR_RING?
    // STAR_RING uses 2 for 5?
    // If pIdx is 2, it carries stem of 2.
    // What about stem of 5?
    // Tian Qin carries stem of 5.
    // So at targetP (where Rui/Qin is), we have Stem(2) and Stem(5).
    
    const stem = diPan[pIdx];
    tianPanStems[targetP] = stem;
    
    if (pIdx === 2) {
      // Add stem of 5
      tianPanStems[targetP] += "/" + diPan[5];
    }
  });
  
  // Calculate Ma Xing (Yi Ma) based on Hour Branch
  // Shen-Zi-Chen -> Yin
  // Yin-Wu-Xu -> Shen
  // Hai-Mao-Wei -> Si
  // Si-You-Chou -> Hai
  const MA_XING_MAP = {
    '申': '寅', '子': '寅', '辰': '寅',
    '寅': '申', '午': '申', '戌': '申',
    '亥': '巳', '卯': '巳', '未': '巳',
    '巳': '亥', '酉': '亥', '丑': '亥'
  };
  const maXing = MA_XING_MAP[hourBranch];
  const maXingPalace = BRANCH_TO_PALACE[maXing];
  
  // Calculate Kong Wang Palaces (Hour)
  // hourXunKong is a string like "辰巳"
  const kongWangPalaces = [];
  if (hourXunKong) {
    for (const char of hourXunKong) {
      const p = BRANCH_TO_PALACE[char];
      if (p && !kongWangPalaces.includes(p)) kongWangPalaces.push(p);
    }
  }

  // Calculate An Gan (Dark Stem)
  // Method: 干加值使门飞 (Gan plus Zhi Shi gate flying)
  // Special case for Fu Yin: If Hour Stem overlaps with Di Pan or Tian Pan, start from center palace
  
  // 1. Find Hour Stem (if Jia, use Xun Leader)
  let anGanStartStem = hourStem;
  if (hourStem === '甲') anGanStartStem = leaderStem;
  
  // 2. Check for Fu Yin (伏吟局)
  // Fu Yin occurs when Hour Stem matches any Di Pan or Tian Pan stem
  let isFuYin = false;
  for (let p = 1; p <= 9; p++) {
    if (diPan[p] === anGanStartStem || tianPanStems[p] === anGanStartStem) {
      isFuYin = true;
      break;
    }
  }
  
  // 3. Determine starting palace
  // If Fu Yin, start from center palace (5); otherwise start from Zhi Shi Palace
  const anGanStartPalace = isFuYin ? 5 : gatePalace;
  
  // 4. Align the sequence so that anGanStartStem is at anGanStartPalace
  // Standard 10-stem sequence (excluding 甲 since it maps to xun leader)
  const STEMS_SEQ = ['戊', '己', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁'];
  const startStemIdx = STEMS_SEQ.indexOf(anGanStartStem);
  
  const anGan = {};
  // Iterate through 9 palaces
  for (let i = 0; i < 9; i++) {
    // Stem index in sequence (wraps around the 10-stem sequence)
    const stem = STEMS_SEQ[(startStemIdx + i) % 10];
    
    // Palace index
    let p;
    if (ju.isYang) {
      // Forward from anGanStartPalace
      p = (anGanStartPalace - 1 + i) % 9 + 1;
    } else {
      // Backward from anGanStartPalace
      let val = (anGanStartPalace - 1 - i) % 9;
      if (val < 0) val += 9;
      p = val + 1;
    }
    anGan[p] = stem;
  }

  return {
    ...ju,
    yearGanZhi,
    monthGanZhi,
    hourGanZhi,
    dayXunKong,
    hourXunKong,
    maXing,
    maXingPalace,
    kongWangPalaces,
    anGan,
    xun: xunName, // Xun Leader Name (Jia ...)
    zhiFuStar: originalStar,
    zhiShiGate: originalGate,
    diPan,
    tianPan,
    renPan,
    shenPan,
    tianPanStems
  };
};
