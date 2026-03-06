import { astro } from 'iztro';
import { resolveZiWeiStarBrightness } from './ziwei_brightness.js';
import { getZiWeiPalaceDisplayName, getZiWeiStarDisplayName } from './ziwei_naming.js';

const LOGGER_PREFIX = '[ZiWei]';
const ZIWEI_ASTRO_CONFIG = {
  algorithm: 'zhongzhou'
};
const ZIWEI_BRANCH_ORDER = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const ZIWEI_SOUL_STAR_BY_BRANCH = {
  '子': '贪狼',
  '丑': '巨门',
  '寅': '禄存',
  '卯': '文曲',
  '辰': '廉贞',
  '巳': '武曲',
  '午': '破军',
  '未': '武曲',
  '申': '廉贞',
  '酉': '文曲',
  '戌': '禄存',
  '亥': '巨门'
};
const ZIWEI_COMPANION_STAR_RULES = [
  { sourceName: '旬空', companionName: '副旬' },
  { sourceName: '截空', companionName: '副截' }
];

const SUPPORTED_GENDERS = new Set(['男', '女']);
const MUTAGEN_ORDER = ['禄', '权', '科', '忌'];
const CORE_PALACE_NAMES = ['命宫', '财帛', '官禄', '迁移', '夫妻', '福德'];
const AUTO_INSIGHT_LIMIT = 10;
const SURROUNDED_ROLE_CONFIG = [
  { key: 'target', label: '本宫' },
  { key: 'opposite', label: '对宫' },
  { key: 'wealth', label: '财帛位' },
  { key: 'career', label: '官禄位' }
];
const PALACE_TOPIC_MAP = {
  '命宫': '个人状态与人生主轴',
  '财帛': '财务、经营与价值交换',
  '官禄': '事业、职责与执行',
  '迁移': '外部环境、出行与合作场',
  '夫妻': '伴侣、合作与博弈关系',
  '福德': '心态、精神消耗与享受',
  '子女': '项目产出、结果与后续延伸',
  '兄弟': '同辈、人脉与协作',
  '田宅': '资产、居所与存量资源',
  '疾厄': '健康、隐忧与风险管理',
  '交友': '团队、客户与部属',
  '父母': '长辈、支持资源与文书'
};
const MUTAGEN_MESSAGE_MAP = {
  '禄': {
    noun: '资源与机会',
    advice: '适合优先承接能沉淀结果的事项'
  },
  '权': {
    noun: '主导与压力',
    advice: '宜先明确主次、责任与边界'
  },
  '科': {
    noun: '口碑、规则与协助',
    advice: '适合借专业、流程和口碑放大成果'
  },
  '忌': {
    noun: '牵制、反复与消耗',
    advice: '先控预期、成本和节奏，再谈扩张'
  }
};
const SPECIAL_FLY_INSIGHT_MAP = {
  '命宫|忌|财帛': '个人状态容易被财务、投入产出与资源分配牵动，重大决策先看成本与回收。',
  '命宫|忌|官禄': '个人状态容易被事业压力和岗位要求牵动，宜先稳职责边界与节奏。',
  '命宫|忌|迁移': '外部环境、人际往来或出行安排容易牵动自己，避免被外部节奏带着走。',
  '财帛|忌|命宫': '财务与资源问题会直接回到个人状态，宜防现金流焦虑和过度投入。',
  '官禄|禄|命宫': '事业资源和成果容易回流到个人定位，适合沉淀履历、品牌与代表作。',
  '官禄|权|命宫': '事业压力和主导权回到个人，适合扛事，但也要防职责过载。',
  '迁移|禄|官禄': '外部渠道、合作和环境变化有利于事业推进，可主动对接机会。',
  '夫妻|忌|命宫': '关系或合作议题容易反向牵动个人状态，边界与预期要先说清。',
  '福德|忌|命宫': '情绪、内耗和精神负担会回到个人状态，先减压再做重决策。'
};
const SELF_MUTAGEN_STAR_MAP = {
  '甲': { '禄': '廉贞', '权': '破军', '科': '武曲', '忌': '太阳' },
  '乙': { '禄': '天机', '权': '天梁', '科': '紫微', '忌': '太阴' },
  '丙': { '禄': '天同', '权': '天机', '科': '文昌', '忌': '廉贞' },
  '丁': { '禄': '太阴', '权': '天同', '科': '天机', '忌': '巨门' },
  '戊': { '禄': '贪狼', '权': '太阴', '科': '右弼', '忌': '天机' },
  '己': { '禄': '武曲', '权': '贪狼', '科': '天梁', '忌': '文曲' },
  '庚': { '禄': '太阳', '权': '武曲', '科': '太阴', '忌': '天同' },
  '辛': { '禄': '巨门', '权': '太阳', '科': '文曲', '忌': '文昌' },
  '壬': { '禄': '天梁', '权': '紫微', '科': '左辅', '忌': '武曲' },
  '癸': { '禄': '破军', '权': '巨门', '科': '太阴', '忌': '贪狼' }
};

