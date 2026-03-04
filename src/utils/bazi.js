import { Lunar, Solar } from 'lunar-javascript';

const GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// Get Na Yin (纳音) for a Gan-Zhi pair
const getNaYin = (ganZhi) => {
  const naYinMap = {
    '甲子': '海中金', '乙丑': '海中金',
    '丙寅': '炉中火', '丁卯': '炉中火',
    '戊辰': '大林木', '己巳': '大林木',
    '庚午': '路旁土', '辛未': '路旁土',
    '壬申': '剑锋金', '癸酉': '剑锋金',
    '甲戌': '山头火', '乙亥': '山头火',
    '丙子': '涧下水', '丁丑': '涧下水',
    '戊寅': '城头土', '己卯': '城头土',
    '庚辰': '白蜡金', '辛巳': '白蜡金',
    '壬午': '杨柳木', '癸未': '杨柳木',
    '甲申': '泉中水', '乙酉': '泉中水',
    '丙戌': '屋上土', '丁亥': '屋上土',
    '戊子': '霹雳火', '己丑': '霹雳火',
    '庚寅': '松柏木', '辛卯': '松柏木',
    '壬辰': '长流水', '癸巳': '长流水',
    '甲午': '砂石金', '乙未': '砂石金',
    '丙申': '山下火', '丁酉': '山下火',
    '戊戌': '平地木', '己亥': '平地木',
    '庚子': '壁上土', '辛丑': '壁上土',
    '壬寅': '金箔金', '癸卯': '金箔金',
    '甲辰': '覆灯火', '乙巳': '覆灯火',
    '丙午': '天河水', '丁未': '天河水',
    '戊申': '大驿土', '己酉': '大驿土',
    '庚戌': '钗钏金', '辛亥': '钗钏金',
    '壬子': '桑柘木', '癸丑': '桑柘木',
    '甲寅': '大溪水', '乙卯': '大溪水',
    '丙辰': '沙中土', '丁巳': '沙中土',
    '戊午': '天上火', '己未': '天上火',
    '庚申': '石榴木', '辛酉': '石榴木',
    '壬戌': '大海水', '癸亥': '大海水'
  };
  return naYinMap[ganZhi] || '';
};

// 十神 (Ten Gods) lookup based on day stem vs other stem
const getTenGod = (dayStem, otherStem) => {
  const dayGanIdx = GAN.indexOf(dayStem);
  const otherGanIdx = GAN.indexOf(otherStem);
  
  // 比肩 (same stem)
  if (dayStem === otherStem) return '比肩';
  
  // 劫财 (same element, opposite yin-yang)
  const dayYang = dayGanIdx % 2 === 0;
  const otherYang = otherGanIdx % 2 === 0;
  const sameElement = Math.floor(dayGanIdx / 2) === Math.floor(otherGanIdx / 2);
  
  if (sameElement) return '劫财';
  
  // Five elements relationship
  const elements = ['木', '火', '土', '金', '水'];
  const dayElement = elements[Math.floor(dayGanIdx / 2)];
  const otherElement = elements[Math.floor(otherGanIdx / 2)];
  
  const elementIdx = elements.indexOf(dayElement);
  const otherIdx = elements.indexOf(otherElement);
  
  // I produce (食神/伤官)
  if ((elementIdx + 1) % 5 === otherIdx) {
    return dayYang === otherYang ? '食神' : '伤官';
  }
  
  // Produces me (正印/偏印)
  if ((otherIdx + 1) % 5 === elementIdx) {
    return dayYang === otherYang ? '偏印' : '正印';
  }
  
  // I overcome (正财/偏财)
  if ((elementIdx + 2) % 5 === otherIdx) {
    return dayYang === otherYang ? '偏财' : '正财';
  }
  
  // Overcomes me (正官/七杀)
  if ((otherIdx + 2) % 5 === elementIdx) {
    return dayYang === otherYang ? '七杀' : '正官';
  }
  
  return '';
};

