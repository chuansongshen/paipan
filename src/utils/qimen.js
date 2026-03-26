import { Solar } from 'lunar-javascript';
import { BRANCH_TO_PALACE, JIE_QI_JU, YANG_DUN_JIE_QI } from './constants.js';

const GANS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const ZHIS = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const PALACE_NUMS = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
const PALACE_NAME_BY_NUM = {
  '一': '坎',
  '二': '坤',
  '三': '震',
  '四': '巽',
  '五': '中',
  '六': '乾',
  '七': '兑',
  '八': '艮',
  '九': '离'
};
const PALACE_ID_BY_NAME = {
  '坎': 1,
  '坤': 2,
  '震': 3,
  '巽': 4,
  '中': 5,
  '乾': 6,
  '兑': 7,
  '兌': 7,
  '艮': 8,
  '离': 9,
  '離': 9
};

const JIE_QI_CYCLE = [
  '春分', '清明', '谷雨', '立夏', '小满', '芒种',
  '夏至', '小暑', '大暑', '立秋', '处暑', '白露',
  '秋分', '寒露', '霜降', '立冬', '小雪', '大雪',
  '冬至', '小寒', '大寒', '立春', '雨水', '惊蛰'
];

const YANG_DUN_SET = new Set(YANG_DUN_JIE_QI);
const METHOD_LABEL = {
  chaibu: '拆补',
  zhirun: '置润'
};

const CLOCKWISE_EIGHT_PALACES = ['坎', '艮', '震', '巽', '离', '坤', '兑', '乾'];
const EARTH_STEMS = {
  阳: ['戊', '己', '庚', '辛', '壬', '癸', '丁', '丙', '乙'],
  阴: ['戊', '乙', '丙', '丁', '癸', '壬', '辛', '庚', '己']
};

const XUN_HEADS = ['甲子', '甲戌', '甲申', '甲午', '甲辰', '甲寅'];
const XUN_HEAD_HIDE_STEM = {
  '甲子': '戊',
  '甲戌': '己',
  '甲申': '庚',
  '甲午': '辛',
  '甲辰': '壬',
  '甲寅': '癸'
};

const YUAN_LABELS = ['上元', '中元', '下元'];
const YIN_YANG_TYPE_LABEL = {
  阳: '阳遁',
  阴: '阴遁'
};

const ZHIFU_PAI = {
  阳: {
    '一': '九八七一二三四五六',
    '二': '一九八二三四五六七',
    '三': '二一九三四五六七八',
    '四': '三二一四五六七八九',
    '五': '四三二五六七八九一',
    '六': '五四三六七八九一二',
    '七': '六五四七八九一二三',
    '八': '七六五八九一二三四',
    '九': '八七六九一二三四五'
  },
  阴: {
    '九': '一二三九八七六五四',
    '八': '九一二八七六五四三',
    '七': '八九一七六五四三二',
    '六': '七八九六五四三二一',
    '五': '六七八五四三二一九',
    '四': '五六七四三二一九八',
    '三': '四五六三二一九八七',
    '二': '三四五二一九八七六',
    '一': '二三四一九八七六五'
  }
};

const ZHISHI_MAPPING = ['休', '死', '伤', '杜', '中', '开', '惊', '生', '景'];
const ZHIFU_STAR_MAPPING = ['蓬', '芮', '冲', '辅', '禽', '心', '柱', '任', '英'];

const STAR_ROTATE_BASE = ['蓬', '任', '冲', '辅', '英', '禽', '柱', '心'];
const DOOR_ROTATE_BASE = ['休', '生', '伤', '杜', '景', '死', '惊', '开'];
const GOD_ROTATE_BASE = {
  阳: ['值符', '腾蛇', '太阴', '六合', '勾陈', '朱雀', '九地', '九天'],
  阴: ['值符', '腾蛇', '太阴', '六合', '白虎', '玄武', '九地', '九天']
};