const formatSolarDate = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return `${year}-${month}-${day}`;
};

const padNumber = (value) => String(value).padStart(2, '0');

const formatDateTime = (date) => {
  const year = date.getFullYear();
  const month = padNumber(date.getMonth() + 1);
  const day = padNumber(date.getDate());
  const hour = padNumber(date.getHours());
  const minute = padNumber(date.getMinutes());

  return `${year}-${month}-${day} ${hour}:${minute}`;
};

const formatDateInfo = (date) => ({
  year: date.getFullYear(),
  month: date.getMonth() + 1,
  day: date.getDate(),
  hour: date.getHours(),
  minute: date.getMinutes()
});

const getTimeIndexFromDate = (date) => {
  const hour = date.getHours();

  if (hour === 23) {
    return 12;
  }

  if (hour === 0) {
    return 0;
  }

  return Math.floor((hour + 1) / 2);
};

const formatStar = (star, earthlyBranch) => ({
  name: getZiWeiStarDisplayName(star?.name || ''),
  type: star?.type || '',
  scope: star?.scope || '',
  brightness: resolveZiWeiStarBrightness(star, earthlyBranch),
  mutagen: star?.mutagen || '',
  selfMutagens: []
});

const formatStars = (stars = [], earthlyBranch) => stars.map((star) => formatStar(star, earthlyBranch));

const getStarNames = (stars = []) => stars.map((star) => star.name).filter(Boolean);

const getMajorStarText = (stars = []) => {
  const names = getStarNames(stars);
  return names.length > 0 ? names.join('、') : '无主星';
};

const getPalaceMutagenTags = (palace) => MUTAGEN_ORDER.filter((mutagen) => palace.hasMutagen(mutagen));

const getPalaceSelfMutagens = (palace) => MUTAGEN_ORDER.filter((mutagen) => palace.selfMutagedOneOf([mutagen]));

const attachSelfMutagensToStars = (heavenlyStem, stars, selfMutagens) => {
  const safeStars = Array.isArray(stars) ? stars : [];
  const safeSelfMutagens = Array.isArray(selfMutagens) ? selfMutagens : [];
  const selfStarMap = SELF_MUTAGEN_STAR_MAP[heavenlyStem] || {};
  const unresolvedSelfMutagens = [];

  safeSelfMutagens.forEach((mutagen) => {
    const targetStarName = getZiWeiStarDisplayName(selfStarMap[mutagen] || '');
    const targetStar = targetStarName
      ? safeStars.find((star) => star.name === targetStarName)
      : null;

    if (!targetStar) {
      unresolvedSelfMutagens.push(mutagen);
      return;
    }

    targetStar.selfMutagens = [...new Set([...(targetStar.selfMutagens || []), mutagen])];
  });

  return unresolvedSelfMutagens;
};