// Twelve Stages of Growth (长生十二神)
const getChangSheng = (gan, zhi) => {
  const stages = ['长生', '沐浴', '冠带', '临官', '帝旺', '衰', '病', '死', '墓', '绝', '胎', '养'];
  const ganIdx = GAN.indexOf(gan);
  const zhiIdx = ZHI.indexOf(zhi);
  
  // Start positions for each Gan
  // Jia(0): Hai(11), Bing(2): Yin(2), Wu(4): Yin(2), Geng(6): Si(5), Ren(8): Shen(8)
  // Yi(1): Wu(6), Ding(3): You(9), Ji(5): You(9), Xin(7): Zi(0), Gui(9): Mao(3)
  const startPos = {
    '甲': 11, '丙': 2, '戊': 2, '庚': 5, '壬': 8,
    '乙': 6, '丁': 9, '己': 9, '辛': 0, '癸': 3
  };
  
  const isYang = ganIdx % 2 === 0;
  const start = startPos[gan];
  
  let offset;
  if (isYang) {
    // Forward
    offset = (zhiIdx - start + 12) % 12;
  } else {
    // Backward
    offset = (start - zhiIdx + 12) % 12;
  }
  
  return stages[offset];
};

// Xun and Kong Wang
const getXun = (ganZhi) => {
  const ganIdx = GAN.indexOf(ganZhi[0]);
  const zhiIdx = ZHI.indexOf(ganZhi.substring(1));
  const diff = (zhiIdx - ganIdx + 12) % 12;
  
  const xunMap = {
    0: '甲子', 10: '甲戌', 8: '甲申', 6: '甲午', 4: '甲辰', 2: '甲寅'
  };
  const kongMap = {
    '甲子': '戌亥', '甲戌': '申酉', '甲申': '午未',
    '甲午': '辰巳', '甲辰': '寅卯', '甲寅': '子丑'
  };
  
  const xunName = xunMap[diff];
  return {
    xun: xunName,
    kongWang: kongMap[xunName]
  };
};

