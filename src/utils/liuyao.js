import { Lunar } from 'lunar-javascript';
import { TRIGRAMS, HEXAGRAM_NAMES, NAJIA_STEMS, NAJIA_BRANCHES, ZHI_WUXING, HEXAGRAM_DATA } from './liuyao_data.js';

// Constants
const GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const WUXING_RELATION = {
  '生我': '父母',
  '我生': '子孙',
  '克我': '官鬼',
  '我克': '妻财',
  '同我': '兄弟'
};

// Helper to get index
const getZhiIdx = (z) => ZHI.indexOf(z);

// Calculate Hexagram based on Time (Zheng Shi) or Manual Input
// manualYao: array of 6 numbers [1-6]: 9=老阳, 7=少阳, 6=老阴, 8=少阴 (from bottom to top)
export function getLiuYaoPaiPan(date, birthYear = 2000, manualYao = null, gender = '男') {
  const lunar = Lunar.fromDate(date);
  
  let upIdx, downIdx, movingYao, benGua, bianGua;
  let movingYaos = [];
  
  if (manualYao && manualYao.length === 6) {
    // Manual input mode
    // Convert manual yao to hexagram
    // 9=老阳(moving yang), 7=少阳(yang), 6=老阴(moving yin), 8=少阴(yin)
    const isValidManual = manualYao.every(y => [6, 7, 8, 9].includes(y));
    if (!isValidManual) {
      throw new Error('manualYao 包含非法值，必须为 6/7/8/9');
    }

    const lines = manualYao.map(y => (y === 9 || y === 7) ? 1 : 0); // 1=Yang, 0=Yin
    const movingLines = manualYao.map((y, idx) => (y === 9 || y === 6) ? idx + 1 : 0).filter(x => x > 0);
    movingYaos = movingLines;
    
    // Find matching trigrams
    const lowerLines = lines.slice(0, 3);
    const upperLines = lines.slice(3, 6);
    
    const findTrigramIdx = (triLines) => {
      return TRIGRAMS.findIndex(t => 
        t.lines[0] === triLines[0] && t.lines[1] === triLines[1] && t.lines[2] === triLines[2]
      );
    };
    
    downIdx = findTrigramIdx(lowerLines);
    upIdx = findTrigramIdx(upperLines);
    
    // 兼容旧字段：movingYao 仍保留首个动爻
    movingYao = movingLines.length > 0 ? movingLines[0] : 0;
    
    benGua = getHexagramData(upIdx, downIdx);
    
    if (movingLines.length > 0) {
      bianGua = getChangedHexagram(benGua, movingLines);
    } else {
      bianGua = null;
    }
  } else {
    // Time-based mode (original logic)
    const yearZhi = lunar.getYearZhi();
    const month = lunar.getMonth(); // Lunar Month (1-12)
    const day = lunar.getDay(); // Lunar Day (1-30)
    const hourZhi = lunar.getTimeZhi();
    
    const yearZhiIdx = getZhiIdx(yearZhi) + 1; // 1-12
    const hourZhiIdx = getZhiIdx(hourZhi) + 1; // 1-12
    
    // Upper Gua = (YearZhi + Month + Day) % 8
    upIdx = (yearZhiIdx + month + day) % 8;
    if (upIdx === 0) upIdx = 8;
    upIdx -= 1; // 0-7
    
    // Lower Gua = (YearZhi + Month + Day + HourZhi) % 8
    downIdx = (yearZhiIdx + month + day + hourZhiIdx) % 8;
    if (downIdx === 0) downIdx = 8;
    downIdx -= 1; // 0-7
    
    // Moving Yao = (YearZhi + Month + Day + HourZhi) % 6
    movingYao = (yearZhiIdx + month + day + hourZhiIdx) % 6;
    if (movingYao === 0) movingYao = 6;
    movingYaos = [movingYao];
    
    // Construct Hexagram Data
    benGua = getHexagramData(upIdx, downIdx);
    bianGua = getChangedHexagram(benGua, movingYao);
  }
  
  // Calculate Shen Sha
  const dayGan = lunar.getDayGan();
  const dayZhi = lunar.getDayZhi();
  const monthZhi = lunar.getMonthZhi();
  const shenSha = getLiuYaoShenSha(dayGan, dayZhi, monthZhi);
  
  // Calculate Void (Kong Wang)
  const dayGanZhi = lunar.getDayInGanZhi();
  const hourGanZhi = lunar.getTimeInGanZhi();
  const dayXunKong = getKongWang(dayGanZhi);
  const hourXunKong = getKongWang(hourGanZhi);
  
  // Calculate Ben Ming (Birth Year Gan Zhi)
  // Assuming birthYear is a number like 1987
  // 1984 is Jia Zi. (1987 - 1984) % 60 = 3 -> Ding Mao
  const baseYear = 1984;
  const offset = (birthYear - baseYear) % 60;
  const ganIdx = (0 + offset) % 10; // Jia is 0
  const zhiIdx = (0 + offset) % 12; // Zi is 0
  // Fix negative offset if birthYear < 1984
  const fixedGanIdx = (ganIdx + 10) % 10;
  const fixedZhiIdx = (zhiIdx + 12) % 12;
  const benMing = GAN[fixedGanIdx] + ZHI[fixedZhiIdx];
  
  // Calculate Xing Nian (Current Age Year)
  // Male: Start from Bing Yin (3). Clockwise.
  // Female: Start from Ren Shen (9). Counter-Clockwise.
  const currentYear = date.getFullYear();
  const age = currentYear - birthYear + 1;
  let xingNian = '';
  if (age >= 1) {
    let xGanIdx, xZhiIdx;
    if (gender === '男') {
      xGanIdx = (2 + (age - 1)) % 10; // Bing (2)
      xZhiIdx = (2 + (age - 1)) % 12; // Yin (2)
    } else {
      let gVal = (8 - (age - 1)) % 10; // Ren (8)
      if (gVal < 0) gVal += 10;
      xGanIdx = gVal;
      let zVal = (8 - (age - 1)) % 12; // Shen (8)
      if (zVal < 0) zVal += 12;
      xZhiIdx = zVal;
    }
    xingNian = GAN[xGanIdx] + ZHI[xZhiIdx];
  }
  
  return {
    dateStr: date.toLocaleString(),
    lunarStr: lunar.toString(),
    ganZhi: {
      year: lunar.getYearInGanZhiExact(),
      month: lunar.getMonthInGanZhiExact(),
      day: lunar.getDayInGanZhiExact(),
      hour: lunar.getTimeInGanZhi()
    },
    benGua,
    bianGua,
    movingYao,
    movingYaos,
    shenSha,
    birthYear,
    benMing,
    xingNian,
    dayXunKong,
    hourXunKong,
    isManual: manualYao !== null
  };
}