const FULL_STAR_NAME = {
  '蓬': '天蓬',
  '芮': '天芮',
  '冲': '天冲',
  '輔': '天辅',
  '辅': '天辅',
  '英': '天英',
  '禽': '天禽',
  '心': '天心',
  '柱': '天柱',
  '任': '天任'
};
const FULL_DOOR_NAME = {
  '休': '休门',
  '生': '生门',
  '伤': '伤门',
  '傷': '伤门',
  '杜': '杜门',
  '景': '景门',
  '死': '死门',
  '惊': '惊门',
  '驚': '惊门',
  '开': '开门',
  '開': '开门'
};

const STAR_HOME_PALACE = {
  '蓬': '坎',
  '芮': '坤',
  '冲': '震',
  '辅': '巽',
  '輔': '巽',
  '禽': '中',
  '心': '乾',
  '柱': '兑',
  '任': '艮',
  '英': '离'
};

const BRANCH_HORSE_MAP = {
  '申': '寅',
  '子': '寅',
  '辰': '寅',
  '寅': '申',
  '午': '申',
  '戌': '申',
  '亥': '巳',
  '卯': '巳',
  '未': '巳',
  '巳': '亥',
  '酉': '亥',
  '丑': '亥'
};

const AN_GAN_SEQUENCE = ['戊', '己', '庚', '辛', '壬', '癸', '丁', '丙', '乙'];

const SIXTY_JIAZI = buildSixtyJiaZi();

function buildSixtyJiaZi() {
  const result = [];
  for (let i = 0; i < 60; i += 1) {
    result.push(`${GANS[i % 10]}${ZHIS[i % 12]}`);
  }
  return result;
}

function getGanZhiIndex(ganZhi) {
  const index = SIXTY_JIAZI.indexOf(ganZhi);
  if (index === -1) {
    throw new Error(`无法定位干支序号: ${ganZhi}`);
  }
  return index;
}

function rotateList(list, startValue) {
  const startIndex = list.indexOf(startValue);
  if (startIndex === -1) {
    throw new Error(`无法轮转列表，未找到起点: ${startValue}`);
  }
  return [...list.slice(startIndex), ...list.slice(0, startIndex)];
}

function reverseRotateList(list, startValue) {
  return rotateList([...list].reverse(), startValue);
}

function getPalaceNumChar(juNum) {
  const value = PALACE_NUMS[juNum - 1];
  if (!value) {
    throw new Error(`无效局数: ${juNum}`);
  }
  return value;
}

function normalizeMethod(method) {
  if (method === 'zhirun') {
    return 'zhirun';
  }
  if (method !== 'chaibu') {
    console.warn(`[Qimen] 未知定局方式 "${method}"，已回退为拆补法`);
  }
  return 'chaibu';
}

function normalizeJieQiName(name) {
  const map = {
    '穀雨': '谷雨',
    '小滿': '小满',
    '處暑': '处暑',
    '驚蟄': '惊蛰',
    '兌': '兑',
    '離': '离'
  };
  return map[name] || name || '';
}

function getCurrentJieQiInfo(date) {
  const solar = Solar.fromDate(date);
  const lunar = solar.getLunar();
  const currentJieQi = lunar.getPrevJieQi(false);
  const jieQiName = normalizeJieQiName(currentJieQi?.getName?.());
  if (!jieQiName) {
    throw new Error('无法获取当前节气');
  }
  return {
    solar,
    lunar,
    jieQiName,
    jieQiSolar: currentJieQi.getSolar()
  };
}

function solarToDate(solar) {
  if (!solar) {
    throw new Error('缺少节气时刻');
  }
  const year = solar.getYear?.();
  const month = solar.getMonth?.();
  const day = solar.getDay?.();
  const hour = solar.getHour?.() || 0;
  const minute = solar.getMinute?.() || 0;
  const second = solar.getSecond?.() || 0;
  return new Date(year, month - 1, day, hour, minute, second);
}

function getPrevJieQiName(jieQiName) {
  const index = JIE_QI_CYCLE.indexOf(jieQiName);
  if (index === -1) {
    throw new Error(`未知节气: ${jieQiName}`);
  }
  return JIE_QI_CYCLE[(index - 1 + JIE_QI_CYCLE.length) % JIE_QI_CYCLE.length];
}