// Shen Sha Helpers
const getShenSha = (ganZhi, dayGanZhi, yearGanZhi, monthGanZhi) => {
  const shenSha = [];
  const gan = ganZhi[0];
  const zhi = ganZhi.substring(1);
  
  const dayGan = dayGanZhi[0];
  const dayZhi = dayGanZhi.substring(1);
  const yearZhi = yearGanZhi.substring(1);
  const monthZhi = monthGanZhi.substring(1);
  const yearGan = yearGanZhi[0];

  // 天乙贵人 (Tian Yi Gui Ren) - Day Gan or Year Gan
  const tianYiMap = {
    '甲': ['丑', '未'], '戊': ['丑', '未'], '庚': ['丑', '未'],
    '乙': ['子', '申'], '己': ['子', '申'],
    '丙': ['亥', '酉'], '丁': ['亥', '酉'],
    '壬': ['巳', '卯'], '癸': ['巳', '卯'],
    '辛': ['午', '寅']
  };
  if (tianYiMap[dayGan]?.includes(zhi)) shenSha.push('天乙贵人');
  if (tianYiMap[yearGan]?.includes(zhi)) shenSha.push('天乙贵人(年)');

  // 太极贵人 (Tai Ji Gui Ren) - Day Gan or Year Gan
  const taiJiMap = {
    '甲': ['子', '午'], '乙': ['子', '午'],
    '丙': ['卯', '酉'], '丁': ['卯', '酉'],
    '戊': ['辰', '戌', '丑', '未'], '己': ['辰', '戌', '丑', '未'],
    '庚': ['寅', '亥'], '辛': ['寅', '亥'],
    '壬': ['巳', '申'], '癸': ['巳', '申']
  };
  if (taiJiMap[dayGan]?.includes(zhi)) shenSha.push('太极贵人');
  if (taiJiMap[yearGan]?.includes(zhi)) shenSha.push('太极贵人');

  // 天德贵人 (Tian De) - Month Zhi
  const tianDeMap = {
    '子': '巳', '丑': '庚', '寅': '丁', '卯': '申', 
    '辰': '壬', '巳': '辛', '午': '亥', '未': '甲', 
    '申': '癸', '酉': '寅', '戌': '丙', '亥': '乙'
  };
  const td = tianDeMap[monthZhi];
  if (td === gan || td === zhi) shenSha.push('天德贵人');

  // 天德合 (Tian De He) - Combines with Tian De
  const getCombine = (char) => {
    const stemCombos = {'甲':'己', '己':'甲', '乙':'庚', '庚':'乙', '丙':'辛', '辛':'丙', '丁':'壬', '壬':'丁', '戊':'癸', '癸':'戊'};
    const branchCombos = {'子':'丑', '丑':'子', '寅':'亥', '亥':'寅', '卯':'戌', '戌':'卯', '辰':'酉', '酉':'辰', '巳':'申', '申':'巳', '午':'未', '未':'午'};
    return stemCombos[char] || branchCombos[char];
  };
  const tianDe = tianDeMap[monthZhi];
  if (tianDe) {
    const tianDeHe = getCombine(tianDe);
    if (tianDeHe === gan || tianDeHe === zhi) shenSha.push('天德合');
  }

  // 月德贵人 (Yue De) - Month Zhi
  const yueDeMap = {
    '寅': '丙', '午': '丙', '戌': '丙',
    '申': '壬', '子': '壬', '辰': '壬',
    '亥': '甲', '卯': '甲', '未': '甲',
    '巳': '庚', '酉': '庚', '丑': '庚'
  };
  if (yueDeMap[monthZhi] === gan) shenSha.push('月德贵人');

  // 福星贵人 (Fu Xing) - Day Gan or Year Gan
  const fuXingMap = {
    '甲': ['寅', '子'], '丙': ['寅', '子'],
    '乙': ['卯', '丑'], '癸': ['卯', '丑'],
    '戊': ['申'], '己': ['未'], '丁': ['亥'],
    '庚': ['午'], '辛': ['巳'], '壬': ['辰']
  };
  if (fuXingMap[dayGan]?.includes(zhi)) shenSha.push('福星贵人');
  if (fuXingMap[yearGan]?.includes(zhi)) shenSha.push('福星贵人');

  // 国印贵人 (Guo Yin) - Day Gan or Year Gan
  const guoYinMap = {
    '甲': '戌', '乙': '亥', '丙': '丑', '丁': '寅', '戊': '丑',
    '己': '寅', '庚': '辰', '辛': '巳', '壬': '未', '癸': '申'
  };
  if (guoYinMap[dayGan] === zhi) shenSha.push('国印');
  if (guoYinMap[yearGan] === zhi) shenSha.push('国印');

  // 红艳 (Hong Yan) - Day Gan
  const hongYanMap = {
    '甲': '午', '乙': '申', '丙': '寅', '丁': '未', '戊': '辰',
    '己': '辰', '庚': '戌', '辛': '酉', '壬': '子', '癸': '申'
  };
  if (hongYanMap[dayGan] === zhi) shenSha.push('红艳');

  // 学堂 (Xue Tang) - Chang Sheng of Na Yin Element (Day/Year)
  // Simplified: Based on Stem
  // Jia-Hai, Yi-Wu, Bing-Yin, Ding-You, Wu-Yin, Ji-You, Geng-Si, Xin-Zi, Ren-Shen, Gui-Mao
  const xueTangMap = {
    '甲': '亥', '乙': '午', '丙': '寅', '丁': '酉', '戊': '寅',
    '己': '酉', '庚': '巳', '辛': '子', '壬': '申', '癸': '卯'
  };
  if (xueTangMap[dayGan] === zhi || xueTangMap[yearGan] === zhi) shenSha.push('学堂');

  // 驿马 (Yi Ma) - Day Zhi or Year Zhi
  const yiMaMap = {
    '申': '寅', '子': '寅', '辰': '寅',
    '寅': '申', '午': '申', '戌': '申',
    '亥': '巳', '卯': '巳', '未': '巳',
    '巳': '亥', '酉': '亥', '丑': '亥'
  };
  if (yiMaMap[dayZhi] === zhi || yiMaMap[yearZhi] === zhi) shenSha.push('驿马');

  // 桃花 (Tao Hua) - Day Zhi or Year Zhi
  const taoHuaMap = {
    '申': '酉', '子': '酉', '辰': '酉',
    '寅': '卯', '午': '卯', '戌': '卯',
    '亥': '子', '卯': '子', '未': '子',
    '巳': '午', '酉': '午', '丑': '午'
  };
  if (taoHuaMap[dayZhi] === zhi || taoHuaMap[yearZhi] === zhi) shenSha.push('桃花');

  // 禄神 (Lu Shen) - Day Gan
  const luShenMap = {
    '甲': '寅', '乙': '卯', '丙': '巳', '丁': '午', '戊': '巳',
    '己': '午', '庚': '申', '辛': '酉', '壬': '亥', '癸': '子'
  };
  if (luShenMap[dayGan] === zhi) shenSha.push('禄神');

  // 羊刃 (Yang Ren) - Day Gan
  const yangRenMap = {
    '甲': '卯', '乙': '辰', '丙': '午', '丁': '未', '戊': '午',
    '己': '未', '庚': '酉', '辛': '戌', '壬': '子', '癸': '丑'
  };
  if (yangRenMap[dayGan] === zhi) shenSha.push('羊刃');

  // 文昌 (Wen Chang) - Day Gan
  const wenChangMap = {
    '甲': '巳', '乙': '午', '丙': '申', '丁': '酉', '戊': '申',
    '己': '酉', '庚': '亥', '辛': '子', '壬': '寅', '癸': '卯'
  };
  if (wenChangMap[dayGan] === zhi) shenSha.push('文昌贵人');

  // 魁罡 (Kui Gang) - Day Pillar usually
  if (['壬辰', '壬戌', '庚辰', '庚戌'].includes(ganZhi)) shenSha.push('魁罡');

  // 十恶大败 (Shi E Da Bai) - Day Pillar
  const shiEMap = ['甲辰', '乙巳', '丙申', '丁亥', '戊戌', '己丑', '庚辰', '辛巳', '壬申', '癸亥'];
  if (shiEMap.includes(ganZhi) && ganZhi === dayGanZhi) shenSha.push('十恶大败');

  // 将星 (Jiang Xing) - Day/Year Zhi
  const jiangXingMap = {
    '寅': '午', '午': '午', '戌': '午',
    '申': '子', '子': '子', '辰': '子',
    '亥': '卯', '卯': '卯', '未': '卯',
    '巳': '酉', '酉': '酉', '丑': '酉'
  };
  if (jiangXingMap[dayZhi] === zhi || jiangXingMap[yearZhi] === zhi) shenSha.push('将星');

  // 华盖 (Hua Gai) - Day/Year Zhi
  const huaGaiMap = {
    '寅': '戌', '午': '戌', '戌': '戌',
    '申': '辰', '子': '辰', '辰': '辰',
    '亥': '未', '卯': '未', '未': '未',
    '巳': '丑', '酉': '丑', '丑': '丑'
  };
  if (huaGaiMap[dayZhi] === zhi || huaGaiMap[yearZhi] === zhi) shenSha.push('华盖');

  // 劫煞 (Jie Sha) - Day/Year Zhi
  const jieShaMap = {
    '寅': '亥', '午': '亥', '戌': '亥',
    '申': '巳', '子': '巳', '辰': '巳',
    '亥': '申', '卯': '申', '未': '申',
    '巳': '寅', '酉': '寅', '丑': '寅'
  };
  if (jieShaMap[dayZhi] === zhi || jieShaMap[yearZhi] === zhi) shenSha.push('劫煞');

  // 灾煞 (Zai Sha) - Day/Year Zhi
  const zaiShaMap = {
    '寅': '子', '午': '子', '戌': '子',
    '申': '午', '子': '午', '辰': '午',
    '亥': '酉', '卯': '酉', '未': '酉',
    '巳': '卯', '酉': '卯', '丑': '卯'
  };
  if (zaiShaMap[dayZhi] === zhi || zaiShaMap[yearZhi] === zhi) shenSha.push('灾煞');

  // 亡神 (Wang Shen) - Day/Year Zhi
  const wangShenMap = {
    '寅': '巳', '午': '巳', '戌': '巳',
    '申': '亥', '子': '亥', '辰': '亥',
    '亥': '寅', '卯': '寅', '未': '寅',
    '巳': '申', '酉': '申', '丑': '申'
  };
  if (wangShenMap[dayZhi] === zhi || wangShenMap[yearZhi] === zhi) shenSha.push('亡神');

  // 红鸾 (Hong Luan) - Year Zhi
  const hongLuanMap = {
    '子': '卯', '丑': '寅', '寅': '丑', '卯': '子', '辰': '亥', '巳': '戌',
    '午': '酉', '未': '申', '申': '未', '酉': '午', '戌': '巳', '亥': '辰'
  };
  if (hongLuanMap[yearZhi] === zhi) shenSha.push('红鸾');

  // 天喜 (Tian Xi) - Year Zhi
  const tianXiMap = {
    '子': '酉', '丑': '申', '寅': '未', '卯': '午', '辰': '巳', '巳': '辰',
    '午': '卯', '未': '寅', '申': '丑', '酉': '子', '戌': '亥', '亥': '戌'
  };
  if (tianXiMap[yearZhi] === zhi) shenSha.push('天喜');

  // 孤辰 (Gu Chen) - Year Zhi
  const guChenMap = {
    '亥': '寅', '子': '寅', '丑': '寅',
    '寅': '巳', '卯': '巳', '辰': '巳',
    '巳': '申', '午': '申', '未': '申',
    '申': '亥', '酉': '亥', '戌': '亥'
  };
  if (guChenMap[yearZhi] === zhi) shenSha.push('孤辰');

  // 寡宿 (Gua Su) - Year Zhi
  const guaSuMap = {
    '亥': '戌', '子': '戌', '丑': '戌',
    '寅': '丑', '卯': '丑', '辰': '丑',
    '巳': '辰', '午': '辰', '未': '辰',
    '申': '未', '酉': '未', '戌': '未'
  };
  if (guaSuMap[yearZhi] === zhi) shenSha.push('寡宿');

  // 金舆 (Jin Yu) - Day Gan or Year Gan
  const jinYuMap = {
    '甲': '辰', '乙': '巳', '丙': '未', '丁': '申', '戊': '未',
    '己': '申', '庚': '戌', '辛': '亥', '壬': '丑', '癸': '寅'
  };
  if (jinYuMap[dayGan] === zhi) shenSha.push('金舆');
  if (jinYuMap[yearGan] === zhi) shenSha.push('金舆');

  // 天医星 (Tian Yi Xing) - Month Zhi
  // Prev month branch
  const tianYiXingMap = {
    '寅': '丑', '卯': '寅', '辰': '卯', '巳': '辰', '午': '巳', '未': '午',
    '申': '未', '酉': '申', '戌': '酉', '亥': '戌', '子': '亥', '丑': '子'
  };
  if (tianYiXingMap[monthZhi] === zhi) shenSha.push('天医星');

  // 吊客 (Diao Ke) - Year Zhi - 2
  const diaoKeMap = {
    '子': '戌', '丑': '亥', '寅': '子', '卯': '丑', '辰': '寅', '巳': '卯',
    '午': '辰', '未': '巳', '申': '午', '酉': '未', '戌': '申', '亥': '酉'
  };
  if (diaoKeMap[yearZhi] === zhi) shenSha.push('吊客');

  // 披头 (Pi Tou) - Liu He of (Year - 3)
  // Year - 3 is the Pi Ma (披麻). Liu He of Pi Ma is Pi Tou.
  const piTouMap = {
    '子': '辰', '丑': '卯', '寅': '寅', '卯': '丑', '辰': '子', '巳': '亥',
    '午': '戌', '未': '酉', '申': '申', '酉': '未', '戌': '午', '亥': '巳'
  };
  if (piTouMap[yearZhi] === zhi) shenSha.push('披头');

  return [...new Set(shenSha)];
};