const formatPalace = (palace) => {
  const majorStars = formatStars(palace.majorStars, palace.earthlyBranch);
  const minorStars = formatStars(palace.minorStars, palace.earthlyBranch);
  const adjectiveStars = formatStars(palace.adjectiveStars, palace.earthlyBranch);
  const selfMutagens = getPalaceSelfMutagens(palace);
  const allStars = [...majorStars, ...minorStars, ...adjectiveStars];
  const unresolvedSelfMutagens = attachSelfMutagensToStars(palace.heavenlyStem, allStars, selfMutagens);

  return {
    index: palace.index,
    name: getZiWeiPalaceDisplayName(palace.name),
    isBodyPalace: palace.isBodyPalace,
    isOriginalPalace: palace.isOriginalPalace,
    earthlyBranch: palace.earthlyBranch,
    heavenlyStem: palace.heavenlyStem,
    majorStars,
    minorStars,
    adjectiveStars,
    changsheng12: palace.changsheng12,
    boshi12: getZiWeiStarDisplayName(palace.boshi12),
    jiangqian12: getZiWeiStarDisplayName(palace.jiangqian12),
    suiqian12: getZiWeiStarDisplayName(palace.suiqian12),
    decadal: {
      range: palace.decadal.range,
      heavenlyStem: palace.decadal.heavenlyStem,
      earthlyBranch: palace.decadal.earthlyBranch
    },
    ages: [...palace.ages],
    majorStarNames: getStarNames(palace.majorStars),
    minorStarNames: getStarNames(palace.minorStars),
    adjectiveStarNames: getStarNames(palace.adjectiveStars),
    majorStarText: getMajorStarText(palace.majorStars),
    mutagenTags: getPalaceMutagenTags(palace),
    selfMutagens,
    unresolvedSelfMutagens,
    isEmpty: palace.majorStars.length === 0
  };
};

const formatHoroscopeItem = (item) => ({
  index: item.index,
  name: getZiWeiPalaceDisplayName(item.name),
  heavenlyStem: item.heavenlyStem,
  earthlyBranch: item.earthlyBranch,
  palaceNames: [...item.palaceNames].map(getZiWeiPalaceDisplayName),
  mutagen: [...item.mutagen],
  stars: Array.isArray(item.stars)
    ? item.stars.map((group = []) => group.map(formatStar))
    : []
});

const formatHoroscope = (horoscope) => ({
  solarDate: horoscope.solarDate,
  lunarDate: horoscope.lunarDate,
  decadal: formatHoroscopeItem(horoscope.decadal),
  age: {
    ...formatHoroscopeItem(horoscope.age),
    nominalAge: horoscope.age.nominalAge
  },
  yearly: {
    ...formatHoroscopeItem(horoscope.yearly),
    yearlyDecStar: {
      jiangqian12: [...(horoscope.yearly.yearlyDecStar?.jiangqian12 || [])],
      suiqian12: [...(horoscope.yearly.yearlyDecStar?.suiqian12 || [])]
    }
  },
  monthly: formatHoroscopeItem(horoscope.monthly),
  daily: formatHoroscopeItem(horoscope.daily),
  hourly: formatHoroscopeItem(horoscope.hourly)
});

const getPalaceByName = (palaces, palaceName) => palaces.find((item) => item.name === palaceName) || null;

const getPalaceAllStars = (palace) => [
  ...(palace.majorStars || []),
  ...(palace.minorStars || []),
  ...(palace.adjectiveStars || [])
];

const findPalaceContainingStar = (palaces, starName) => {
  if (!starName) {
    return null;
  }

  return palaces.find((palace) => getPalaceAllStars(palace).some((star) => star.name === starName)) || null;
};

const formatBirthMutagenSummary = (palaces) => {
  const items = [];

  palaces.forEach((palace) => {
    getPalaceAllStars(palace).forEach((star) => {
      if (!star.mutagen) {
        return;
      }

      items.push({
        mutagen: star.mutagen,
        starName: star.name,
        palaceName: palace.name,
        heavenlyStem: palace.heavenlyStem,
        earthlyBranch: palace.earthlyBranch,
        palaceMajorStars: palace.majorStarNames,
        isMajorStar: star.type === 'major',
        brightness: star.brightness || ''
      });
    });
  });

  return items.sort((prev, next) => MUTAGEN_ORDER.indexOf(prev.mutagen) - MUTAGEN_ORDER.indexOf(next.mutagen));
};

const formatHoroscopeMutagenSummary = (palaces, horoscopeItem) => MUTAGEN_ORDER.map((mutagen, index) => {
  const starName = horoscopeItem.mutagen[index] || '';
  const targetPalace = findPalaceContainingStar(palaces, starName);

  return {
    mutagen,
    starName,
    palaceName: targetPalace?.name || '',
    heavenlyStem: targetPalace?.heavenlyStem || '',
    earthlyBranch: targetPalace?.earthlyBranch || '',
    palaceMajorStars: targetPalace?.majorStarNames || [],
    found: Boolean(targetPalace)
  };
});

