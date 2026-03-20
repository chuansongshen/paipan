const LOGGER_PREFIX = '[FortunePayload]';
const SUPPORTED_AI_INTERPRETATION_MODES = new Set(['bazi']);

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

function buildBaziPayload(panData) {
  const promptText = buildBaziPromptText(panData);

  return {
    mode: 'bazi',
    meta: {
      gender: panData.性别,
      solarDate: panData.阳历,
      lunarDate: panData.农历,
      zodiac: panData.生肖
    },
    summary: {
      core: `${panData.八字}，日主 ${panData.日主}`,
      pillars: [panData.年柱?.干支, panData.月柱?.干支, panData.日柱?.干支, panData.时柱?.干支].filter(Boolean)
    },
    promptText,
    raw: panData
  };
}

export function isAiInterpretationSupportedMode(mode) {
  return SUPPORTED_AI_INTERPRETATION_MODES.has(mode);
}

export function buildFortunePayload(mode, panData) {
  try {
    ensureSupportedMode(mode);
    ensurePanData(mode, panData);

    if (mode === 'bazi') {
      return buildBaziPayload(panData);
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