// Interaction Helpers
const getInteractions = (ganZhis) => {
  const interactions = [];
  const zhis = ganZhis.map(gz => gz.substring(1));
  const gans = ganZhis.map(gz => gz[0]);
  const pillars = ['年柱', '月柱', '日柱', '时柱'];
  
  // Tian Gan He (天干五合)
  const ganHeMap = {
    '甲': '己', '己': '甲', '乙': '庚', '庚': '乙', '丙': '辛', '辛': '丙',
    '丁': '壬', '壬': '丁', '戊': '癸', '癸': '戊'
  };
  const ganHeResult = {'甲己': '土', '乙庚': '金', '丙辛': '水', '丁壬': '木', '戊癸': '火'};
  
  for (let i = 0; i < gans.length; i++) {
    for (let j = i + 1; j < gans.length; j++) {
      const g1 = gans[i];
      const g2 = gans[j];
      if (ganHeMap[g1] === g2) {
        // Determine element (simplified)
        const pair = [g1, g2].sort().join('');
        const element = ganHeResult[pair] || '';
        interactions.push(`${pillars[i]}天干：${g1}${g2}合${element}`);
      }
    }
  }

  // Tian Gan Chong (天干相冲)
  const ganChongMap = {
    '甲': '庚', '庚': '甲', '乙': '辛', '辛': '乙',
    '丙': '壬', '壬': '丙', '丁': '癸', '癸': '丁'
  };
  for (let i = 0; i < gans.length; i++) {
    for (let j = i + 1; j < gans.length; j++) {
      const g1 = gans[i];
      const g2 = gans[j];
      if (ganChongMap[g1] === g2) {
        interactions.push(`${pillars[i]}天干：${g1}${g2}相冲`);
      }
    }
  }

  // Di Zhi Liu He (地支六合)
  const liuHeMap = {
    '子': '丑', '丑': '子', '寅': '亥', '亥': '寅', '卯': '戌', '戌': '卯',
    '辰': '酉', '酉': '辰', '巳': '申', '申': '巳', '午': '未', '未': '午'
  };
  for (let i = 0; i < zhis.length; i++) {
    for (let j = i + 1; j < zhis.length; j++) {
      const z1 = zhis[i];
      const z2 = zhis[j];
      if (liuHeMap[z1] === z2) {
        interactions.push(`${pillars[i]}地支：${z1}${z2}六合`);
      }
    }
  }

  // Di Zhi Liu Chong (地支六冲)
  const liuChongMap = {
    '子': '午', '午': '子', '丑': '未', '未': '丑', '寅': '申', '申': '寅',
    '卯': '酉', '酉': '卯', '辰': '戌', '戌': '辰', '巳': '亥', '亥': '巳'
  };
  for (let i = 0; i < zhis.length; i++) {
    for (let j = i + 1; j < zhis.length; j++) {
      const z1 = zhis[i];
      const z2 = zhis[j];
      if (liuChongMap[z1] === z2) {
        interactions.push(`${pillars[i]}地支：${z1}${z2}相冲`);
      }
    }
  }
  
  // San He (三合) - Check global presence
  const zhiSet = new Set(zhis);
  const sanHeGroups = [
    { name: '申子辰合水', group: ['申', '子', '辰'] },
    { name: '寅午戌合火', group: ['寅', '午', '戌'] },
    { name: '亥卯未合木', group: ['亥', '卯', '未'] },
    { name: '巳酉丑合金', group: ['巳', '酉', '丑'] }
  ];
  sanHeGroups.forEach(sh => {
    const count = sh.group.filter(z => zhiSet.has(z)).length;
    if (count === 3) interactions.push(`地支三合：${sh.name}`);
    else if (count === 2) interactions.push(`地支半合：${sh.name.slice(0, 3)}`);
  });

  return [...new Set(interactions)];
};

