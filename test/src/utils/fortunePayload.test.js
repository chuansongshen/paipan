import { describe, expect, it } from 'vitest';
import { buildFortunePayload, isAiInterpretationSupportedMode } from '../../../src/utils/fortunePayload.js';

const sampleBaziData = {
  性别: '男',
  阳历: '2000-01-01 08:00',
  农历: '己卯年腊月初一辰时',
  生肖: '兔',
  八字: '甲子 乙丑 丙寅 丁卯',
  日主: '丙',
  年柱: {
    干支: '甲子',
    天干: { 天干: '甲', 五行: '木', 阴阳: '阳', 十神: '偏印' },
    地支: {
      地支: '子',
      五行: '水',
      阴阳: '阳',
      藏干: {
        本气: { 天干: '癸', 十神: '正官' }
      }
    },
    纳音: '海中金',
    神煞: ['天乙贵人']
  },
  月柱: {
    干支: '乙丑',
    天干: { 天干: '乙', 五行: '木', 阴阳: '阴', 十神: '正印' },
    地支: {
      地支: '丑',
      五行: '土',
      阴阳: '阴',
      藏干: {
        本气: { 天干: '己', 十神: '伤官' }
      }
    },
    纳音: '海中金',
    神煞: []
  },
  日柱: {
    干支: '丙寅',
    天干: { 天干: '丙', 五行: '火', 阴阳: '阳', 十神: '' },
    地支: {
      地支: '寅',
      五行: '木',
      阴阳: '阳',
      藏干: {
        本气: { 天干: '甲', 十神: '偏印' }
      }
    },
    纳音: '炉中火',
    神煞: []
  },
  时柱: {
    干支: '丁卯',
    天干: { 天干: '丁', 五行: '火', 阴阳: '阴', 十神: '劫财' },
    地支: {
      地支: '卯',
      五行: '木',
      阴阳: '阴',
      藏干: {
        本气: { 天干: '乙', 十神: '正印' }
      }
    },
    纳音: '炉中火',
    神煞: []
  },
  刑冲合会: ['子丑合'],
  胎元: '丙辰',
  命宫: '壬午',
  身宫: '辛巳',
  大运: {
    起运年龄: 6,
    大运: [
      {
        干支: '丙寅',
        开始年份: 2006,
        结束年份: 2015,
        开始年龄: 6,
        结束年龄: 15,
        天干十神: '比肩',
        地支藏干: ['甲', '丙'],
        地支十神: ['偏印', '比肩']
      }
    ]
  }
};

describe('fortunePayload', () => {
  it('识别支持的 AI 解读模式', () => {
    expect(isAiInterpretationSupportedMode('bazi')).toBe(true);
    expect(isAiInterpretationSupportedMode('qimen')).toBe(false);
  });

  it('构建稳定的八字 AI 载荷', () => {
    const payload = buildFortunePayload('bazi', sampleBaziData);

    expect(payload.mode).toBe('bazi');
    expect(payload.meta.gender).toBe('男');
    expect(payload.summary.core).toContain('甲子');
    expect(payload.summary.core).toContain('日主 丙');
    expect(payload.promptText).toContain('八字排盘');
    expect(payload.promptText).toContain('甲子 乙丑 丙寅 丁卯');
  });

  it('对未支持模式给出明确错误', () => {
    expect(() => buildFortunePayload('qimen', {})).toThrow('暂不支持 qimen 模式的 AI 解读载荷');
  });
});
