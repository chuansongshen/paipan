import { Lunar } from 'lunar-javascript';
import { getZiWeiStarDisplayName } from './ziwei_naming.js';

const LOGGER_PREFIX = '[ZiWeiCopy]';
const COPY_DEFAULT_LONGITUDE = 120;
const COPY_DEFAULT_TIMEZONE_OFFSET = 8;
const COPY_YEARLY_AGE_LIMIT = 5;
const BRANCH_ORDER = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const ANALYSIS_PROMPT_LINES = [
  '你现在是一位研究紫微斗数超过30年的资深命理专家，同时也是术数研究学者，精通以下体系：',
  '',
  '- 三合派紫微斗数',
  '- 飞星派紫微斗数',
  '- 河洛派紫微斗数',
  '- 钦天四化体系',
  '',
  '你擅长通过命盘结构、三方四正、四化飞星、大限流年等多层信息进行综合推演，形成严谨的命理结论。',
  '',
  '你的任务是对提供的【文墨天机紫微斗数命盘】进行一份完整、系统、专业的命盘分析报告。',
  '',
  '请遵循以下原则：',
  '',
  '1、先整体判断命盘结构，再逐层深入分析',
  '2、所有结论必须基于命盘结构推演，而不是泛泛描述',
  '3、优先识别命盘关键结构与重要格局',
  '4、分析需要逻辑清晰、结构完整',
  '5、避免过度神秘化语言',
  '6、在信息不足时进行合理推演，但不要随意编造',
  '',
  '分析步骤必须按照以下结构进行：',
  '',
  '------------------------------------------------',
  '',
  '【第一部分：命盘整体格局】',
  '',
  '请分析：',
  '',
  '1、命宫主星格局',
  '2、身宫位置及其影响',
  '3、命主星与身主星作用',
  '4、五行局对命格的影响',
  '5、命盘整体格局层级（高格 / 中格 / 平格）',
  '6、是否形成特殊格局，例如：',
  '',
  '机月同梁格',
  '杀破狼格',
  '紫府同宫格',
  '日月并明格',
  '贪武同行格',
  '巨门格',
  '天机多动格等',
  '',
  '总结：',
  '',
  '- 命格类型',
  '- 人生整体运势走势',
  '- 命主核心性格特征',
  '',
  '------------------------------------------------',
  '',
  '【第二部分：命盘能量结构】',
  '',
  '从整体结构分析命盘：',
  '',
  '1、三方四正结构',
  '2、星曜庙旺陷分布',
  '3、吉星与煞星比例',
  '4、命盘能量流向',
  '',
  '判断：',
  '',
  '- 哪些宫位是命盘核心宫位',
  '- 哪些宫位是风险宫位',
  '- 命盘是否存在结构性矛盾',
  '',
  '总结命盘整体优劣。',
  '',
  '------------------------------------------------',
  '',
  '【第三部分：十二宫位深度分析】',
  '',
  '逐宫分析十二宫：',
  '',
  '命宫',
  '兄弟宫',
  '夫妻宫',
  '子女宫',
  '财帛宫',
  '疾厄宫',
  '迁移宫',
  '交友宫',
  '官禄宫',
  '田宅宫',
  '福德宫',
  '父母宫',
  '',
  '每个宫位必须分析：',
  '',
  '1、主星组合含义',
  '2、辅星与小星影响',
  '3、庙旺陷状态',
  '4、三方四正互动',
  '5、四化星影响',
  '6、宫位吉凶等级（高 / 中 / 低）',
  '',
  '并具体说明对以下领域的影响：',
  '',
  '性格',
  '学业',
  '事业',
  '财运',
  '婚姻',
  '人际',
  '家庭',
  '健康',
  '',
  '------------------------------------------------',
  '',
  '【第四部分：四化飞星系统】',
  '',
  '重点分析：',
  '',
  '生年四化',
  '宫干四化',
  '飞宫四化',
  '向心自化',
  '离心自化',
  '',
  '解释：',
  '',
  '- 四化流动路径',
  '- 被引动的宫位',
  '- 可能触发的重大人生事件',
  '',
  '指出命盘中的关键能量链条。',
  '',
  '------------------------------------------------',
  '',
  '【第五部分：大限运势分析】',
  '',
  '命盘包含十二个大限。',
  '',
  '重点分析：',
  '',
  '前八个大限（0岁至83岁）',
  '',
  '每个大限需要分析：',
  '',
  '- 大限宫位',
  '- 大限主星',
  '- 大限格局变化',
  '- 大限四化影响',
  '- 该阶段人生主题',
  '',
  '输出：',
  '',
  '运势评分（1-10）',
  '主要机遇',
  '主要挑战',
  '',
  '------------------------------------------------',
  '',
  '【第六部分：流年分析】',
  '',
  '命盘包含每个大限10个流年。',
  '',
  '请分析前八个大限所有流年。',
  '',
  '每个流年需说明：',
  '',
  '- 运势主题',
  '- 可能发生的重要事件',
  '- 事件类型（事业/财富/婚姻/健康/家庭/学业）',
  '- 吉凶判断',
  '- 影响程度（低 / 中 / 高）',
  '',
  '建议使用时间轴表格形式。',
  '',
  '------------------------------------------------',
  '',
  '【第七部分：人生关键转折点】',
  '',
  '结合命盘与大限流年，预测：',
  '',
  '5-10个重要人生节点。',
  '',
  '例如：',
  '',
  '事业突破',
  '财富积累',
  '婚姻变化',
  '人生转折',
  '',
  '每个节点需说明：',
  '',
  '年龄范围',
  '事件性质',
  '吉凶判断',
  '影响程度',
  '',
  '------------------------------------------------',
  '',
  '【第八部分：人生总体评价】',
  '',
  '综合命盘分析：',
  '',
  '人生成就潜力',
  '财富层级潜力',
  '事业发展路径',
  '婚姻感情趋势',
  '健康风险',
  '',
  '总结命主一生发展主线。',
  '',
  '------------------------------------------------',
  '',
  '【第九部分：现实建议】',
  '',
  '根据命盘特点，提出现实可执行建议：',
  '',
  '职业方向',
  '财富管理',
  '婚姻关系',
  '健康养生',
  '人际关系',
  '',
  '------------------------------------------------',
  '',
  '【第十部分：总结】',
  '',
  '简要总结：',
  '',
  '命格层级',
  '人生关键阶段',
  '未来发展重点',
  '',
  '------------------------------------------------',
  '',
  '最后必须提醒：',
  '',
  '本分析仅供传统文化研究与娱乐参考，不应作为现实决策依据。',
  '',
  '------------------------------------------------',
  '',
  '下面是需要分析的文墨天机紫微斗数命盘数据：'
];