const formatSurroundedSummary = (astrolabe, palaceName) => {
  const surrounded = astrolabe.surroundedPalaces(palaceName);
  const rolePalaces = SURROUNDED_ROLE_CONFIG.map(({ key, label }) => {
    const palace = surrounded[key];
    return {
      role: label,
      name: getZiWeiPalaceDisplayName(palace.name),
      heavenlyStem: palace.heavenlyStem,
      earthlyBranch: palace.earthlyBranch,
      majorStars: getStarNames(palace.majorStars),
      majorStarText: getMajorStarText(palace.majorStars),
      mutagenTags: getPalaceMutagenTags(palace)
    };
  });

  return {
    palaceName: getZiWeiPalaceDisplayName(palaceName),
    mutagenTags: MUTAGEN_ORDER.filter((mutagen) => surrounded.haveMutagen(mutagen)),
    rolePalaces
  };
};

const formatCorePalaceSummary = (astrolabe, palaces, palaceName) => {
  const rawPalace = astrolabe.palace(palaceName);
  const palace = getPalaceByName(palaces, palaceName);

  if (!rawPalace || !palace) {
    return null;
  }

  const flyTargets = rawPalace.mutagedPlaces();

  return {
    palaceName: getZiWeiPalaceDisplayName(palaceName),
    palace,
    surrounding: formatSurroundedSummary(astrolabe, palaceName),
    flyMutagens: MUTAGEN_ORDER.map((mutagen, index) => {
      const target = flyTargets[index];
      const targetPalace = target ? getPalaceByName(palaces, target.name) : null;

      return {
        mutagen,
        targetPalaceName: target?.name || '',
        heavenlyStem: targetPalace?.heavenlyStem || target?.heavenlyStem || '',
        earthlyBranch: targetPalace?.earthlyBranch || target?.earthlyBranch || '',
        targetMajorStars: targetPalace?.majorStarNames || getStarNames(target?.majorStars || []),
        isSelf: target?.name === palaceName
      };
    })
  };
};

const formatCommandPalaceOverview = (corePalaceSummaries) => corePalaceSummaries
  .filter(Boolean)
  .filter((item) => ['命宫', '迁移', '财帛', '官禄'].includes(item.palaceName))
  .map((item) => ({
    palaceName: item.palaceName,
    majorStarText: item.palace.majorStarText,
    mutagenTags: item.palace.mutagenTags,
    selfMutagens: item.palace.selfMutagens,
    surroundingMutagens: item.surrounding.mutagenTags,
    jiTarget: item.flyMutagens.find((entry) => entry.mutagen === '忌')?.targetPalaceName || '',
    luTarget: item.flyMutagens.find((entry) => entry.mutagen === '禄')?.targetPalaceName || ''
  }));

const getPalaceTopic = (palaceName) => PALACE_TOPIC_MAP[palaceName] || palaceName;

const getMutagenMeta = (mutagen) => MUTAGEN_MESSAGE_MAP[mutagen] || {
  noun: `${mutagen}象`,
  advice: '宜结合盘面其他信息一起判断'
};

const createInsight = ({ key, title, message, priority, kind }) => ({
  key,
  title,
  message,
  priority,
  kind
});

const buildFlyMutagenInsight = (sourcePalaceName, targetPalaceName, mutagen, isSelf = false) => {
  const sourceTopic = getPalaceTopic(sourcePalaceName);
  const targetTopic = getPalaceTopic(targetPalaceName || sourcePalaceName);
  const meta = getMutagenMeta(mutagen);
  const specialKey = `${sourcePalaceName}|${mutagen}|${targetPalaceName}`;
  const specialMessage = SPECIAL_FLY_INSIGHT_MAP[specialKey];

  if (specialMessage) {
    return specialMessage;
  }

  if (isSelf) {
    return `${sourceTopic}这条线的${meta.noun}更多在内部循环，${meta.advice}。`;
  }

  return `${sourceTopic}会把${meta.noun}推向${targetTopic}，${meta.advice}。`;
};