function getHexagramData(upIdx, downIdx) {
  const name = HEXAGRAM_NAMES[upIdx][downIdx];
  const upTrigram = TRIGRAMS[upIdx];
  const downTrigram = TRIGRAMS[downIdx];
  
  // Construct 6 lines (bottom to top)
  // Lower Trigram lines (0, 1, 2) + Upper Trigram lines (0, 1, 2)
  const lines = [...downTrigram.lines, ...upTrigram.lines];
  
  // Get Yao Ci from HEXAGRAM_DATA
  const key = `${upIdx}-${downIdx}`;
  const hexagramInfo = HEXAGRAM_DATA[key];
  const yaoCi = hexagramInfo ? hexagramInfo.yaoCi : [
    '爻辞数据暂缺',
    '爻辞数据暂缺',
    '爻辞数据暂缺',
    '爻辞数据暂缺',
    '爻辞数据暂缺',
    '爻辞数据暂缺'
  ];
  
  // Najia (Assign Stem/Branch/Element/Relation)
  const yaoData = [];
  
  // Lower Trigram Najia
  const lowerStem = NAJIA_STEMS[downIdx].inner;
  const lowerBranches = NAJIA_BRANCHES[downIdx].inner;
  
  // Upper Trigram Najia
  const upperStem = NAJIA_STEMS[upIdx].outer;
  const upperBranches = NAJIA_BRANCHES[upIdx].outer;
  
  // Combine
  const stems = [lowerStem, lowerStem, lowerStem, upperStem, upperStem, upperStem];
  const branches = [...lowerBranches, ...upperBranches];
  
  // Determine Hexagram Element (Gua Gong)
  // This is complex. For simplicity, use the Upper Trigram's element for now?
  // No, standard method is based on "Ba Gong" (Eight Palaces).
  // We need to find which Palace this hexagram belongs to.
  // For MVP, let's skip complex Ba Gong logic and just show Stems/Branches.
  // Or implement a simple lookup if needed.
  
  // Let's implement Ba Gong lookup later. For now, just Stems/Branches.
  
  for (let i = 0; i < 6; i++) {
    yaoData.push({
      position: i + 1,
      yinYang: lines[i], // 0: Yin, 1: Yang
      stem: stems[i],
      branch: branches[i],
      wuxing: ZHI_WUXING[branches[i]],
      yaoCi: yaoCi[i] // Add Yao Ci for each line
    });
  }
  
  return {
    name,
    upIdx,
    downIdx,
    lines,
    yaoData,
    yaoCi // Include full yaoCi array
  };
}