const padNumber = (value) => String(value).padStart(2, '0');

const resolveBirthClockDate = (panData) => {
  const birthDateInfo = panData?.birthDateInfo;

  if (!birthDateInfo || typeof birthDateInfo !== 'object') {
    console.warn(`${LOGGER_PREFIX} 缺少出生时间信息，复制文本将回退为现有日期字段`);
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
    console.warn(`${LOGGER_PREFIX} 出生时间信息不完整，复制文本将回退为现有日期字段`, birthDateInfo);
    return null;
  }

  return new Date(year, month - 1, day, hour, minute, 0, 0);
};

const formatClockDateTime = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return '未提供';
  }

  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${padNumber(date.getHours())}:${padNumber(date.getMinutes())}`;
};

const getDayOfYear = (date) => {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  const oneDay = 24 * 60 * 60 * 1000;

  return Math.floor(diff / oneDay);
};

// 使用常见的时间差近似公式推真太阳时，复制文本场景下精度足够稳定。
const calculateEquationOfTimeMinutes = (date) => {
  const dayOfYear = getDayOfYear(date);
  const angle = (2 * Math.PI * (dayOfYear - 81)) / 364;

  return (9.87 * Math.sin(2 * angle)) - (7.53 * Math.cos(angle)) - (1.5 * Math.sin(angle));
};

const buildTrueSolarDate = (date, longitude = COPY_DEFAULT_LONGITUDE) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return null;
  }

  const standardMeridian = COPY_DEFAULT_TIMEZONE_OFFSET * 15;
  const longitudeCorrectionMinutes = (longitude - standardMeridian) * 4;
  const equationOfTimeMinutes = calculateEquationOfTimeMinutes(date);
  const totalCorrectionMinutes = longitudeCorrectionMinutes + equationOfTimeMinutes;

  return new Date(date.getTime() + Math.round(totalCorrectionMinutes * 60 * 1000));
};

const formatLongitude = (longitude = COPY_DEFAULT_LONGITUDE) => longitude.toFixed(3);

const normalizeSpaceSeparatedText = (text) => {
  if (typeof text !== 'string') {
    return '未提供';
  }

  const normalizedText = text.trim().replace(/\s+/g, ' ');
  return normalizedText || '未提供';
};

const appendPalaceSuffix = (palaceName) => {
  if (typeof palaceName !== 'string') {
    return '未识别宫';
  }

  const normalizedName = palaceName.trim();

  if (!normalizedName) {
    return '未识别宫';
  }

  return normalizedName.endsWith('宫') ? normalizedName : `${normalizedName}宫`;
};

const formatMutagenTags = (star) => {
  const tags = [];

  if (star?.brightness) {
    tags.push(`[${star.brightness}]`);
  }

  if (star?.mutagen) {
    tags.push(`[生年${star.mutagen}]`);
  }

  const selfMutagens = Array.isArray(star?.selfMutagens)
    ? star.selfMutagens.filter((item) => typeof item === 'string' && item.trim())
    : [];

  selfMutagens.forEach((mutagen) => {
    tags.push(`[自化${mutagen}]`);
  });

  return tags.join('');
};

const formatStarLabel = (star) => {
  if (!star || typeof star !== 'object') {
    return '未识别';
  }

  const displayName = getZiWeiStarDisplayName(star.name || '');
  return `${displayName}${formatMutagenTags(star)}`;
};

const formatStarGroup = (stars = []) => {
  const safeStars = Array.isArray(stars)
    ? stars.filter((star) => star && typeof star === 'object')
    : [];

  if (safeStars.length === 0) {
    return '无';
  }

  return safeStars.map((star) => formatStarLabel(star)).join(',');
};

const sortPalacesForCopy = (palaces = []) => {
  const safePalaces = Array.isArray(palaces)
    ? palaces.filter((palace) => palace && typeof palace === 'object')
    : [];

  return [...safePalaces].sort((prev, next) => {
    const prevIndex = BRANCH_ORDER.indexOf(prev.earthlyBranch);
    const nextIndex = BRANCH_ORDER.indexOf(next.earthlyBranch);

    if (prevIndex === -1 || nextIndex === -1) {
      return (prev.index || 0) - (next.index || 0);
    }

    return prevIndex - nextIndex;
  });
};

const normalizeAgeToCycle = (age) => {
  if (!Number.isFinite(age) || age <= 0) {
    return 1;
  }

  return ((age - 1) % 12) + 1;
};

const buildYearlyAgeMap = (panData) => {
  const palaceMap = new Map();
  const palaces = Array.isArray(panData?.palaces) ? panData.palaces : [];
  const currentNominalAge = Number(panData?.horoscope?.age?.nominalAge || 0);
  const yearlyPalaceNames = Array.isArray(panData?.horoscope?.yearly?.palaceNames)
    ? panData.horoscope.yearly.palaceNames
    : [];
  const currentLifePalaceIndex = yearlyPalaceNames.findIndex((palaceName) => palaceName === '命宫');

  if (currentNominalAge <= 0 || currentLifePalaceIndex < 0) {
    return palaceMap;
  }

  palaces.forEach((palace, fallbackIndex) => {
    const palaceIndex = Number.isInteger(palace?.index) ? palace.index : fallbackIndex;
    const offset = (palaceIndex - currentLifePalaceIndex + 12) % 12;
    const startAge = normalizeAgeToCycle(currentNominalAge - offset);
    const ages = Array.from({ length: COPY_YEARLY_AGE_LIMIT }, (_, index) => startAge + (index * 12));

    palaceMap.set(palaceIndex, ages);
  });

  return palaceMap;
};

const formatAgeList = (ages = []) => {
  const safeAges = Array.isArray(ages)
    ? ages.filter((age) => Number.isFinite(age)).slice(0, COPY_YEARLY_AGE_LIMIT)
    : [];

  return safeAges.length > 0 ? `${safeAges.join(',')}虚岁` : '未提供';
};

const formatDecadalRange = (range = []) => {
  if (!Array.isArray(range) || range.length < 2) {
    return '未提供';
  }

  return `${range[0]}~${range[1]}虚岁`;
};

const buildLunarMeta = (birthDate, panData) => {
  if (!(birthDate instanceof Date) || Number.isNaN(birthDate.getTime())) {
    return {
      lunarTimeText: '未提供',
      seasonalFourPillars: '未提供',
      normalFourPillars: normalizeSpaceSeparatedText(panData?.chineseDate),
      childYearDouJun: '未提供'
    };
  }

  const lunar = Lunar.fromDate(birthDate);
  const timeBranch = lunar.getTimeZhi();
  const timeBranchIndex = BRANCH_ORDER.indexOf(timeBranch);
  const lunarMonth = Math.abs(Number(lunar.getMonth()));
  const lunarTimeText = `${lunar.getYearInGanZhiExact()}年${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}日${timeBranch}时`;
  const seasonalFourPillars = lunar.getBaZi().join(' ');
  const normalFourPillars = normalizeSpaceSeparatedText(panData?.chineseDate);
  const childYearDouJun = timeBranchIndex >= 0 && lunarMonth > 0
    ? BRANCH_ORDER[(lunarMonth - 1 + timeBranchIndex) % 12]
    : '未提供';

  return {
    lunarTimeText,
    seasonalFourPillars,
    normalFourPillars,
    childYearDouJun
  };
};

const formatPalaceHeader = (palace) => {
  const palaceLabel = appendPalaceSuffix(palace?.name);
  const suffixes = [];

  if (palace?.isOriginalPalace) {
    suffixes.push('[来因]');
  }

  if (palace?.isBodyPalace) {
    suffixes.push('[身宫]');
  }

  return `${palaceLabel}[${palace?.heavenlyStem || ''}${palace?.earthlyBranch || ''}]${suffixes.join('')}`;
};

const buildPalaceBlockLines = (palace, yearlyAgeMap) => {
  const palaceIndex = Number.isInteger(palace?.index) ? palace.index : -1;
  const yearlyAges = yearlyAgeMap.get(palaceIndex) || [];

  return [
    `│ │ ├主星 : ${formatStarGroup(palace?.majorStars)}`,
    `│ │ ├辅星 : ${formatStarGroup(palace?.minorStars)}`,
    `│ │ ├小星 : ${formatStarGroup(palace?.adjectiveStars)}`,
    '│ │ ├神煞',
    `│ │ │ ├岁前星 : ${palace?.suiqian12 || '未提供'}`,
    `│ │ │ ├将前星 : ${palace?.jiangqian12 || '未提供'}`,
    `│ │ │ ├十二长生 : ${palace?.changsheng12 || '未提供'}`,
    `│ │ │ └太岁煞禄 : ${palace?.boshi12 || '未提供'}`,
    `│ │ ├大限 : ${formatDecadalRange(palace?.decadal?.range)}`,
    `│ │ ├小限 : ${formatAgeList(palace?.ages)}`,
    `│ │ ├流年 : ${formatAgeList(yearlyAges)}`,
    '│ │ └限流叠宫 : 无'
  ];
};

export const buildZiWeiCopyText = (panData) => {
  try {
    if (!panData || typeof panData !== 'object') {
      throw new Error('紫微斗数排盘数据无效');
    }

    const birthDate = resolveBirthClockDate(panData);
    const trueSolarDate = buildTrueSolarDate(birthDate, COPY_DEFAULT_LONGITUDE);
    const lunarMeta = buildLunarMeta(birthDate, panData);
    const yearlyAgeMap = buildYearlyAgeMap(panData);
    const palaces = sortPalacesForCopy(panData.palaces);
    const lines = [
      ...ANALYSIS_PROMPT_LINES,
      '',
      '├基本信息',
      '│ │',
      `│ ├性别 : ${panData.gender || '未提供'}`,
      `│ ├地理经度 : ${formatLongitude(COPY_DEFAULT_LONGITUDE)}`,
      `│ ├钟表时间 : ${formatClockDateTime(birthDate)}`,
      `│ ├真太阳时 : ${formatClockDateTime(trueSolarDate)}`,
      `│ ├农历时间 : ${lunarMeta.lunarTimeText}`,
      `│ ├节气四柱 : ${lunarMeta.seasonalFourPillars}`,
      `│ ├非节气四柱 : ${lunarMeta.normalFourPillars}`,
      `│ ├五行局数 : ${panData.fiveElementsClass || '未提供'}`,
      `│ └身主:${panData.body || '未提供'}; 命主:${panData.soul || '未提供'}; 子年斗君:${lunarMeta.childYearDouJun}; 身宫:${panData.earthlyBranchOfBodyPalace || '未提供'}`,
      '│',
      '├命盘十二宫',
      '│ │'
    ];

    palaces.forEach((palace, index) => {
      const isLastPalace = index === palaces.length - 1;
      const palacePrefix = isLastPalace ? '└' : '├';

      lines.push(`│ ${palacePrefix}${formatPalaceHeader(palace)}`);
      lines.push(...buildPalaceBlockLines(palace, yearlyAgeMap));

      if (!isLastPalace) {
        lines.push('│ │');
      }
    });

    return lines.join('\n');
  } catch (error) {
    const wrappedError = error instanceof Error
      ? error
      : new Error('紫微斗数复制文本构建失败');

    console.error(`${LOGGER_PREFIX} 构建复制文本失败`, wrappedError);
    throw wrappedError;
  }
};