function getNextJieQiName(jieQiName) {
  const index = JIE_QI_CYCLE.indexOf(jieQiName);
  if (index === -1) {
    throw new Error(`未知节气: ${jieQiName}`);
  }
  return JIE_QI_CYCLE[(index + 1) % JIE_QI_CYCLE.length];
}

function getYuanIndex(dayGanZhi) {
  return Math.floor(getGanZhiIndex(dayGanZhi) / 5) % 3;
}

function getYinYangByJieQi(jieQiName) {
  return YANG_DUN_SET.has(jieQiName) ? '阳' : '阴';
}

function getJuNum(jieQiName, yuanIndex) {
  const juInfo = JIE_QI_JU[jieQiName];
  if (!juInfo) {
    throw new Error(`未知节气局数配置: ${jieQiName}`);
  }
  const juNum = juInfo[yuanIndex];
  if (!juNum) {
    throw new Error(`节气局数配置缺失: ${jieQiName} yuanIndex=${yuanIndex}`);
  }
  return juNum;
}

function createJuDescriptor({ method, currentJieQi, effectiveJieQi, yuanIndex, yinYang, juNum, rule }) {
  return {
    method,
    jieQi: currentJieQi,
    effectiveJieQi,
    yuanIndex,
    yuan: YUAN_LABELS[yuanIndex],
    juNum,
    type: YIN_YANG_TYPE_LABEL[yinYang],
    isYang: yinYang === '阳',
    rule
  };
}

function getHourXunHead(hourGanZhi) {
  const index = getGanZhiIndex(hourGanZhi);
  return SIXTY_JIAZI[Math.floor(index / 10) * 10];
}

function getHiddenStemByXunHead(xunHead) {
  const stem = XUN_HEAD_HIDE_STEM[xunHead];
  if (!stem) {
    throw new Error(`未知旬首遁干: ${xunHead}`);
  }
  return stem;
}

function getLunarMonthLabel(lunar) {
  const monthChinese = lunar.getMonthInChinese?.() || '';
  if (!monthChinese) {
    return '';
  }
  return `${monthChinese}月`;
}

function getZhiRunRawContext(date) {
  const { solar, lunar, jieQiName, jieQiSolar } = getCurrentJieQiInfo(date);
  const dayGanZhi = lunar.getDayInGanZhiExact?.() || lunar.getDayInGanZhi();
  const hourGanZhi = lunar.getTimeInGanZhi();
  const yuanIndex = getYuanIndex(dayGanZhi);
  const nextJieQi = getNextJieQiName(jieQiName);
  const prevJieQi = getPrevJieQiName(jieQiName);
  const currentYinYang = getYinYangByJieQi(jieQiName);
  const nextYinYang = getYinYangByJieQi(nextJieQi);
  const diffMs = date.getTime() - solarToDate(jieQiSolar).getTime();
  const distanceDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  const xunHead = getHourXunHead(hourGanZhi);
  const hiddenStem = getHiddenStemByXunHead(xunHead);
  const lunarMonth = getLunarMonthLabel(lunar);
  const solarMonth = solar.getMonth();
  const lunarDay = lunar.getDay();

  return {
    date,
    solar,
    lunar,
    jieQiName,
    nextJieQi,
    prevJieQi,
    yuanIndex,
    hiddenStem,
    xunHead,
    distanceDays,
    lunarMonth,
    solarMonth,
    lunarDay,
    current: createJuDescriptor({
      method: 'zhirun',
      currentJieQi: jieQiName,
      effectiveJieQi: jieQiName,
      yuanIndex,
      yinYang: currentYinYang,
      juNum: getJuNum(jieQiName, yuanIndex),
      rule: '当前排局'
    }),
    next: createJuDescriptor({
      method: 'zhirun',
      currentJieQi: jieQiName,
      effectiveJieQi: nextJieQi,
      yuanIndex,
      yinYang: nextYinYang,
      juNum: getJuNum(nextJieQi, yuanIndex),
      rule: '超神接气正授排局'
    }),
    previous: createJuDescriptor({
      method: 'zhirun',
      currentJieQi: jieQiName,
      effectiveJieQi: prevJieQi,
      yuanIndex,
      yinYang: currentYinYang,
      juNum: getJuNum(prevJieQi, yuanIndex),
      rule: '其他排局'
    }),
    hybrid: createJuDescriptor({
      method: 'zhirun',
      currentJieQi: jieQiName,
      effectiveJieQi: jieQiName,
      yuanIndex,
      yinYang: nextYinYang,
      juNum: getJuNum(jieQiName, yuanIndex),
      rule: '其他排局1'
    })
  };
}

