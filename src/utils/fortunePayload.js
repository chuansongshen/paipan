import { buildZiWeiCopyText } from './ziwei_copy.js';

const LOGGER_PREFIX = '[FortunePayload]';
const SUPPORTED_AI_INTERPRETATION_MODES = new Set(['qimen', 'daliuren', 'liuyao', 'bazi', 'ziwei']);
const QIMEN_PALACE_MAP = [
  { id: 4, name: '巽宫' },
  { id: 9, name: '离宫' },
  { id: 2, name: '坤宫' },
  { id: 3, name: '震宫' },
  { id: 5, name: '中宫' },
  { id: 7, name: '兑宫' },
  { id: 8, name: '艮宫' },
  { id: 1, name: '坎宫' },
  { id: 6, name: '乾宫' }
];
const EARTH_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

function ensureSupportedMode(mode) {
  if (!SUPPORTED_AI_INTERPRETATION_MODES.has(mode)) {
    throw new Error(`暂不支持 ${mode} 模式的 AI 解读载荷`);
  }
}

function ensurePanData(mode, panData) {
  if (!panData || typeof panData !== 'object') {
    throw new Error(`${mode} 排盘结果为空`);
  }

  if (panData.error) {
    throw new Error(`${mode} 排盘失败：${panData.error}`);
  }
}

function assertStringField(modeLabel, value, message) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${modeLabel}${message}`);
  }

  return value.trim();
}

function assertObjectField(modeLabel, value, message) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${modeLabel}${message}`);
  }

  return value;
}

