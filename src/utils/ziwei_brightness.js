const LOGGER_PREFIX = '[ZiWeiBrightness]';
const EARTHLY_BRANCH_ORDER = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 这些补表用于补齐 iztro 默认未提供亮度的辅星/杂曜。
// 子丑寅卯辰巳午未申酉戌亥顺序来自中州派总表与常用庙旺规则。
const STAR_BRIGHTNESS_TABLE = {
  左辅: ['旺', '庙', '旺', '旺', '庙', '旺', '旺', '庙', '旺', '旺', '庙', '旺'],
  右弼: ['旺', '庙', '旺', '旺', '庙', '旺', '旺', '庙', '旺', '旺', '庙', '旺'],
  禄存: ['旺', '庙', '平', '旺', '庙', '平', '旺', '庙', '平', '旺', '庙', '平'],
  天马: ['平', '庙', '旺', '平', '庙', '旺', '平', '庙', '旺', '平', '庙', '旺'],
  文昌: ['旺', '庙', '陷', '平', '旺', '庙', '陷', '平', '旺', '庙', '陷', '旺'],
  文曲: ['庙', '庙', '平', '旺', '庙', '庙', '陷', '旺', '平', '庙', '陷', '旺'],
  地空: ['平', '陷', '陷', '平', '陷', '庙', '庙', '平', '庙', '庙', '陷', '陷'],
  地劫: ['陷', '陷', '平', '平', '陷', '闲', '庙', '平', '庙', '平', '平', '旺'],
  红鸾: ['陷', '庙', '旺', '陷', '庙', '旺', '陷', '庙', '旺', '陷', '庙', '旺'],
  天喜: ['陷', '庙', '旺', '陷', '庙', '旺', '陷', '庙', '旺', '陷', '庙', '旺'],
  天哭: ['庙', '平', '旺', '庙', '旺', '陷', '陷', '陷', '陷', '庙', '庙', '庙'],
  天虚: ['庙', '平', '旺', '庙', '旺', '陷', '陷', '陷', '陷', '庙', '庙', '庙'],
  天寿: ['平', '庙', '旺', '陷', '庙', '平', '平', '旺', '旺', '平', '庙', '旺'],
  天才: ['旺', '平', '庙', '旺', '陷', '庙', '旺', '平', '庙', '旺', '陷', '庙'],
  天使: ['陷', '陷', '平', '平', '陷', '平', '平', '平', '平', '陷', '陷', '旺'],
  天伤: ['陷', '平', '平', '陷', '平', '平', '陷', '陷', '平', '平', '平', '旺'],
  天贵: ['庙', '旺', '平', '旺', '旺', '平', '庙', '旺', '陷', '庙', '旺', '平'],
  恩光: ['平', '庙', '平', '庙', '庙', '平', '庙', '旺', '平', '陷', '庙', '闲'],
  八座: ['陷', '庙', '庙', '平', '旺', '庙', '旺', '平', '庙', '庙', '平', '庙'],
  三台: ['平', '庙', '平', '陷', '庙', '平', '旺', '庙', '平', '庙', '旺', '平'],
  旬空: ['陷', '平', '陷', '平', '陷', '庙', '庙', '陷', '庙', '庙', '陷', '平'],
  副旬: ['陷', '平', '陷', '平', '陷', '庙', '庙', '陷', '庙', '庙', '陷', '平']
};

// 这里补的是与文墨天机当前盘实测一致、且需要覆盖默认值的分宫亮度。
const STAR_BRIGHTNESS_BRANCH_OVERRIDE = {
  天福: { 子: '平' },
  天伤: { 子: '陷' },
  天哭: { 子: '平' },
  天虚: { 子: '陷' },
  天姚: { 丑: '平' },
  天喜: { 卯: '旺' },
  咸池: { 卯: '平' },
  天德: { 卯: '平' },
  凤阁: { 辰: '陷' },
  截空: { 辰: '陷' },
  截路: { 辰: '陷' },
  寡宿: { 辰: '陷' },
  年解: { 辰: '庙' },
  禄存: { 巳: '庙' },
  天官: { 巳: '旺' },
  破碎: { 巳: '陷' },
  天空: { 未: '陷' },
  解神: { 申: '不' },
  孤辰: { 申: '平' },
  天钺: { 酉: '庙' },
  红鸾: { 酉: '旺' },
  天刑: { 酉: '庙' },
  龙池: { 戌: '陷' },
  华盖: { 戌: '平' },
  天魁: { 亥: '旺' },
  副截: { 巳: '庙' },
  大耗: { 丑: '平' }
};

const normalizeBrightness = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
};

const getBrightnessFromTable = (starName, earthlyBranch) => {
  const brightnessList = STAR_BRIGHTNESS_TABLE[starName];
  const branchIndex = EARTHLY_BRANCH_ORDER.indexOf(earthlyBranch);

  if (!brightnessList || branchIndex < 0) {
    return '';
  }

  return normalizeBrightness(brightnessList[branchIndex]);
};

const getBrightnessOverride = (starName, earthlyBranch) => normalizeBrightness(
  STAR_BRIGHTNESS_BRANCH_OVERRIDE[starName]?.[earthlyBranch]
);

export const resolveZiWeiStarBrightness = (star, earthlyBranch) => {
  try {
    const overrideBrightness = getBrightnessOverride(star?.name, earthlyBranch);

    if (overrideBrightness) {
      return overrideBrightness;
    }

    const currentBrightness = normalizeBrightness(star?.brightness);

    if (currentBrightness) {
      return currentBrightness;
    }

    if (!star?.name || !earthlyBranch) {
      return '';
    }

    return getBrightnessFromTable(star.name, earthlyBranch);
  } catch (error) {
    console.error(`${LOGGER_PREFIX} 计算星曜亮度失败`, {
      starName: star?.name,
      earthlyBranch,
      error
    });

    return '';
  }
};