function getChangedHexagram(benGua, movingYao) {
  // movingYao 支持单值或数组（1-6）
  const movingList = Array.isArray(movingYao) ? movingYao : [movingYao];
  const validMovingList = [...new Set(movingList.filter(v => Number.isInteger(v) && v >= 1 && v <= 6))];
  const newLines = [...benGua.lines];
  validMovingList.forEach((lineNo) => {
    const idx = lineNo - 1;
    newLines[idx] = newLines[idx] === 1 ? 0 : 1;
  });
  
  // We need to find the new Upper/Lower indices based on lines
  // Lines 0-2 = Lower, 3-5 = Upper
  const lowerLines = newLines.slice(0, 3);
  const upperLines = newLines.slice(3, 6);
  
  const findTrigramIdx = (lines) => {
    return TRIGRAMS.findIndex(t => 
      t.lines[0] === lines[0] && t.lines[1] === lines[1] && t.lines[2] === lines[2]
    );
  };
  
  const newDownIdx = findTrigramIdx(lowerLines);
  const newUpIdx = findTrigramIdx(upperLines);
  
  return getHexagramData(newUpIdx, newDownIdx);
}

// Helper to get Season (Spring, Summer, Autumn, Winter)
function getSeason(monthZhi) {
  const seasons = {
    '寅': 'Spring', '卯': 'Spring', '辰': 'Spring',
    '巳': 'Summer', '午': 'Summer', '未': 'Summer',
    '申': 'Autumn', '酉': 'Autumn', '戌': 'Autumn',
    '亥': 'Winter', '子': 'Winter', '丑': 'Winter'
  };
  return seasons[monthZhi];
}

// Helper to get Void (Kong Wang)
function getKongWang(ganZhi) {
  const gan = ganZhi.substring(0, 1);
  const zhi = ganZhi.substring(1, 2);
  const ganIdx = GAN.indexOf(gan);
  const zhiIdx = ZHI.indexOf(zhi);
  const diff = (zhiIdx - ganIdx + 12) % 12;
  // Xun Shou: 0->XuHai, 2->ShenYou, 4->WuWei, 6->ChenSi, 8->YinMao, 10->ZiChou
  // Kong Wang is the two branches after the Xun (10 stems).
  // Or simply: (zhiIdx - ganIdx) -> Xun index.
  // 0 (Jia Zi) -> Xu Hai
  // 10 (Jia Xu) -> Shen You
  // 8 (Jia Shen) -> Wu Wei
  // 6 (Jia Wu) -> Chen Si
  // 4 (Jia Chen) -> Yin Mao
  // 2 (Jia Yin) -> Zi Chou
  const map = {
    0: '戌亥', 10: '申酉', 8: '午未', 6: '辰巳', 4: '寅卯', 2: '子丑'
  };
  return map[diff] || '';
}