function assertArrayField(modeLabel, value, message) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${modeLabel}${message}`);
  }

  return value;
}

function formatTextList(items = []) {
  if (!Array.isArray(items) || items.length === 0) {
    return '未提供';
  }

  return items.filter(Boolean).join(' ');
}

function normalizeReferenceDateTime(context = {}, fallbackValue = '') {
  if (typeof context.referenceDateTime === 'string' && context.referenceDateTime.trim()) {
    return context.referenceDateTime.trim();
  }

  if (typeof fallbackValue === 'string' && fallbackValue.trim()) {
    return fallbackValue.trim();
  }

  return '未提供';
}

function resolveQimenMethodLabel(method) {
  if (method === 'zhirun') {
    return '置润法';
  }

  return '拆补法';
}

function getQimenPalaceValue(record, palaceId) {
  return record?.[palaceId] || '-';
}

function getEarthBranchIndex(zhi) {
  return EARTH_BRANCHES.indexOf(zhi);
}

function buildBaziPromptText(panData) {
  const currentYear = new Date().getFullYear();
  const pillars = [
    { name: '年柱', data: panData.年柱 },
    { name: '月柱', data: panData.月柱 },
    { name: '日柱', data: panData.日柱 },
    { name: '时柱', data: panData.时柱 }
  ];

  let text = `你是一个精通四柱八字的高手，现在是${currentYear}年，请分别用梁湘润、盲派、子平命理等八字理论对下面的八字命盘进行推算，分析一下命主的整体命运情况，考虑身强身弱，分析大运流年和十神关系，体用平衡，分析一下命格的成就如何，分析一下人生的关键节点，分析一下【${currentYear}】以及【${currentYear + 1}】两年的流年，注意逻辑合理，综合各种信息文本判断准确的关系模型，交叉验证，多次迭代后输出最终正确结果，八字命盘信息如下：\n\n`;
  text += '========== 八字排盘 ==========\n\n';
  text += `性别: ${panData.性别}\n`;
  text += `阳历: ${panData.阳历}\n`;
  text += `农历: ${panData.农历}\n`;
  text += `生肖: ${panData.生肖}\n\n`;

  text += `【八字】\n${panData.八字}\n`;
  text += `日主: ${panData.日主}\n\n`;

  text += '【四柱】\n';
  pillars.forEach((pillar) => {
    text += `${pillar.name}: ${pillar.data.干支}\n`;
    text += `  天干: ${pillar.data.天干.天干} (${pillar.data.天干.五行} ${pillar.data.天干.阴阳})`;
    if (pillar.data.天干.十神) {
      text += ` [${pillar.data.天干.十神}]`;
    }
    text += '\n';
    text += `  地支: ${pillar.data.地支.地支} (${pillar.data.地支.五行} ${pillar.data.地支.阴阳})\n`;

    if (pillar.data.地支.藏干) {
      const hiddenStemText = Object.entries(pillar.data.地支.藏干)
        .map(([type, info]) => `${type}${info.天干}[${info.十神}]`)
        .join(' ');

      text += `  藏干: ${hiddenStemText}\n`;
    }

    text += `  纳音: ${pillar.data.纳音}\n`;

    if (pillar.data.神煞?.length) {
      text += `  神煞: ${pillar.data.神煞.join(' ')}\n`;
    }

    text += '\n';
  });

  if (panData.刑冲合会?.length) {
    text += `【刑冲合会】\n${panData.刑冲合会.join(' ')}\n\n`;
  }

  text += '【其他】\n';
  text += `胎元: ${panData.胎元}  命宫:${panData.命宫}  身宫: ${panData.身宫}\n\n`;

  if (panData.大运) {
    text += `【大运】(起运年龄: ${panData.大运.起运年龄}岁)\n`;
    panData.大运.大运.forEach((item) => {
      const hiddenText = item.地支藏干
        .map((gan, index) => `${gan}(${item.地支十神[index]})`)
        .join(' ');

      text += `${item.干支} (${item.开始年份}-${item.结束年份}, ${item.开始年龄}-${item.结束年龄}岁) `;
      text += `天干[${item.天干十神}] `;
      text += `地支藏干[${hiddenText}]\n`;
    });
  }

  text += '\n=================================';

  return text;
}

function buildQimenPromptText(panData, context = {}) {
  const modeLabel = '奇门排盘';
  assertStringField(modeLabel, panData.jieQi, '缺少节气信息');
  assertStringField(modeLabel, panData.zhiFuStar, '缺少值符信息');
  assertStringField(modeLabel, panData.zhiShiGate, '缺少值使信息');
  assertStringField(modeLabel, panData.xun, '缺少旬首信息');
  assertObjectField(modeLabel, panData.shenPan, '缺少八神信息');
  assertObjectField(modeLabel, panData.tianPan, '缺少九星信息');
  assertObjectField(modeLabel, panData.renPan, '缺少八门信息');
  assertObjectField(modeLabel, panData.tianPanStems, '缺少天盘干信息');
  assertObjectField(modeLabel, panData.diPan, '缺少地盘干信息');
  assertObjectField(modeLabel, panData.anGan, '缺少暗干信息');
  assertArrayField(modeLabel, panData.kongWangPalaces, '缺少空亡宫位信息');

  let text = '你是一个精通奇门遁甲的高手，请基于下面的排盘信息，分析一下【*********你的问题*********】，排盘信息如下：\n\n';
  text += '========== 奇门遁甲排盘 ==========\n\n';
  text += `【局象信息】\n`;
  text += `起局时间：${normalizeReferenceDateTime(context)}\n`;
  text += `定局方式：${resolveQimenMethodLabel(context.method)}\n`;
  text += `节气：${panData.jieQi}\n`;
  text += `年柱：${panData.yearGanZhi || '未提供'}\n`;
  text += `月柱：${panData.monthGanZhi || '未提供'}\n`;
  text += `日柱：${panData.dayGanZhi || '未提供'}\n`;
  text += `时柱：${panData.hourGanZhi || '未提供'}\n`;
  text += `元遁：${panData.type || '未提供'} ${panData.yuan || '未提供'}\n`;
  text += `局数：${panData.juNum || '未提供'} 局\n`;
  text += `空亡：${panData.dayXunKong || '未提供'} (日) / ${panData.hourXunKong || '未提供'} (时)\n`;
  text += `马星：${panData.maXing || '未提供'}\n`;
  text += `值符：${panData.zhiFuStar}\n`;
  text += `值使：${panData.zhiShiGate}\n`;
  text += `旬首：${panData.xun}\n\n`;
  text += '【九宫信息】\n';

  QIMEN_PALACE_MAP.forEach((palace) => {
    text += `\n【${palace.name}】\n`;
    text += `  八神：${getQimenPalaceValue(panData.shenPan, palace.id)}\n`;
    text += `  九星：${getQimenPalaceValue(panData.tianPan, palace.id)}\n`;
    text += `  八门：${getQimenPalaceValue(panData.renPan, palace.id)}\n`;
    text += `  天盘干：${getQimenPalaceValue(panData.tianPanStems, palace.id)}\n`;
    text += `  地盘干：${getQimenPalaceValue(panData.diPan, palace.id)}\n`;
    text += `  暗干：${getQimenPalaceValue(panData.anGan, palace.id)}\n`;

    if (panData.maXingPalace === palace.id) {
      text += '  ★ 马星所在宫位\n';
    }

    if (panData.kongWangPalaces.includes(palace.id)) {
      text += '  ⭕️ 空亡宫位\n';
    }
  });

  text += '\n=================================';
  return text;
}

function buildDaLiuRenPromptText(panData, context = {}) {
  const modeLabel = '大六壬排盘';
  const sanChuan = assertArrayField(modeLabel, panData.sanChuan, '缺少三传数据');
  const siKe = assertObjectField(modeLabel, panData.siKe, '缺少四课数据');
  const tianPan = assertArrayField(modeLabel, panData.tianPan, '缺少天地盘数据');
  const tianJiang = assertObjectField(modeLabel, panData.tianJiang, '缺少天将数据');

  let text = '你是一个精通大六壬的高手，请基于下面的排盘信息，分析一下【*********你的问题*********】，排盘信息如下：\n\n';
  text += '========== 大六壬排盘 ==========\n\n';
  text += `起课时间: ${normalizeReferenceDateTime(context, panData.dateStr)}\n`;
  text += `求测年命: ${panData.birthYearGanZhi || '未提供'} (${panData.gender || context.gender || '未提供'})  行年: ${panData.xingNian || '未提供'}\n`;
  text += `日期: ${panData.dateStr || '未提供'}\n`;
  text += `四柱: ${panData.ganZhi?.year || '-'} ${panData.ganZhi?.month || '-'} ${panData.ganZhi?.day || '-'} ${panData.ganZhi?.hour || '-'}\n`;
  text += `月将: ${panData.yueJiang || '未提供'}  空亡: ${panData.kongWang || '未提供'}\n\n`;
  text += '【三传】\n';
  text += `初传: ${sanChuan[0]?.gan || '-'}${sanChuan[0]?.zhi || '-'} (${tianJiang?.[sanChuan[0]?.zhi] || '-'})\n`;
  text += `中传: ${sanChuan[1]?.gan || '-'}${sanChuan[1]?.zhi || '-'} (${tianJiang?.[sanChuan[1]?.zhi] || '-'})\n`;
  text += `末传: ${sanChuan[2]?.gan || '-'}${sanChuan[2]?.zhi || '-'} (${tianJiang?.[sanChuan[2]?.zhi] || '-'})\n\n`;
  text += '【四课】\n';
  text += `${tianJiang?.[siKe.fourth?.zhi] || '-'} ${tianJiang?.[siKe.third?.zhi] || '-'} ${tianJiang?.[siKe.second?.zhi] || '-'} ${tianJiang?.[siKe.first?.zhi] || '-'}\n`;
  text += `${siKe.fourth?.zhi || '-'} ${siKe.third?.zhi || '-'} ${siKe.second?.zhi || '-'} ${siKe.first?.zhi || '-'}\n`;
  text += `${siKe.fourth?.gan || '-'} ${siKe.third?.gan || '-'} ${siKe.second?.gan || '-'} ${siKe.first?.gan || '-'}\n\n`;
  text += '【天地盘】\n';
  text += `地支:   ${EARTH_BRANCHES.join('  ')}\n`;
  text += `天盘:   ${tianPan.map((zhi) => String(zhi).padEnd(2, ' ')).join('  ')}\n`;
  text += `贵神:   ${EARTH_BRANCHES.map((zhi) => (tianJiang?.[tianPan[getEarthBranchIndex(zhi)]] || '').slice(0, 2).padEnd(2, ' ')).join('  ')}\n\n`;

  if (panData.shenShaText) {
    text += `【神煞】\n${panData.shenShaText}\n`;
  }

  if (panData.zhiZhi) {
    text += `【大六壬直指】\n${panData.zhiZhi}\n`;
  }

  text += '\n=================================';
  return text;
}

function buildLiuYaoPromptText(panData, context = {}) {
  const modeLabel = '六爻排盘';
  const benGua = assertObjectField(modeLabel, panData.benGua, '缺少本卦数据');
  assertArrayField(modeLabel, benGua.yaoData, '缺少本卦爻位数据');
  const movingText = Array.isArray(panData.movingYaos) && panData.movingYaos.length > 0
    ? panData.movingYaos.join('、')
    : panData.movingYao;

  let text = '你是一个精通六爻的高手，请基于下面的排盘信息，分析一下【*********你的问题*********】，排盘信息如下：\n\n';
  text += '========== 六爻排盘 ==========\n\n';
  text += `起卦时间: ${normalizeReferenceDateTime(context, panData.dateStr)}\n`;
  text += `起卦方式: ${context.liuyaoInputMode === 'manual' ? '手动起卦' : '正时起卦'}\n`;
  text += `求测年命: ${panData.benMing || '未提供'} (${panData.gender || context.gender || '未提供'})  行年: ${panData.xingNian || '未提供'}\n`;
  text += `日期: ${panData.dateStr || '未提供'}\n`;
  text += `干支: ${panData.ganZhi?.year || '-'} ${panData.ganZhi?.month || '-'} ${panData.ganZhi?.day || '-'} ${panData.ganZhi?.hour || '-'}\n`;
  text += `空亡: ${panData.dayXunKong || '未提供'} (日) / ${panData.hourXunKong || '未提供'} (时)\n`;
  text += `动爻: ${movingText || '未提供'}爻\n\n`;
  text += `【本卦】 ${benGua.name || '未提供'}\n`;

  benGua.yaoData.slice().reverse().forEach((yao) => {
    const isMoving = Array.isArray(panData.movingYaos) && panData.movingYaos.length > 0
      ? panData.movingYaos.includes(yao.position)
      : yao.position === panData.movingYao;
    text += `${yao.position}爻: ${yao.stem}${yao.branch} (${yao.wuxing}) ${yao.yinYang === 1 ? '—' : '--'} ${isMoving ? '○ 动爻' : ''}\n`;
  });
  text += '\n';

  if (Array.isArray(benGua.yaoCi) && benGua.yaoCi.length > 0) {
    text += '【本卦爻辞】\n';
    benGua.yaoCi.slice().reverse().forEach((ci, index) => {
      text += `${benGua.yaoData[5 - index].position}爻：${ci}\n`;
    });
    text += '\n';
  }

  if (panData.bianGua) {
    text += `【变卦】 ${panData.bianGua.name || '未提供'}\n`;
    panData.bianGua.yaoData.slice().reverse().forEach((yao) => {
      text += `${yao.position}爻: ${yao.stem}${yao.branch} (${yao.wuxing}) ${yao.yinYang === 1 ? '—' : '--'}\n`;
    });
    text += '\n';

    if (Array.isArray(panData.bianGua.yaoCi) && panData.bianGua.yaoCi.length > 0) {
      text += '【变卦爻辞】\n';
      panData.bianGua.yaoCi.slice().reverse().forEach((ci, index) => {
        text += `${panData.bianGua.yaoData[5 - index].position}爻：${ci}\n`;
      });
      text += '\n';
    }
  }

  text += '【神煞】\n';
  Object.entries(panData.shenSha || {}).forEach(([key, value]) => {
    text += `${key}: ${value || '-'}\n`;
  });

  text += '\n=================================';
  return text;
}

function buildZiWeiPromptText(panData, context = {}) {
  const modeLabel = '紫微斗数排盘';
  assertArrayField(modeLabel, panData.palaces, '缺少宫位数据');

  const lines = [buildZiWeiCopyText(panData)];
  const targetMode = context.targetMode || 'birth';
  const targetDateTime = context.targetDateTime || panData.horoscopeTargetDateTime || '未提供';
  const quickSelection = context.quickSelection && typeof context.quickSelection === 'object'
    ? context.quickSelection
    : {};

  lines.push('');
  lines.push('------------------------------------------------');
  lines.push('');
  lines.push('【当前解读上下文】');
  lines.push(`目标模式：${targetMode}`);
  lines.push(`目标时间：${targetDateTime}`);
  lines.push(`大限选择：${quickSelection.activeDecadalKey || '未选择'}`);
  lines.push(`流年选择：${quickSelection.activeYearlyKey || '未选择'}`);
  lines.push(`流月选择：${quickSelection.activeMonthlyKey || '未选择'}`);
  lines.push(`流日选择：${quickSelection.activeDailyKey || '未选择'}`);

  return lines.join('\n');
}

function buildBaziPayload(panData) {
  const promptText = buildBaziPromptText(panData);

  return {
    mode: 'bazi',
    meta: {
      gender: panData.性别,
      solarDate: panData.阳历,
      lunarDate: panData.农历,
      zodiac: panData.生肖,
      referenceDateTime: panData.阳历
    },
    summary: {
      core: `${panData.八字}，日主 ${panData.日主}`,
      pillars: [panData.年柱?.干支, panData.月柱?.干支, panData.日柱?.干支, panData.时柱?.干支].filter(Boolean)
    },
    promptText,
    raw: panData
  };
}

function buildQimenPayload(panData, context = {}) {
  const promptText = buildQimenPromptText(panData, context);
  const referenceDateTime = normalizeReferenceDateTime(context);

  return {
    mode: 'qimen',
    meta: {
      referenceDateTime,
      method: resolveQimenMethodLabel(context.method),
      jieQi: panData.jieQi,
      juNum: panData.juNum,
      dunType: panData.type,
      yuan: panData.yuan
    },
    summary: {
      core: `${referenceDateTime} ${panData.type || '未提供'}${panData.yuan || ''}${panData.juNum || '未提供'}局，值符 ${panData.zhiFuStar}，值使 ${panData.zhiShiGate}，旬首 ${panData.xun}`,
      highlights: [panData.zhiFuStar, panData.zhiShiGate, panData.maXing].filter(Boolean)
    },
    promptText,
    raw: panData
  };
}

function buildDaLiuRenPayload(panData, context = {}) {
  const promptText = buildDaLiuRenPromptText(panData, context);
  const referenceDateTime = normalizeReferenceDateTime(context, panData.dateStr);
  const sanChuanText = panData.sanChuan
    .map((item) => `${item?.gan || ''}${item?.zhi || ''}`)
    .join(' / ');

  return {
    mode: 'daliuren',
    meta: {
      referenceDateTime,
      gender: panData.gender || context.gender || '未提供',
      birthYearGanZhi: panData.birthYearGanZhi || '未提供',
      xingNian: panData.xingNian || '未提供',
      yueJiang: panData.yueJiang || '未提供'
    },
    summary: {
      core: `${referenceDateTime} 四柱 ${panData.ganZhi?.year || '-'} ${panData.ganZhi?.month || '-'} ${panData.ganZhi?.day || '-'} ${panData.ganZhi?.hour || '-'}，月将 ${panData.yueJiang || '未提供'}，三传 ${sanChuanText}`,
      highlights: [panData.yueJiang, panData.kongWang, panData.xingNian].filter(Boolean)
    },
    promptText,
    raw: panData
  };
}

function buildLiuYaoPayload(panData, context = {}) {
  const promptText = buildLiuYaoPromptText(panData, context);
  const referenceDateTime = normalizeReferenceDateTime(context, panData.dateStr);
  const movingText = Array.isArray(panData.movingYaos) && panData.movingYaos.length > 0
    ? panData.movingYaos.join('、')
    : panData.movingYao;

  return {
    mode: 'liuyao',
    meta: {
      referenceDateTime,
      inputMode: context.liuyaoInputMode || 'time',
      benMing: panData.benMing || '未提供',
      xingNian: panData.xingNian || '未提供'
    },
    summary: {
      core: `${referenceDateTime} 本卦 ${panData.benGua?.name || '未提供'}，变卦 ${panData.bianGua?.name || '未提供'}，动爻 ${movingText || '未提供'}`,
      highlights: [panData.benGua?.name, panData.bianGua?.name, `${movingText || '未提供'}爻`]
    },
    promptText,
    raw: panData
  };
}

function buildZiWeiPayload(panData, context = {}) {
  const promptText = buildZiWeiPromptText(panData, context);
  const targetDateTime = context.targetDateTime || panData.horoscopeTargetDateTime || '未提供';
  const targetMode = context.targetMode || 'birth';
  const soulPalaceName = panData.soulPalace?.name || '命宫';
  const bodyPalaceName = panData.bodyPalace?.name || '身宫未提供';
  const mainStars = panData.soulPalace?.majorStarText || formatTextList(panData.soulPalace?.majorStarNames);

  return {
    mode: 'ziwei',
    meta: {
      gender: panData.gender || '未提供',
      birthDateTime: panData.birthDateTime || '未提供',
      targetDateTime,
      targetMode,
      quickSelection: context.quickSelection || {},
      referenceDateTime: targetDateTime
    },
    summary: {
      core: `${soulPalaceName} ${mainStars || '未提供'}，身宫 ${bodyPalaceName}，目标时间 ${targetDateTime}，模式 ${targetMode}`,
      highlights: [soulPalaceName, bodyPalaceName, targetMode]
    },
    promptText,
    raw: panData
  };
}

export function isAiInterpretationSupportedMode(mode) {
  return SUPPORTED_AI_INTERPRETATION_MODES.has(mode);
}

export function buildFortunePayload(mode, panData, context = {}) {
  try {
    ensureSupportedMode(mode);
    ensurePanData(mode, panData);

    if (mode === 'qimen') {
      return buildQimenPayload(panData, context);
    }

    if (mode === 'daliuren') {
      return buildDaLiuRenPayload(panData, context);
    }

    if (mode === 'liuyao') {
      return buildLiuYaoPayload(panData, context);
    }

    if (mode === 'bazi') {
      return buildBaziPayload(panData);
    }

    if (mode === 'ziwei') {
      return buildZiWeiPayload(panData, context);
    }

    throw new Error(`未实现的载荷构建模式: ${mode}`);
  } catch (error) {
    console.error(`${LOGGER_PREFIX} 构建 AI 载荷失败`, {
      mode,
      error
    });
    throw error;
  }
}