function selectZhiRunJu(context) {
  const { distanceDays: d, hiddenStem, lunarMonth, solarMonth, lunarDay, jieQiName } = context;
  const isWuJi = ['戊', '己', '庚', '辛', '壬', '癸'].includes(hiddenStem);
  const current = context.current;
  const next = context.next;
  const previous = context.previous;
  const hybrid = context.hybrid;

  if (d === 0) {
    if (lunarMonth === '腊月') {
      return hybrid;
    }
    if (lunarMonth === '冬月') {
      return current;
    }
    return solarMonth > 9 ? next : current;
  }

  if (d > 1 && d <= 6) {
    if (lunarMonth === '腊月') {
      return hybrid;
    }
    if (lunarMonth === '冬月') {
      return jieQiName === '冬至' ? current : previous;
    }
    if (solarMonth >= 9) {
      if (lunarDay < 15) {
        return hybrid;
      }
      return isWuJi ? current : previous;
    }
    if (lunarMonth === '正月') {
      if (lunarDay < 10 && !isWuJi) {
        return previous;
      }
      if (isWuJi) {
        if (lunarDay < 20) {
          return hybrid;
        }
        if (lunarDay > 20 && lunarDay <= 26) {
          return previous;
        }
        return hybrid;
      }
    }
    if (!['腊月', '冬月', '正月'].includes(lunarMonth) && lunarDay < 15) {
      return current;
    }
    if (lunarDay >= 15) {
      return hybrid;
    }
    return next;
  }

  if (d > 1 && d <= 9) {
    if (lunarMonth === '腊月') {
      return current;
    }
    if (lunarMonth === '冬月') {
      return hybrid;
    }
    if (lunarMonth === '正月') {
      return solarMonth <= 9 && lunarDay >= 15 ? hybrid : isWuJi ? hybrid : next;
    }
    if (solarMonth <= 6) {
      if (lunarDay <= 10) {
        return hybrid;
      }
      if (isWuJi) {
        return lunarDay < 20 ? next : hybrid;
      }
      return current;
    }
    if (solarMonth <= 9) {
      if (lunarDay < 15) {
        return next;
      }
      return isWuJi || lunarDay >= 20 ? hybrid : current;
    }
    return next;
  }

  if (d > 1 && d <= 15) {
    if (lunarMonth === '腊月') {
      return hybrid;
    }
    if (lunarMonth === '冬月') {
      return jieQiName !== '冬至' ? hybrid : d <= 12 ? hybrid : current;
    }
    if (solarMonth > 9) {
      return hybrid;
    }
    if (lunarMonth === '正月') {
      return current;
    }
    if (!['正月', '腊月', '冬月'].includes(lunarMonth)) {
      return current;
    }
    return next;
  }

  if (d < 0) {
    return next;
  }

  return current;
}

function calculateJuChaibu(date) {
  const { lunar, jieQiName } = getCurrentJieQiInfo(date);
  const dayGanZhi = lunar.getDayInGanZhiExact?.() || lunar.getDayInGanZhi();
  const yuanIndex = getYuanIndex(dayGanZhi);
  const yinYang = getYinYangByJieQi(jieQiName);
  return createJuDescriptor({
    method: 'chaibu',
    currentJieQi: jieQiName,
    effectiveJieQi: jieQiName,
    yuanIndex,
    yinYang,
    juNum: getJuNum(jieQiName, yuanIndex),
    rule: '拆补正授'
  });
}

function calculateJuZhiRun(date) {
  const context = getZhiRunRawContext(date);
  return selectZhiRunJu(context);
}