function getLiuYaoShenSha(dayGan, dayZhi, monthZhi) {
  // Required: Wen Chang, Yi Ma, Jiang Xing, Tao Hua, Tian Xi, Tian Yi, Mou Xing, Hua Gai, Zai Sha, Jie Sha, Lu Shen, Yang Ren, Gui Ren
  
  const map = {};
  
  // 1. Wen Chang (文昌) - Day Gan
  const wenChangMap = {'甲':'巳', '乙':'午', '丙':'申', '丁':'酉', '戊':'申', '己':'酉', '庚':'亥', '辛':'子', '壬':'寅', '癸':'卯'};
  map['文昌'] = wenChangMap[dayGan];
  
  // 2. Yi Ma (驿马) - Day Branch
  const yiMaMap = {
    '申':'寅', '子':'寅', '辰':'寅',
    '寅':'申', '午':'申', '戌':'申',
    '巳':'亥', '酉':'亥', '丑':'亥',
    '亥':'巳', '卯':'巳', '未':'巳'
  };
  map['驿马'] = yiMaMap[dayZhi];
  
  // 3. Jiang Xing (将星) - Day Branch
  const jiangXingMap = {
    '申':'子', '子':'子', '辰':'子',
    '寅':'午', '午':'午', '戌':'午',
    '巳':'酉', '酉':'酉', '丑':'酉',
    '亥':'卯', '卯':'卯', '未':'卯'
  };
  map['将星'] = jiangXingMap[dayZhi];
  
  // 4. Tao Hua (桃花) - Day Branch
  const taoHuaMap = {
    '申':'酉', '子':'酉', '辰':'酉',
    '寅':'卯', '午':'卯', '戌':'卯',
    '巳':'午', '酉':'午', '丑':'午',
    '亥':'子', '卯':'子', '未':'子'
  };
  map['桃花'] = taoHuaMap[dayZhi];
  
  // 5. Tian Xi (天喜) - Season Based
  // Spring -> Xu, Summer -> Chou, Autumn -> Chen, Winter -> Wei
  const season = getSeason(monthZhi);
  const tianXiMap = {
    'Spring': '戌',
    'Summer': '丑',
    'Autumn': '辰',
    'Winter': '未'
  };
  map['天喜'] = tianXiMap[season];
  
  // 6. Tian Yi (天医) - Month Branch
  // Zi->Hai, Chou->Zi... (Previous)
  const tianYiMap = {
    '子':'亥', '丑':'子', '寅':'丑', '卯':'寅', '辰':'卯', '巳':'辰',
    '午':'巳', '未':'午', '申':'未', '酉':'申', '戌':'酉', '亥':'戌'
  };
  map['天医'] = tianYiMap[monthZhi];
  
  // 7. Gui Ren (贵人) - Day Gan
  const guiRenMap = {
    '甲':'丑未', '乙':'子申', '丙':'亥酉', '丁':'亥酉', '戊':'丑未',
    '己':'子申', '庚':'丑未', '辛':'午寅', '壬':'巳卯', '癸':'巳卯'
  };
  map['贵人'] = guiRenMap[dayGan];
  
  // 8. Lu Shen (禄神) - Day Gan
  const luShenMap = {'甲':'寅', '乙':'卯', '丙':'巳', '丁':'午', '戊':'巳', '己':'午', '庚':'申', '辛':'酉', '壬':'亥', '癸':'子'};
  map['禄神'] = luShenMap[dayGan];
  
  // 9. Yang Ren (阳刃) - Day Gan (Liu Yao Rule)
  // Jia-Mao, Yi-Yin, Bing-Wu, Ding-Si, Wu-Wu, Ji-Si, Geng-You, Xin-Shen, Ren-Zi, Gui-Hai
  const yangRenMap = {
    '甲':'卯', '乙':'寅', '丙':'午', '丁':'巳', '戊':'午', 
    '己':'巳', '庚':'酉', '辛':'申', '壬':'子', '癸':'亥'
  };
  map['阳刃'] = yangRenMap[dayGan];
  
  // 10. Jie Sha (劫煞) - Day Branch
  const jieShaMap = {
    '申':'巳', '子':'巳', '辰':'巳',
    '寅':'亥', '午':'亥', '戌':'亥',
    '巳':'寅', '酉':'寅', '丑':'寅',
    '亥':'申', '卯':'申', '未':'申'
  };
  map['劫煞'] = jieShaMap[dayZhi];
  
  // 11. Zai Sha (灾煞) - Day Branch
  const zaiShaMap = {
    '申':'午', '子':'午', '辰':'午',
    '寅':'子', '午':'子', '戌':'子',
    '巳':'卯', '酉':'卯', '丑':'卯',
    '亥':'酉', '卯':'酉', '未':'酉'
  };
  map['灾煞'] = zaiShaMap[dayZhi];
  
  // 12. Hua Gai (华盖) - Day Branch
  const huaGaiMap = {
    '申':'辰', '子':'辰', '辰':'辰',
    '寅':'戌', '午':'戌', '戌':'戌',
    '巳':'丑', '酉':'丑', '丑':'丑',
    '亥':'未', '卯':'未', '未':'未'
  };
  map['华盖'] = huaGaiMap[dayZhi];
  
  // 13. Mou Xing (谋星) - Day Branch (San He)
  // ShenZiChen -> Mao, HaiMaoWei -> You, YinWuXu -> Zi, SiYouChou -> Wu
  const mouXingMap = {
    '申':'卯', '子':'卯', '辰':'卯',
    '亥':'酉', '卯':'酉', '未':'酉',
    '寅':'子', '午':'子', '戌':'子',
    '巳':'午', '酉':'午', '丑':'午'
  };
  map['谋星'] = mouXingMap[dayZhi];
  
  return map;
}