// Get hidden stems for earth branch
const getHiddenStems = (zhi) => {
  const hiddenStems = {
    '子': { '主气': '癸' },
    '丑': { '主气': '己', '中气': '癸', '余气': '辛' },
    '寅': { '主气': '甲', '中气': '丙', '余气': '戊' },
    '卯': { '主气': '乙' },
    '辰': { '主气': '戊', '中气': '乙', '余气': '癸' },
    '巳': { '主气': '丙', '中气': '庚', '余气': '戊' },
    '午': { '主气': '丁', '中气': '己' },
    '未': { '主气': '己', '中气': '丁', '余气': '乙' },
    '申': { '主气': '庚', '中气': '壬', '余气': '戊' },
    '酉': { '主气': '辛' },
    '戌': { '主气': '戊', '中气': '辛', '余气': '丁' },
    '亥': { '主气': '壬', '中气': '甲' }
  };
  return hiddenStems[zhi] || {};
};

// Calculate Tai Xi (胎息)
const getTaiXi = (dayGanZhi) => {
  const gan = dayGanZhi[0];
  const zhi = dayGanZhi.substring(1);
  
  const ganHeMap = {
    '甲': '己', '己': '甲', '乙': '庚', '庚': '乙', '丙': '辛', '辛': '丙',
    '丁': '壬', '壬': '丁', '戊': '癸', '癸': '戊'
  };
  const zhiHeMap = {
    '子': '丑', '丑': '子', '寅': '亥', '亥': '寅', '卯': '戌', '戌': '卯',
    '辰': '酉', '酉': '辰', '巳': '申', '申': '巳', '午': '未', '未': '午'
  };
  
  return (ganHeMap[gan] || '') + (zhiHeMap[zhi] || '');
};