export const calculateJu = (date, method = 'chaibu') => {
  try {
    const effectiveMethod = normalizeMethod(method);
    return effectiveMethod === 'zhirun'
      ? calculateJuZhiRun(date)
      : calculateJuChaibu(date);
  } catch (error) {
    console.error('[Qimen] 定局失败:', error);
    return {
      error: error.message || '奇门定局失败'
    };
  }
};

function getSixJiaRoundKeys(juNum, yinYang) {
  const juChar = getPalaceNumChar(juNum);
  return yinYang === '阳'
    ? rotateList(PALACE_NUMS, juChar).slice(0, 6)
    : reverseRotateList(PALACE_NUMS, juChar).slice(0, 6);
}

function buildZhifuPaiMap(juData) {
  const juChar = getPalaceNumChar(juData.juNum);
  const pai = ZHIFU_PAI[juData.isYang ? '阳' : '阴'][juChar];
  const keys = getSixJiaRoundKeys(juData.juNum, juData.isYang ? '阳' : '阴');
  return Object.fromEntries(XUN_HEADS.map((xunHead, index) => [xunHead, `${keys[index]}${pai}`]));
}

function buildZhishiPaiMap(juData) {
  const juChar = getPalaceNumChar(juData.juNum);
  const base = juData.isYang ? rotateList(PALACE_NUMS, juChar) : reverseRotateList(PALACE_NUMS, juChar);
  const longList = [...base, ...base, ...base].join('');
  const keys = getSixJiaRoundKeys(juData.juNum, juData.isYang ? '阳' : '阴');

  return Object.fromEntries(XUN_HEADS.map((xunHead, index) => {
    const start = keys[index];
    const startIndex = longList.indexOf(start);
    return [xunHead, `${start}${longList.slice(startIndex + 1, startIndex + 12)}`];
  }));
}

function getZhifuZhiShi(juData, hourGanZhi) {
  const hourStem = hourGanZhi[0];
  const hourStemIndex = GANS.indexOf(hourStem);
  if (hourStemIndex === -1) {
    throw new Error(`无法解析时干: ${hourGanZhi}`);
  }

  const xunHead = getHourXunHead(hourGanZhi);
  const hiddenStem = getHiddenStemByXunHead(xunHead);
  const zhifuPai = buildZhifuPaiMap(juData);
  const zhishiPai = buildZhishiPaiMap(juData);
  const zhifuValue = zhifuPai[xunHead];
  const zhishiValue = zhishiPai[xunHead];

  if (!zhifuValue || !zhishiValue) {
    throw new Error(`无法获取值符值使排布: xunHead=${xunHead}`);
  }

  const zhiFuStarShort = ZHIFU_STAR_MAPPING[PALACE_NUMS.indexOf(zhifuValue[0])];
  const zhiFuPalace = PALACE_NAME_BY_NUM[zhifuValue[hourStemIndex]];
  const zhiShiDoorShort = ZHISHI_MAPPING[PALACE_NUMS.indexOf(zhishiValue[0])] === '中'
    ? '死'
    : ZHISHI_MAPPING[PALACE_NUMS.indexOf(zhishiValue[0])];
  const zhiShiPalace = PALACE_NAME_BY_NUM[zhishiValue[hourStemIndex]];

  return {
    xunHead,
    hiddenStem,
    zhiFuStarShort,
    zhiFuStar: FULL_STAR_NAME[zhiFuStarShort] || zhiFuStarShort,
    zhiFuPalace,
    zhiShiDoorShort,
    zhiShiGate: FULL_DOOR_NAME[zhiShiDoorShort] || zhiShiDoorShort,
    zhiShiPalace
  };
}

function buildEarthPlate(juData) {
  const juChar = getPalaceNumChar(juData.juNum);
  const palaceSeq = rotateList(PALACE_NUMS, juChar);
  const stems = EARTH_STEMS[juData.isYang ? '阳' : '阴'];
  const earthByGua = {};

  palaceSeq.forEach((palaceNum, index) => {
    const palaceName = PALACE_NAME_BY_NUM[palaceNum];
    earthByGua[palaceName] = stems[index];
  });

  return earthByGua;
}