const buildCommandPalaceInsights = (commandPalaceOverview) => {
  const insights = [];

  commandPalaceOverview.forEach((item) => {
    if (item.selfMutagens.includes('忌')) {
      insights.push(createInsight({
        key: `self-ji-${item.palaceName}`,
        title: `${item.palaceName}自化忌`,
        message: buildFlyMutagenInsight(item.palaceName, item.palaceName, '忌', true),
        priority: 100,
        kind: 'self'
      }));
    }

    if (item.selfMutagens.includes('禄')) {
      insights.push(createInsight({
        key: `self-lu-${item.palaceName}`,
        title: `${item.palaceName}自化禄`,
        message: buildFlyMutagenInsight(item.palaceName, item.palaceName, '禄', true),
        priority: 72,
        kind: 'self'
      }));
    }

    if (item.jiTarget && item.jiTarget !== item.palaceName) {
      insights.push(createInsight({
        key: `fly-ji-${item.palaceName}-${item.jiTarget}`,
        title: `${item.palaceName}飞忌入${item.jiTarget}`,
        message: buildFlyMutagenInsight(item.palaceName, item.jiTarget, '忌'),
        priority: 95,
        kind: 'fly'
      }));
    }

    if (item.luTarget && item.luTarget !== item.palaceName) {
      insights.push(createInsight({
        key: `fly-lu-${item.palaceName}-${item.luTarget}`,
        title: `${item.palaceName}飞禄入${item.luTarget}`,
        message: buildFlyMutagenInsight(item.palaceName, item.luTarget, '禄'),
        priority: 78,
        kind: 'fly'
      }));
    }

    if (item.surroundingMutagens.includes('忌')) {
      insights.push(createInsight({
        key: `sur-ji-${item.palaceName}`,
        title: `${item.palaceName}三方四正见忌`,
        message: `${getPalaceTopic(item.palaceName)}相关议题的牵制感偏强，判断时不能只看单宫，宜把对宫、财帛位和官禄位一起看。`,
        priority: 82,
        kind: 'surrounded'
      }));
    }

    const supportMutagens = item.surroundingMutagens.filter((mutagen) => ['禄', '权', '科'].includes(mutagen));
    if (supportMutagens.length >= 2) {
      insights.push(createInsight({
        key: `sur-support-${item.palaceName}`,
        title: `${item.palaceName}三方四正见禄权科`,
        message: `${getPalaceTopic(item.palaceName)}这条线外援、执行与协助条件相对完整，可主动整合资源，不必只守不攻。`,
        priority: 68,
        kind: 'surrounded'
      }));
    }
  });

  return insights;
};

const buildTargetPeriodInsight = (label, item) => {
  if (!item?.palaceName || !item?.mutagen) {
    return null;
  }

  const meta = getMutagenMeta(item.mutagen);
  const priorityMap = {
    '忌': 90,
    '禄': 74,
    '权': 64,
    '科': 58
  };

  return createInsight({
    key: `${label}-${item.mutagen}-${item.palaceName}`,
    title: `${label}${item.mutagen}落${item.palaceName}`,
    message: `${label}的${item.mutagen}象落在${getPalaceTopic(item.palaceName)}，表示这个时间截面的${meta.noun}会优先集中到该宫议题。${meta.advice}。`,
    priority: priorityMap[item.mutagen] || 50,
    kind: 'target'
  });
};

const buildTargetPeriodInsights = (decadalMutagenSummary, yearlyMutagenSummary) => {
  const insights = [];
  const decadalJi = decadalMutagenSummary.find((item) => item.mutagen === '忌');
  const decadalLu = decadalMutagenSummary.find((item) => item.mutagen === '禄');
  const yearlyJi = yearlyMutagenSummary.find((item) => item.mutagen === '忌');
  const yearlyLu = yearlyMutagenSummary.find((item) => item.mutagen === '禄');

  [buildTargetPeriodInsight('目标大限', decadalJi),
    buildTargetPeriodInsight('目标大限', decadalLu),
    buildTargetPeriodInsight('目标流年', yearlyJi),
    buildTargetPeriodInsight('目标流年', yearlyLu)]
    .filter(Boolean)
    .forEach((item) => insights.push(item));

  return insights;
};

