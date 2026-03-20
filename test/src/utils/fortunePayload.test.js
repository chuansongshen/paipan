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

const sampleQimenData = {
  jieQi: '春分',
  yearGanZhi: '甲辰',
  monthGanZhi: '丁卯',
  dayGanZhi: '丙午',
  hourGanZhi: '辛卯',
  type: '阳遁',
  yuan: '上元',
  juNum: 3,
  dayXunKong: '寅卯',
  hourXunKong: '辰巳',
  maXing: '申',
  zhiFuStar: '天心',
  zhiShiGate: '开门',
  xun: '甲子',
  shenPan: { 1: '值符', 2: '六合', 3: '太阴', 4: '九地', 5: '九天', 6: '白虎', 7: '玄武', 8: '腾蛇', 9: '太常' },
  tianPan: { 1: '天蓬', 2: '天芮', 3: '天冲', 4: '天辅', 5: '天禽', 6: '天心', 7: '天柱', 8: '天任', 9: '天英' },
  renPan: { 1: '休门', 2: '死门', 3: '伤门', 4: '杜门', 5: '中门', 6: '开门', 7: '惊门', 8: '生门', 9: '景门' },
  tianPanStems: { 1: '壬', 2: '癸', 3: '甲', 4: '乙', 5: '丙', 6: '丁', 7: '戊', 8: '己', 9: '庚' },
  diPan: { 1: '戊', 2: '己', 3: '庚', 4: '辛', 5: '壬', 6: '癸', 7: '丁', 8: '丙', 9: '乙' },
  anGan: { 1: '乙', 2: '丙', 3: '丁', 4: '戊', 5: '己', 6: '庚', 7: '辛', 8: '壬', 9: '癸' },
  maXingPalace: 6,
  kongWangPalaces: [2, 7]
};

const sampleDaLiuRenData = {
  birthYearGanZhi: '庚辰',
  gender: '男',
  xingNian: '乙未',
  dateStr: '2026-03-20 10:30',
  ganZhi: {
    year: '甲辰',
    month: '丁卯',
    day: '丙午',
    hour: '辛卯'
  },
  yueJiang: '酉',
  kongWang: '寅卯',
  sanChuan: [
    { gan: '庚', zhi: '申' },
    { gan: '辛', zhi: '酉' },
    { gan: '壬', zhi: '戌' }
  ],
  siKe: {
    first: { gan: '丙', zhi: '午' },
    second: { gan: '丁', zhi: '未' },
    third: { gan: '戊', zhi: '申' },
    fourth: { gan: '己', zhi: '酉' }
  },
  tianPan: ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'],
  tianJiang: {
    子: '贵人',
    丑: '腾蛇',
    寅: '朱雀',
    卯: '六合',
    辰: '勾陈',
    巳: '青龙',
    午: '天空',
    未: '白虎',
    申: '太常',
    酉: '玄武',
    戌: '太阴',
    亥: '天后'
  },
  shenShaText: '天喜临身，驿马发动。',
  zhiZhi: '主事多转圜，先难后易。'
};

const sampleLiuYaoData = {
  benMing: '庚辰',
  xingNian: '乙未',
  dateStr: '2026-03-20 10:30',
  lunarStr: '二月初二',
  birthYear: 2000,
  ganZhi: {
    year: '甲辰',
    month: '丁卯',
    day: '丙午',
    hour: '辛卯'
  },
  dayXunKong: '寅卯',
  hourXunKong: '辰巳',
  movingYao: 3,
  movingYaos: [3, 5],
  benGua: {
    name: '火天大有',
    yaoData: [
      { position: 1, stem: '甲', branch: '子', wuxing: '水', yinYang: 1 },
      { position: 2, stem: '乙', branch: '丑', wuxing: '土', yinYang: 0 },
      { position: 3, stem: '丙', branch: '寅', wuxing: '木', yinYang: 1 },
      { position: 4, stem: '丁', branch: '卯', wuxing: '木', yinYang: 1 },
      { position: 5, stem: '戊', branch: '辰', wuxing: '土', yinYang: 0 },
      { position: 6, stem: '己', branch: '巳', wuxing: '火', yinYang: 1 }
    ],
    yaoCi: ['初九', '九二', '九三', '九四', '六五', '上九']
  },
  bianGua: {
    name: '离为火',
    yaoData: [
      { position: 1, stem: '甲', branch: '子', wuxing: '水', yinYang: 1 },
      { position: 2, stem: '乙', branch: '丑', wuxing: '土', yinYang: 0 },
      { position: 3, stem: '丙', branch: '寅', wuxing: '木', yinYang: 0 },
      { position: 4, stem: '丁', branch: '卯', wuxing: '木', yinYang: 1 },
      { position: 5, stem: '戊', branch: '辰', wuxing: '土', yinYang: 1 },
      { position: 6, stem: '己', branch: '巳', wuxing: '火', yinYang: 1 }
    ],
    yaoCi: ['初九', '六二', '九三', '九四', '六五', '上九']
  },
  shenSha: {
    驿马: '申',
    桃花: '卯'
  }
};