export function getBaZiPaiPan(date, birthYear = 2000, gender = '男') {
  const lunar = Lunar.fromDate(date);
  const solar = Solar.fromDate(date);
  const eightChar = lunar.getEightChar();
  
  // Basic info
  const yearGanZhi = eightChar.getYear();
  const monthGanZhi = eightChar.getMonth();
  const dayGanZhi = eightChar.getDay();
  const hourGanZhi = eightChar.getTime();
  
  const dayStem = dayGanZhi[0];
  
  // Build pillar data
  const buildPillar = (ganZhi, pillarName) => {
    const gan = ganZhi[0];
    const zhi = ganZhi.substring(1);
    const hidden = getHiddenStems(zhi);
    const tenGod = pillarName !== '日柱' ? getTenGod(dayStem, gan) : '日主';
    
    // Get element for gan
    const ganIdx = GAN.indexOf(gan);
    const elements = ['木', '火', '土', '金', '水'];
    const ganElement = elements[Math.floor(ganIdx / 2)];
    const ganYinYang = ganIdx % 2 === 0 ? '阳' : '阴';
    
    // Get element for zhi 
    const zhiIdx = ZHI.indexOf(zhi);
    const zhiElements = ['水', '土', '木', '木', '土', '火', '火', '土', '金', '金', '土', '水'];
    const zhiElement = zhiElements[zhiIdx];
    const zhiYinYang = zhiIdx % 2 === 0 ? '阳' : '阴';
    
    // Build hidden stems with ten gods
    const cangGan = {};
    Object.entries(hidden).forEach(([type, stem]) => {
      cangGan[type] = {
        '天干': stem,
        '十神': getTenGod(dayStem, stem)
      };
    });

    // Calculate Shen Sha for this pillar
    const shenSha = getShenSha(ganZhi, dayGanZhi, yearGanZhi, monthGanZhi);
    
    // Xun and Kong Wang
    const xunInfo = getXun(ganZhi);
    
    // Star Luck (Day Stem vs Pillar Branch)
    const starLuck = getChangSheng(dayStem, zhi);
    
    // Self Sitting (Pillar Stem vs Pillar Branch)
    const selfSitting = getChangSheng(gan, zhi);

    return {
      '干支': ganZhi,
      '天干': {
        '天干': gan,
        '五行': ganElement,
        '阴阳': ganYinYang,
        '十神': tenGod
      },
      '地支': {
        '地支': zhi,
        '五行': zhiElement,
        '阴阳': zhiYinYang,
        '藏干': cangGan
      },
      '纳音': getNaYin(ganZhi),
      '旬': xunInfo.xun,
      '空亡': xunInfo.kongWang,
      '星运': starLuck,
      '自坐': selfSitting,
      '神煞': shenSha
    };
  };
  
  const yearPillar = buildPillar(yearGanZhi, '年柱');
  const monthPillar = buildPillar(monthGanZhi, '月柱');
  const dayPillar = buildPillar(dayGanZhi, '日柱');
  const hourPillar = buildPillar(hourGanZhi, '时柱');

  // Calculate Interactions
  const ganZhis = [yearGanZhi, monthGanZhi, dayGanZhi, hourGanZhi];
  const interactions = getInteractions(ganZhis);
  
  // Get Da Yun (Big Luck)
  const yun = eightChar.getYun(gender === '男' ? 1 : 0);
  const startAge = yun.getStartYear(); // This returns the starting age in years
  const daYunList = yun.getDaYun();
  
  // Note: The library's getDaYun() returns the first item as empty (current period placeholder).
  // We skip it and start from index 1 to get the actual Da Yun periods.
  const daYun = daYunList.slice(1, 11).map((dy, idx) => {
    const ganZhi = dy.getGanZhi();
    const gan = ganZhi[0];
    const zhi = ganZhi.substring(1);
    const hidden = getHiddenStems(zhi);
    const ageStart = startAge + idx * 10;
    const ageEnd = ageStart + 9;
    const yearStart = birthYear + ageStart;
    const yearEnd = birthYear + ageEnd;
    
    return {
      '干支': ganZhi,
      '开始年份': yearStart,
      '结束年份': yearEnd,
      '天干十神': getTenGod(dayStem, gan),
      '地支藏干': Object.values(hidden),
      '地支十神': Object.values(hidden).map(stem => getTenGod(dayStem, stem)),
      '开始年龄': ageStart,
      '结束年龄': ageEnd
    };
  });
  
  return {
    '性别': gender,
    '阳历': solar.toYmdHms(),
    '农历': lunar.toString(),
    '八字': `${yearGanZhi} ${monthGanZhi} ${dayGanZhi} ${hourGanZhi}`,
    '生肖': lunar.getYearShengXiao(),
    '日主': dayStem,
    '年柱': yearPillar,
    '月柱': monthPillar,
    '日柱': dayPillar,
    '时柱': hourPillar,
    '胎元': eightChar.getTaiYuan(),
    '胎息': getTaiXi(dayGanZhi),
    '命宫': eightChar.getMingGong(),
    '身宫': eightChar.getShenGong(),
    '大运': {
      '起运年龄': startAge,
      '大运': daYun
    },
    '刑冲合会': interactions,
    dateStr: date.toLocaleString(),
    birthYear
  };
}