function normalizeOuterPalace(palaceName) {
  return palaceName === '中' ? '坤' : normalizeJieQiName(palaceName);
}

function buildStarPlate(juData, zhifuInfo) {
  const rotatePalaces = juData.isYang ? CLOCKWISE_EIGHT_PALACES : [...CLOCKWISE_EIGHT_PALACES].reverse();
  const startPalace = normalizeOuterPalace(zhifuInfo.zhiFuPalace);
  const palaceOrder = rotateList(rotatePalaces, startPalace);
  const starBase = juData.isYang ? STAR_ROTATE_BASE : [...STAR_ROTATE_BASE].reverse();
  const startStar = zhifuInfo.zhiFuStarShort === '芮' ? '禽' : zhifuInfo.zhiFuStarShort;
  const starOrder = rotateList(starBase, startStar);

  return Object.fromEntries(palaceOrder.map((palaceName, index) => {
    const shortName = starOrder[index];
    return [palaceName, FULL_STAR_NAME[shortName] || shortName];
  }));
}

function buildDoorPlate(juData, zhifuInfo) {
  const rotatePalaces = juData.isYang ? CLOCKWISE_EIGHT_PALACES : [...CLOCKWISE_EIGHT_PALACES].reverse();
  const startPalace = normalizeOuterPalace(zhifuInfo.zhiShiPalace);
  const palaceOrder = rotateList(rotatePalaces, startPalace);
  const doorBase = juData.isYang ? DOOR_ROTATE_BASE : [...DOOR_ROTATE_BASE].reverse();
  const doorOrder = rotateList(doorBase, zhifuInfo.zhiShiDoorShort);

  return Object.fromEntries(palaceOrder.map((palaceName, index) => [
    palaceName,
    FULL_DOOR_NAME[doorOrder[index]] || doorOrder[index]
  ]));
}

function buildGodPlate(juData, zhifuInfo) {
  const rotatePalaces = juData.isYang ? CLOCKWISE_EIGHT_PALACES : [...CLOCKWISE_EIGHT_PALACES].reverse();
  const startPalace = normalizeOuterPalace(zhifuInfo.zhiFuPalace);
  const palaceOrder = rotateList(rotatePalaces, startPalace);
  const godOrder = GOD_ROTATE_BASE[juData.isYang ? '阳' : '阴'];

  return Object.fromEntries(palaceOrder.map((palaceName, index) => [palaceName, godOrder[index]]));
}

function getStarShortFromFullName(fullName) {
  return Object.entries(FULL_STAR_NAME).find(([, value]) => value === fullName)?.[0] || '';
}

function buildSkyStemPlate(earthByGua, starByGua) {
  const skyStemByGua = {
    '中': earthByGua['中']
  };

  Object.entries(starByGua).forEach(([palaceName, starFullName]) => {
    const starShort = getStarShortFromFullName(starFullName);
    const sourcePalace = STAR_HOME_PALACE[starShort] || palaceName;
    skyStemByGua[palaceName] = earthByGua[sourcePalace] || earthByGua[palaceName] || '';
  });

  return skyStemByGua;
}

function convertPlateByGuaToIdMap(plateByGua, includeCenter = true) {
  const result = {};
  if (includeCenter) {
    result[5] = plateByGua['中'] || '';
  }
  Object.entries(plateByGua).forEach(([palaceName, value]) => {
    const palaceId = PALACE_ID_BY_NAME[palaceName];
    if (palaceId && palaceId !== 5) {
      result[palaceId] = value;
    }
  });
  return result;
}

function getKongWangPalaces(hourXunKong) {
  const kongWangPalaces = [];
  if (!hourXunKong) {
    return kongWangPalaces;
  }
  for (const zhi of hourXunKong) {
    const palaceId = BRANCH_TO_PALACE[zhi];
    if (palaceId && !kongWangPalaces.includes(palaceId)) {
      kongWangPalaces.push(palaceId);
    }
  }
  return kongWangPalaces;
}

function getMaXing(hourBranch) {
  return BRANCH_HORSE_MAP[hourBranch] || '';
}

