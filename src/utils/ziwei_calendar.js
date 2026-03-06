import { Lunar } from 'lunar-javascript';

const LOGGER_PREFIX = '[ZiWeiCalendar]';
const BRANCH_ORDER = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

const normalizeSpaceSeparatedText = (text) => {
  if (typeof text !== 'string') {
    return '未提供';
  }

  const normalizedText = text.trim().replace(/\s+/g, ' ');
  return normalizedText || '未提供';
};

export const resolveZiWeiBirthClockDate = (birthDateInfo) => {
  try {
    if (!birthDateInfo || typeof birthDateInfo !== 'object') {
      console.warn(`${LOGGER_PREFIX} 缺少出生时间信息，无法推导农历与四柱`);
      return null;
    }

    const {
      year,
      month,
      day,
      hour,
      minute
    } = birthDateInfo;

    if (![year, month, day, hour, minute].every(Number.isFinite)) {
      console.warn(`${LOGGER_PREFIX} 出生时间信息不完整，无法推导农历与四柱`, birthDateInfo);
      return null;
    }

    return new Date(year, month - 1, day, hour, minute, 0, 0);
  } catch (error) {
    console.error(`${LOGGER_PREFIX} 解析出生公历时间失败`, error);
    return null;
  }
};

export const buildZiWeiLunarMeta = (birthDate, chineseDate) => {
  try {
    if (!(birthDate instanceof Date) || Number.isNaN(birthDate.getTime())) {
      return {
        lunarTimeText: '未提供',
        seasonalFourPillars: '未提供',
        normalFourPillars: normalizeSpaceSeparatedText(chineseDate),
        childYearDouJun: '未提供'
      };
    }

    const lunar = Lunar.fromDate(birthDate);
    const timeBranch = lunar.getTimeZhi();
    const timeBranchIndex = BRANCH_ORDER.indexOf(timeBranch);
    const lunarMonth = Math.abs(Number(lunar.getMonth()));
    const lunarTimeText = `${lunar.getYearInGanZhiExact()}年${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}日${timeBranch}时`;
    const seasonalFourPillars = lunar.getBaZi().join(' ');
    const normalFourPillars = normalizeSpaceSeparatedText(chineseDate);
    const childYearDouJun = timeBranchIndex >= 0 && lunarMonth > 0
      ? BRANCH_ORDER[(lunarMonth - 1 + timeBranchIndex) % 12]
      : '未提供';

    return {
      lunarTimeText,
      seasonalFourPillars,
      normalFourPillars,
      childYearDouJun
    };
  } catch (error) {
    console.error(`${LOGGER_PREFIX} 推导农历与四柱失败`, error);
    return {
      lunarTimeText: '未提供',
      seasonalFourPillars: '未提供',
      normalFourPillars: normalizeSpaceSeparatedText(chineseDate),
      childYearDouJun: '未提供'
    };
  }
};