const sampleZiWeiData = {
  gender: '男',
  chineseDate: '庚辰年二月初二辰时',
  fiveElementsClass: '金四局',
  body: '天相',
  soul: '贪狼',
  earthlyBranchOfBodyPalace: '午',
  birthDateInfo: {
    year: 2000,
    month: 3,
    day: 20,
    hour: 8,
    minute: 30
  },
  birthDateTime: '2000-03-20 08:30',
  horoscopeTargetDateTime: '2026-03-20 10:30',
  soulPalace: {
    name: '命宫',
    majorStarText: '紫微,天府'
  },
  bodyPalace: {
    name: '迁移'
  },
  horoscope: {
    age: {
      nominalAge: 27
    },
    yearly: {
      palaceNames: ['命宫', '兄弟']
    }
  },
  palaces: [
    {
      index: 0,
      name: '命宫',
      heavenlyStem: '甲',
      earthlyBranch: '子',
      isBodyPalace: true,
      majorStars: [{ name: '紫微', brightness: '庙' }],
      minorStars: [{ name: '左辅' }],
      adjectiveStars: [{ name: '天喜' }],
      suiqian12: '岁建',
      jiangqian12: '将星',
      changsheng12: '长生',
      boshi12: '博士',
      decadal: {
        range: [1, 10]
      },
      ages: [1, 13, 25]
    },
    {
      index: 1,
      name: '兄弟',
      heavenlyStem: '乙',
      earthlyBranch: '丑',
      majorStars: [{ name: '天机', brightness: '旺' }],
      minorStars: [{ name: '文昌' }],
      adjectiveStars: [{ name: '天德' }],
      suiqian12: '晦气',
      jiangqian12: '攀鞍',
      changsheng12: '沐浴',
      boshi12: '力士',
      decadal: {
        range: [11, 20]
      },
      ages: [2, 14, 26]
    }
  ]
};

describe('fortunePayload', () => {
  it('识别五种支持的 AI 解读模式', () => {
    expect(isAiInterpretationSupportedMode('qimen')).toBe(true);
    expect(isAiInterpretationSupportedMode('daliuren')).toBe(true);
    expect(isAiInterpretationSupportedMode('liuyao')).toBe(true);
    expect(isAiInterpretationSupportedMode('bazi')).toBe(true);
    expect(isAiInterpretationSupportedMode('ziwei')).toBe(true);
    expect(isAiInterpretationSupportedMode('unknown')).toBe(false);
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

  it('构建稳定的奇门 AI 载荷', () => {
    const payload = buildFortunePayload('qimen', sampleQimenData, {
      referenceDateTime: '2026-03-20 10:30',
      method: 'chaibu'
    });

    expect(payload.mode).toBe('qimen');
    expect(payload.meta.method).toBe('拆补法');
    expect(payload.summary.core).toContain('值符 天心');
    expect(payload.promptText).toContain('奇门遁甲排盘');
    expect(payload.promptText).toContain('值使：开门');
  });

  it('构建稳定的大六壬 AI 载荷', () => {
    const payload = buildFortunePayload('daliuren', sampleDaLiuRenData, {
      referenceDateTime: '2026-03-20 10:30'
    });

    expect(payload.mode).toBe('daliuren');
    expect(payload.summary.core).toContain('三传');
    expect(payload.promptText).toContain('大六壬排盘');
    expect(payload.promptText).toContain('大六壬直指');
  });

  it('构建稳定的六爻 AI 载荷', () => {
    const payload = buildFortunePayload('liuyao', sampleLiuYaoData, {
      referenceDateTime: '2026-03-20 10:30',
      liuyaoInputMode: 'manual'
    });

    expect(payload.mode).toBe('liuyao');
    expect(payload.meta.inputMode).toBe('manual');
    expect(payload.summary.core).toContain('本卦 火天大有');
    expect(payload.promptText).toContain('六爻排盘');
    expect(payload.promptText).toContain('变卦');
  });

  it('构建稳定的紫微 AI 载荷', () => {
    const payload = buildFortunePayload('ziwei', sampleZiWeiData, {
      targetMode: 'custom',
      targetDateTime: '2026-03-20 10:30',
      quickSelection: {
        activeDecadalKey: '1-10',
        activeYearlyKey: '2026'
      }
    });

    expect(payload.mode).toBe('ziwei');
    expect(payload.meta.targetMode).toBe('custom');
    expect(payload.summary.core).toContain('命宫');
    expect(payload.summary.core).toContain('目标时间 2026-03-20 10:30');
    expect(payload.promptText).toContain('紫微斗数');
  });

  it('对未支持模式给出明确错误', () => {
    expect(() => buildFortunePayload('unknown', {})).toThrow('暂不支持 unknown 模式的 AI 解读载荷');
  });

  it('在奇门关键字段缺失时抛明确错误', () => {
    expect(() => buildFortunePayload('qimen', { jieQi: '春分' })).toThrow('奇门排盘缺少值符信息');
  });

  it('在大六壬关键字段缺失时抛明确错误', () => {
    expect(() => buildFortunePayload('daliuren', { dateStr: '2026-03-20 10:30' })).toThrow('大六壬排盘缺少三传数据');
  });

  it('在六爻关键字段缺失时抛明确错误', () => {
    expect(() => buildFortunePayload('liuyao', { dateStr: '2026-03-20 10:30' })).toThrow('六爻排盘缺少本卦数据');
  });

  it('在紫微关键字段缺失时抛明确错误', () => {
    expect(() => buildFortunePayload('ziwei', { gender: '男' })).toThrow('紫微斗数排盘缺少宫位数据');
  });
});