const formatAutoInsights = (commandPalaceOverview, decadalMutagenSummary, yearlyMutagenSummary) => {
  const insightMap = new Map();

  [
    ...buildCommandPalaceInsights(commandPalaceOverview),
    ...buildTargetPeriodInsights(decadalMutagenSummary, yearlyMutagenSummary)
  ].forEach((item) => {
    if (!insightMap.has(item.key)) {
      insightMap.set(item.key, item);
    }
  });

  return [...insightMap.values()]
    .sort((prev, next) => next.priority - prev.priority)
    .slice(0, AUTO_INSIGHT_LIMIT)
    .map((item) => Object.fromEntries(
      Object.entries(item).filter(([key]) => key !== 'priority')
    ));
};

const validateDate = (date, message) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new Error(message);
  }
};

const validateInput = (date, gender, targetDate) => {
  validateDate(date, '紫微斗数排盘失败：出生时间无效');
  validateDate(targetDate, '紫微斗数排盘失败：目标运限时间无效');

  if (!SUPPORTED_GENDERS.has(gender)) {
    throw new Error(`紫微斗数排盘失败：不支持的性别参数 ${gender}`);
  }
};

const resolveZiWeiSoul = (earthlyBranchOfSoulPalace, fallbackSoul = '') => {
  try {
    if (!earthlyBranchOfSoulPalace) {
      console.warn(`${LOGGER_PREFIX} 命宫地支缺失，回退到底层命主结果`, {
        fallbackSoul
      });
      return fallbackSoul;
    }

    const resolvedSoul = ZIWEI_SOUL_STAR_BY_BRANCH[earthlyBranchOfSoulPalace];

    if (!resolvedSoul) {
      console.warn(`${LOGGER_PREFIX} 命宫地支未命中命主映射，回退到底层命主结果`, {
        earthlyBranchOfSoulPalace,
        fallbackSoul
      });
      return fallbackSoul;
    }

    return resolvedSoul;
  } catch (error) {
    console.error(`${LOGGER_PREFIX} 解析命主失败，回退到底层命主结果`, error);
    return fallbackSoul;
  }
};

const getNextEarthlyBranch = (earthlyBranch) => {
  const branchIndex = ZIWEI_BRANCH_ORDER.indexOf(earthlyBranch);

  if (branchIndex < 0) {
    return '';
  }

  return ZIWEI_BRANCH_ORDER[(branchIndex + 1) % ZIWEI_BRANCH_ORDER.length];
};

const appendZiWeiCompanionStars = (palaces) => {
  try {
    if (!Array.isArray(palaces) || palaces.length === 0) {
      return palaces;
    }

    const palaceMap = new Map(palaces.map((palace) => [palace.earthlyBranch, palace]));

    ZIWEI_COMPANION_STAR_RULES.forEach(({ sourceName, companionName }) => {
      palaces.forEach((palace) => {
        const hasSourceStar = palace.adjectiveStars.some((star) => star.name === sourceName);

        if (!hasSourceStar) {
          return;
        }

        const targetBranch = getNextEarthlyBranch(palace.earthlyBranch);
        const targetPalace = palaceMap.get(targetBranch);

        if (!targetPalace || targetPalace.adjectiveStars.some((star) => star.name === companionName)) {
          return;
        }

        targetPalace.adjectiveStars.push({
          name: companionName,
          type: 'adjective',
          scope: 'origin',
          brightness: resolveZiWeiStarBrightness({ name: companionName }, targetBranch),
          mutagen: ''
        });
      });
    });

    return palaces;
  } catch (error) {
    console.error(`${LOGGER_PREFIX} 补充文墨风格伴星失败`, error);
    return palaces;
  }
};

const configureZiWeiAstro = () => {
  try {
    astro.config(ZIWEI_ASTRO_CONFIG);
  } catch (error) {
    console.error(`${LOGGER_PREFIX} 应用中州派排盘配置失败`, error);
    throw error instanceof Error
      ? error
      : new Error('紫微斗数排盘失败：中州派配置初始化失败');
  }
};