function buildAnGan(juData, hourStem, hiddenStem, renPan, zhiShiGate) {
  const startStem = hourStem === '甲' ? hiddenStem : hourStem;
  const startStemIndex = AN_GAN_SEQUENCE.indexOf(startStem);
  if (startStemIndex === -1) {
    throw new Error(`无法确定暗干起始时干: ${startStem}`);
  }

  let zhiShiPalace = Number(Object.entries(renPan).find(([, gate]) => gate === zhiShiGate)?.[0] || 0);
  if (zhiShiPalace === 0) {
    zhiShiPalace = 2;
    console.warn('[Qimen] 未定位到值使门落宫，暗干起宫回退到坤二宫');
  }

  const anGan = {};
  for (let i = 0; i < 9; i += 1) {
    const stem = AN_GAN_SEQUENCE[(startStemIndex + i) % AN_GAN_SEQUENCE.length];
    let palaceId;
    if (juData.isYang) {
      palaceId = ((zhiShiPalace - 1 + i) % 9) + 1;
    } else {
      let value = (zhiShiPalace - 1 - i) % 9;
      if (value < 0) {
        value += 9;
      }
      palaceId = value + 1;
    }
    anGan[palaceId] = stem;
  }
  return anGan;
}

export const getPaiPan = (date, method = 'chaibu') => {
  try {
    const ju = calculateJu(date, method);
    if (ju.error) {
      return ju;
    }

    const solar = Solar.fromDate(date);
    const lunar = solar.getLunar();
    const yearGanZhi = lunar.getYearInGanZhiExact?.() || lunar.getYearInGanZhi();
    const monthGanZhi = lunar.getMonthInGanZhiExact?.() || lunar.getMonthInGanZhi();
    const dayGanZhi = lunar.getDayInGanZhiExact?.() || lunar.getDayInGanZhi();
    const hourGanZhi = lunar.getTimeInGanZhi();
    const dayXunKong = lunar.getDayXunKong();
    const hourXunKong = lunar.getTimeXunKong();
    const hourStem = hourGanZhi[0];
    const hourBranch = hourGanZhi[1];

    const earthByGua = buildEarthPlate(ju);
    const zhifuInfo = getZhifuZhiShi(ju, hourGanZhi);
    const starByGua = buildStarPlate(ju, zhifuInfo);
    const doorByGua = buildDoorPlate(ju, zhifuInfo);
    const godByGua = buildGodPlate(ju, zhifuInfo);
    const skyStemByGua = buildSkyStemPlate(earthByGua, starByGua);

    const diPan = convertPlateByGuaToIdMap(earthByGua);
    const tianPan = convertPlateByGuaToIdMap(starByGua);
    const renPan = convertPlateByGuaToIdMap(doorByGua, false);
    const shenPan = convertPlateByGuaToIdMap(godByGua, false);
    const tianPanStems = convertPlateByGuaToIdMap(skyStemByGua);
    const maXing = getMaXing(hourBranch);
    const maXingPalace = BRANCH_TO_PALACE[maXing] || 0;
    const kongWangPalaces = getKongWangPalaces(hourXunKong);
    const anGan = buildAnGan(ju, hourStem, zhifuInfo.hiddenStem, renPan, zhifuInfo.zhiShiGate);

    return {
      ...ju,
      method: normalizeMethod(method),
      yearGanZhi,
      monthGanZhi,
      dayGanZhi,
      hourGanZhi,
      dayXunKong,
      hourXunKong,
      maXing,
      maXingPalace,
      kongWangPalaces,
      anGan,
      xun: zhifuInfo.xunHead,
      zhiFuStar: zhifuInfo.zhiFuStar,
      zhiShiGate: zhifuInfo.zhiShiGate,
      zhiFuPalace: zhifuInfo.zhiFuPalace,
      zhiShiPalace: zhifuInfo.zhiShiPalace,
      diPan,
      tianPan,
      renPan,
      shenPan,
      tianPanStems
    };
  } catch (error) {
    console.error('[Qimen] 排盘失败:', error);
    return {
      error: error.message || '奇门排盘失败'
    };
  }
};