export function getZiWeiPaiPan(date, gender = '男', targetDate = new Date()) {
  try {
    validateInput(date, gender, targetDate);
    configureZiWeiAstro();

    const solarDate = formatSolarDate(date);
    const birthTimeIndex = getTimeIndexFromDate(date);
    const now = targetDate;
    const horoscopeTimeIndex = getTimeIndexFromDate(now);

    console.log(`${LOGGER_PREFIX} 开始排盘`, {
      solarDate,
      birthTimeIndex,
      gender,
      horoscopeDate: now.toISOString()
    });

    const astrolabe = astro.bySolar(solarDate, birthTimeIndex, gender, true, 'zh-CN');
    const horoscope = astrolabe.horoscope(now, horoscopeTimeIndex);
    const palaces = appendZiWeiCompanionStars(astrolabe.palaces.map(formatPalace));
    const resolvedSoul = resolveZiWeiSoul(astrolabe.earthlyBranchOfSoulPalace, astrolabe.soul);
    const birthMutagenSummary = formatBirthMutagenSummary(palaces);
    const yearlyMutagenSummary = formatHoroscopeMutagenSummary(palaces, horoscope.yearly);
    const decadalMutagenSummary = formatHoroscopeMutagenSummary(palaces, horoscope.decadal);
    const monthlyMutagenSummary = formatHoroscopeMutagenSummary(palaces, horoscope.monthly);
    const dailyMutagenSummary = formatHoroscopeMutagenSummary(palaces, horoscope.daily);
    const soulPalace = getPalaceByName(palaces, '命宫');
    const bodyPalace = palaces.find((item) => item.isBodyPalace) || null;
    const fortunePalace = getPalaceByName(palaces, '财帛');
    const careerPalace = getPalaceByName(palaces, '官禄');
    const spousePalace = getPalaceByName(palaces, '夫妻');
    const movePalace = getPalaceByName(palaces, '迁移');
    const surroundedSummaries = CORE_PALACE_NAMES
      .map((palaceName) => formatSurroundedSummary(astrolabe, palaceName));
    const corePalaceSummaries = CORE_PALACE_NAMES
      .map((palaceName) => formatCorePalaceSummary(astrolabe, palaces, palaceName))
      .filter(Boolean);
    const commandPalaceOverview = formatCommandPalaceOverview(corePalaceSummaries);
    const autoInsights = formatAutoInsights(commandPalaceOverview, decadalMutagenSummary, yearlyMutagenSummary);

    const result = {
      gender,
      solarDate: astrolabe.solarDate,
      lunarDate: astrolabe.lunarDate,
      chineseDate: astrolabe.chineseDate,
      time: astrolabe.time,
      timeRange: astrolabe.timeRange,
      sign: astrolabe.sign,
      zodiac: astrolabe.zodiac,
      earthlyBranchOfSoulPalace: astrolabe.earthlyBranchOfSoulPalace,
      earthlyBranchOfBodyPalace: astrolabe.earthlyBranchOfBodyPalace,
      soul: resolvedSoul,
      body: astrolabe.body,
      fiveElementsClass: astrolabe.fiveElementsClass,
      birthTimeIndex,
      birthDateInfo: formatDateInfo(date),
      birthDateTime: formatDateTime(date),
      horoscopeTargetDateTime: formatDateTime(now),
      horoscopeTargetTimeIndex: horoscopeTimeIndex,
      palaces,
      soulPalace,
      bodyPalace,
      fortunePalace,
      careerPalace,
      spousePalace,
      movePalace,
      birthMutagenSummary,
      decadalMutagenSummary,
      yearlyMutagenSummary,
      monthlyMutagenSummary,
      dailyMutagenSummary,
      surroundedSummaries,
      corePalaceSummaries,
      commandPalaceOverview,
      autoInsights,
      horoscope: formatHoroscope(horoscope),
      copyright: astrolabe.copyright
    };

    console.log(`${LOGGER_PREFIX} 排盘完成`, {
      solarDate: result.solarDate,
      time: result.time,
      palaceCount: result.palaces.length,
      horoscopeYear: result.horoscope.yearly.heavenlyStem + result.horoscope.yearly.earthlyBranch,
      soul: result.soul,
      soulByIztro: astrolabe.soul
    });

    return result;
  } catch (error) {
    console.error(`${LOGGER_PREFIX} 排盘异常`, error);
    throw error instanceof Error
      ? error
      : new Error('紫微斗数排盘失败：发生未知错误');
  }
}

export function getZiWeiTimeIndex(date) {
  try {
    validateDate(date, '无法计算紫微斗数时辰索引：时间无效');

    return getTimeIndexFromDate(date);
  } catch (error) {
    console.error(`${LOGGER_PREFIX} 计算时辰索引失败`, error);
    throw error instanceof Error
      ? error
      : new Error('无法计算紫微斗数时辰索引：发生未知错误');
  }
}
