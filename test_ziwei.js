import assert from 'node:assert/strict';
import dayjs from 'dayjs';
import { getZiWeiPaiPan, getZiWeiTimeIndex } from './src/utils/ziwei.js';
import { resolveZiWeiStarBrightness } from './src/utils/ziwei_brightness.js';
import { buildZiWeiCopyText } from './src/utils/ziwei_copy.js';
import { getZiWeiSectionLabel, getZiWeiStarDisplayName } from './src/utils/ziwei_naming.js';
import {
  getZiWeiPalaceScopeLabels,
  getZiWeiPalaceDisplayStars,
  getZiWeiStarMetaDisplayItems,
  getZiWeiStarScopeMutagenSlots,
  getZiWeiStarDisplayMeta,
  getZiWeiVerticalTextTokens,
  getZiWeiVisibleStars
} from './src/utils/ziwei_display.js';
import {
  buildZiWeiDecadalOptions,
  buildZiWeiDailyOptions,
  buildZiWeiMonthlyOptions,
  buildZiWeiYearlyOptions,
  deriveZiWeiFullSelectionState,
  getCopyBlockReason,
  getZiWeiQuickSelectionState,
  resolveZiWeiTargetDateTime,
  shiftZiWeiTargetDateByAge,
  shiftZiWeiTargetDateByDay,
  shiftZiWeiTargetDateByMonth
} from './src/utils/ziwei_app.js';

const run = () => {
  const sampleDate = new Date(2000, 7, 16, 3, 0, 0);
  const targetDate = new Date(2026, 2, 6, 10, 0, 0);
  const currentPanDate = new Date(2026, 2, 6, 14, 53, 0);
  const panData = getZiWeiPaiPan(sampleDate, '男', targetDate);
  const currentPanData = getZiWeiPaiPan(currentPanDate, '男', currentPanDate);
  const copyText = buildZiWeiCopyText(panData);
  const decadalOptions = buildZiWeiDecadalOptions(panData);
  const currentDecadalOption = decadalOptions.find((item) => item.isCurrent) || null;
  const yearlyOptions = buildZiWeiYearlyOptions(panData, dayjs('2026-03-06 10:00'));
  const monthlyOptions = buildZiWeiMonthlyOptions(dayjs('2026-03-06 10:00'));
  const dailyOptions = buildZiWeiDailyOptions(dayjs('2026-03-06 10:00'));
  const birthSelectionState = getZiWeiQuickSelectionState('birth', {
    activeDecadalKey: currentDecadalOption?.key || '',
    activeYearlyKey: '27',
    activeMonthlyKey: '3',
    activeDailyKey: '6'
  });
  const decadalOnlySelectionState = getZiWeiQuickSelectionState('custom', {
    activeDecadalKey: '23-32',
    activeYearlyKey: '',
    activeMonthlyKey: '',
    activeDailyKey: ''
  });
  const fullDerivedSelectionState = deriveZiWeiFullSelectionState(panData, dayjs('2026-03-06 10:00'));
  const palaceStars = panData.palaces.flatMap((palace) => [
    ...palace.majorStars,
    ...palace.minorStars,
    ...palace.adjectiveStars
  ]);
  const findStar = (palaceName, starName) => {
    const palace = panData.palaces.find((item) => item.name === palaceName);

    assert.ok(palace, `应存在 ${palaceName}`);

    const star = [...palace.majorStars, ...palace.minorStars, ...palace.adjectiveStars]
      .find((item) => item.name === starName);

    assert.ok(star, `${palaceName} 应包含 ${starName}`);

    return star;
  };
  const findCurrentStar = (palaceName, starName) => {
    const palace = currentPanData.palaces.find((item) => item.name === palaceName);

    assert.ok(palace, `当前盘应存在 ${palaceName}`);

    const star = [...palace.majorStars, ...palace.minorStars, ...palace.adjectiveStars]
      .find((item) => item.name === starName);

    assert.ok(star, `当前盘 ${palaceName} 应包含 ${starName}`);

    return star;
  };
  const starWithState = palaceStars.find((star) => Boolean(star.brightness));

  assert.equal(getZiWeiTimeIndex(new Date(2026, 2, 6, 0, 30, 0)), 0, '00:30 应映射为早子时');
  assert.equal(getZiWeiTimeIndex(new Date(2026, 2, 6, 23, 30, 0)), 12, '23:30 应映射为晚子时');
  assert.equal(getZiWeiTimeIndex(new Date(2026, 2, 6, 3, 0, 0)), 2, '03:00 应映射为寅时');
  assert.equal(resolveZiWeiStarBrightness({ name: '左辅' }, '戌'), '庙', '左辅在戌宫应补齐为庙');
  assert.equal(resolveZiWeiStarBrightness({ name: '红鸾' }, '亥'), '旺', '红鸾在亥宫应补齐为旺');
  assert.equal(resolveZiWeiStarBrightness({ name: '天喜' }, '卯'), '旺', '天喜在卯宫应按文墨样例修正为旺');
  assert.equal(resolveZiWeiStarBrightness({ name: '天钺' }, '酉'), '庙', '天钺在酉宫应补齐为庙');
  assert.equal(resolveZiWeiStarBrightness({ name: '未知星' }, '子'), '', '未配置的星曜不应硬填亮度');
  assert.equal(getZiWeiStarDisplayName('官府'), '官符', '官府应按文墨风格显示为官符');
  assert.equal(getZiWeiSectionLabel('boshi12'), '太岁煞禄', '博士十二神标签应按文墨风格输出');
  assert.equal(
    getZiWeiVisibleStars([{ name: '紫微' }, null, { name: '天机' }]).length,
    2,
    '星曜展示列表应保留全部有效星曜，不应截断'
  );
  assert.deepEqual(getZiWeiVisibleStars(null), [], '无效星曜列表应返回空数组');
  assert.deepEqual(
    getZiWeiPalaceDisplayStars({
      majorStars: [{ name: '紫微' }],
      minorStars: [null, { name: '文昌' }],
      adjectiveStars: [{ name: '天喜' }]
    }).map((item) => item.name),
    ['紫微', '文昌', '天喜'],
    '宫位星曜展示序列应按主星、辅星、杂曜顺序合并，并忽略无效项'
  );
  assert.deepEqual(getZiWeiPalaceDisplayStars(null), [], '无效宫位数据应返回空展示序列');
  assert.deepEqual(getZiWeiVerticalTextTokens('紫微'), ['紫', '微'], '星名竖排应按单字拆分');
  assert.deepEqual(getZiWeiVerticalTextTokens('  天机 '), ['天', '机'], '竖排拆分前应去掉首尾空白');
  assert.deepEqual(getZiWeiVerticalTextTokens(null), [], '无效竖排文本应返回空数组');
  assert.deepEqual(
    getZiWeiStarScopeMutagenSlots({
      palaceName: '夫妻',
      star: { name: '文曲' },
      visibleScopes: ['birth', 'decadal', 'yearly', 'monthly', 'daily'],
      birthMutagenSummary: [{ palaceName: '命宫', starName: '文曲', mutagen: '科' }],
      decadalMutagenSummary: [],
      yearlyMutagenSummary: [{ palaceName: '夫妻', starName: '文曲', mutagen: '忌' }],
      monthlyMutagenSummary: [{ palaceName: '夫妻', starName: '文曲', mutagen: '权' }],
      dailyMutagenSummary: []
    }),
    [
      { scope: 'birth', mutagen: '', empty: true },
      { scope: 'decadal', mutagen: '', empty: true },
      { scope: 'yearly', mutagen: '忌', empty: false },
      { scope: 'monthly', mutagen: '权', empty: false },
      { scope: 'daily', mutagen: '', empty: true }
    ],
    '星曜作用域四化应按固定层级输出，并为缺失项保留空槽位'
  );
  assert.deepEqual(
    getZiWeiPalaceScopeLabels({
      palaceIndex: 0,
      visibleScopes: ['decadal', 'yearly'],
      horoscope: {
        decadal: { palaceNames: ['命宫'] },
        yearly: { palaceNames: ['夫妻'] }
      }
    }),
    [
      { scope: 'decadal', label: '大限命宫' },
      { scope: 'yearly', label: '流年夫妻宫' }
    ],
    '宫位作用域标签应补齐“宫”字并保留作用域前缀'
  );
  assert.deepEqual(
    getZiWeiStarMetaDisplayItems({ name: '文曲', brightness: '旺', mutagen: '科' }),
    [
      { key: 'state', value: '旺' },
      { key: 'mutagen', value: '科' }
    ],
    '星曜元信息展示顺序应为亮度在上、四化在下'
  );
  assert.deepEqual(
    getZiWeiStarDisplayMeta({ name: '紫微', brightness: '庙' }),
    { name: '紫微', mutagen: '', selfMutagens: [], state: '庙', title: '紫微 庙' },
    '星曜展示元数据应包含亮度状态'
  );
  assert.deepEqual(
    getZiWeiStarDisplayMeta({ name: '文曲', brightness: '旺', mutagen: '科', selfMutagens: ['忌'] }),
    { name: '文曲', mutagen: '科', selfMutagens: ['忌'], state: '旺', title: '文曲 化科 旺' },
    '星曜展示元数据应仅展示星曜自身四化，不显示自化文本'
  );
  assert.deepEqual(
    getZiWeiStarDisplayMeta(null),
    { name: '未识别', mutagen: '', selfMutagens: [], state: '', title: '未识别' },
    '无效星曜数据应返回兜底展示信息'
  );
  assert.equal(
    resolveZiWeiTargetDateTime(
      'birth',
      dayjs('2031-02-03 04:05'),
      dayjs('2030-01-02 03:04'),
      dayjs('2000-08-16 03:00')
    ).format('YYYY-MM-DD HH:mm'),
    '2000-08-16 03:00',
    '本命盘模式应始终使用出生时间'
  );
  assert.equal(
    resolveZiWeiTargetDateTime('now', dayjs('2000-01-01 08:00'), dayjs('2030-01-02 03:04')).format('YYYY-MM-DD HH:mm'),
    '2030-01-02 03:04',
    '当前时间模式应始终使用最新当前时间'
  );
  assert.equal(
    resolveZiWeiTargetDateTime('custom', dayjs('2031-02-03 04:05'), dayjs('2030-01-02 03:04')).format('YYYY-MM-DD HH:mm'),
    '2031-02-03 04:05',
    '自定义模式应保留用户指定时间'
  );
  assert.equal(
    getCopyBlockReason('ziwei', true, panData),
    '紫微斗数模块仍在加载，请稍后再复制',
    '紫微加载中时应阻止复制'
  );
  assert.equal(
    getCopyBlockReason('ziwei', false, { error: '紫微斗数排盘失败：出生时间无效' }),
    '紫微斗数排盘失败：出生时间无效',
    '排盘失败时应阻止复制并返回明确错误'
  );
  assert.equal(decadalOptions.length, 12, '应基于十二宫生成完整的大限切换选项');
  assert.equal(decadalOptions[0].primaryLabel, '3-12', '大限切换选项应按年龄升序排列');
  assert.equal(
    decadalOptions.find((item) => item.isCurrent)?.key,
    '23-32',
    '当前大限应被正确标记'
  );
  assert.equal(yearlyOptions.length, 10, '应根据当前大限生成十个流年切换选项');
  assert.equal(yearlyOptions[0].primaryLabel, '2022', '流年切换应能正确反推起始公历年份');
  assert.equal(
    yearlyOptions.find((item) => item.isCurrent)?.nominalAge,
    27,
    '当前流年应被正确标记'
  );
  assert.equal(monthlyOptions.length, 12, '应生成完整的十二个月流月切换选项');
  assert.equal(monthlyOptions[2].isCurrent, true, '当前流月应被正确标记');
  assert.equal(dailyOptions.length, 31, '应根据目标月份生成完整的流日切换选项');
  assert.equal(dailyOptions[5].isCurrent, true, '当前流日应被正确标记');
  assert.deepEqual(
    birthSelectionState,
    {
      activeDecadalKey: '',
      activeYearlyKey: '',
      activeMonthlyKey: '',
      activeDailyKey: '',
      isBirthChart: true
    },
    '本命盘模式下大运流年流月流日都不应默认高亮'
  );
  assert.deepEqual(
    decadalOnlySelectionState,
    {
      activeDecadalKey: '23-32',
      activeYearlyKey: '',
      activeMonthlyKey: '',
      activeDailyKey: '',
      isBirthChart: false
    },
    '仅选择大限时，不应自动选中流年流月流日'
  );
  assert.deepEqual(
    fullDerivedSelectionState,
    {
      activeDecadalKey: '23-32',
      activeYearlyKey: '27',
      activeMonthlyKey: '3',
      activeDailyKey: '6',
      isBirthChart: false
    },
    '直接给定目标时间时，应能回填完整的大限流年流月流日路径'
  );
  assert.equal(
    shiftZiWeiTargetDateByAge(dayjs('2026-03-06 10:00'), 27, 23).format('YYYY-MM-DD HH:mm'),
    '2022-03-06 10:00',
    '按虚岁切换运限时应按年龄差平移目标时间'
  );
  assert.equal(
    shiftZiWeiTargetDateByMonth(dayjs('2026-03-31 10:00'), 2).format('YYYY-MM-DD HH:mm'),
    '2026-02-28 10:00',
    '流月切换时应自动处理月底越界'
  );
  assert.equal(
    shiftZiWeiTargetDateByDay(dayjs('2026-03-06 10:00'), 21).format('YYYY-MM-DD HH:mm'),
    '2026-03-21 10:00',
    '流日切换时应保留月份和时分'
  );

  assert.equal(panData.gender, '男');
  assert.equal(panData.horoscopeTargetDateTime, '2026-03-06 10:00', '应输出固定的运限目标时间');
  assert.equal(panData.palaces.length, 12, '紫微斗数应返回十二宫');
  assert.ok(panData.soulPalace, '应存在命宫');
  assert.ok(panData.bodyPalace, '应存在身宫');
  assert.equal(panData.palaces.some((palace) => palace.name === '仆役'), false, '宫位名称不应再显示为仆役');
  assert.equal(panData.palaces.some((palace) => palace.name === '交友'), true, '宫位名称应统一显示为交友');
  assert.equal(findCurrentStar('子女', '截空').brightness, '陷', '当前盘应使用中州派截空命名');
  assert.equal(findCurrentStar('迁移', '龙德').brightness, '', '当前盘龙德应已出现，未配置亮度时保持为空');
  assert.equal(findCurrentStar('迁移', '大耗').brightness, '平', '当前盘大耗应与文墨样例一致');
  assert.equal(findCurrentStar('官禄', '劫杀').brightness, '', '当前盘劫杀应已出现，未配置亮度时保持为空');
  assert.equal(findCurrentStar('财帛', '副旬').brightness, '平', '当前盘应补出文墨风格副旬');
  assert.equal(findCurrentStar('夫妻', '副截').brightness, '庙', '当前盘应补出文墨风格副截');
  assert.ok(starWithState, '示例命盘应至少存在带亮度状态的星曜');
  assert.ok(getZiWeiStarDisplayMeta(starWithState).state, '宫位星曜展示应能读取亮度状态');
  assert.ok(
    panData.birthMutagenSummary.every((item) => {
      const targetPalace = panData.palaces.find((palace) => palace.name === item.palaceName);
      return targetPalace
        ? [...targetPalace.majorStars, ...targetPalace.minorStars, ...targetPalace.adjectiveStars]
          .some((star) => star.name === item.starName && star.mutagen === item.mutagen)
        : false;
    }),
    '生年四化应直接挂在对应星曜对象上，供界面跟随星名展示'
  );
  assert.deepEqual(
    findStar('子女', '天梁').selfMutagens,
    ['科'],
    '子女宫的自科应挂在对应的天梁星后'
  );
  assert.deepEqual(
    findStar('命宫', '紫微').selfMutagens,
    ['权'],
    '命宫的自权应挂在对应的紫微星后'
  );
  assert.deepEqual(
    findStar('官禄', '廉贞').selfMutagens,
    ['忌'],
    '官禄宫的自忌应挂在对应的廉贞星后'
  );
  assert.equal(findStar('官禄', '左辅').brightness, '庙', '左辅应补齐宫位亮度');
  assert.equal(findStar('财帛', '天马').brightness, '旺', '天马应补齐宫位亮度');
  assert.equal(findStar('福德', '禄存').brightness, '平', '禄存应补齐宫位亮度');
  assert.equal(findStar('田宅', '地空').brightness, '庙', '地空应补齐宫位亮度');
  assert.equal(findStar('交友', '红鸾').brightness, '旺', '红鸾应补齐宫位亮度');
  assert.equal(findStar('财帛', '天寿').brightness, '旺', '天寿应补齐宫位亮度');
  assert.equal(findStar('疾厄', '天使').brightness, '陷', '天使应补齐宫位亮度');
  assert.equal(findCurrentStar('交友', '天哭').brightness, '平', '当前盘天哭应与文墨样例一致');
  assert.equal(findCurrentStar('交友', '天虚').brightness, '陷', '当前盘天虚应与文墨样例一致');
  assert.equal(findCurrentStar('财帛', '天喜').brightness, '旺', '当前盘天喜应与文墨样例一致');
  assert.equal(findCurrentStar('夫妻', '禄存').brightness, '庙', '当前盘禄存应与文墨样例一致');
  assert.equal(findCurrentStar('命宫', '天空').brightness, '陷', '当前盘天空应与文墨样例一致');
  assert.equal(findCurrentStar('父母', '解神').brightness, '不', '当前盘解神应与文墨样例一致');
  assert.equal(findCurrentStar('福德', '天钺').brightness, '庙', '当前盘天钺应与文墨样例一致');
  assert.equal(findCurrentStar('福德', '红鸾').brightness, '旺', '当前盘红鸾应与文墨样例一致');
  assert.equal(findCurrentStar('田宅', '龙池').brightness, '陷', '当前盘龙池应与文墨样例一致');
  assert.equal(findCurrentStar('官禄', '天魁').brightness, '旺', '当前盘天魁应与文墨样例一致');
  assert.equal(
    currentPanData.palaces.some((palace) => [...palace.adjectiveStars].some((star) => star.name === '空亡')),
    false,
    '中州派当前盘不应再出现空亡星'
  );
  assert.equal(currentPanData.palaces.find((palace) => palace.name === '子女')?.boshi12, '官符', '太岁煞禄星名应贴近文墨风格');
  assert.ok(
    copyText.startsWith('你现在是一位研究紫微斗数超过30年的资深命理专家，同时也是术数研究学者，精通以下体系：'),
    '复制文本应在最前面带上新的紫微分析角色说明'
  );
  assert.ok(copyText.includes('【第四部分：四化飞星系统】'), '复制文本前缀应包含完整的分析步骤说明');
  assert.ok(copyText.includes('下面是需要分析的文墨天机紫微斗数命盘数据：\n\n├基本信息'), '复制文本前缀后应紧接树形命盘数据');
  assert.ok(copyText.includes('├基本信息'), '复制文本应切换为树形基本信息区块');
  assert.ok(copyText.includes('├命盘十二宫'), '复制文本应切换为树形十二宫区块');
  assert.ok(copyText.includes('│ ├钟表时间 : 2000-8-16 03:00'), '复制文本应输出出生钟表时间');
  assert.ok(copyText.includes('│ ├真太阳时 : 2000-8-16 02:56'), '复制文本应输出推导后的真太阳时');
  assert.ok(copyText.includes('│ ├节气四柱 : 庚辰 甲申 丙午 庚寅'), '复制文本应输出节气四柱');
  assert.ok(copyText.includes('│ ├非节气四柱 : 庚辰 甲申 丙午 庚寅'), '复制文本应输出非节气四柱');
  assert.ok(copyText.includes('│ └身主:文昌; 命主:廉贞; 子年斗君:申; 身宫:戌'), '复制文本应输出身主、命主、斗君与身宫');
  assert.ok(copyText.includes('│ ├迁移宫[戊子]'), '复制文本中的十二宫应按地支顺序输出');
  assert.ok(copyText.includes('太阴[庙][生年科][自化禄]'), '复制文本应在星曜后带出亮度、生年四化与自化标签');
  assert.ok(copyText.includes('太岁煞禄'), '复制文本应使用文墨风格的太岁煞禄标签');
  assert.ok(copyText.includes('岁前星'), '复制文本应使用文墨风格的岁前星标签');
  assert.ok(copyText.includes('将前星'), '复制文本应使用文墨风格的将前星标签');
  assert.ok(copyText.includes('十二长生'), '复制文本应使用文墨风格的十二长生标签');
  assert.ok(!copyText.includes('博士十二神'), '复制文本不应再使用旧的博士十二神标签');
  assert.ok(!copyText.includes('【自动判语】'), '复制文本不应再包含旧的自动判语区块');
  assert.ok(!copyText.includes('【目标运限】'), '复制文本不应再包含旧的目标运限区块');
  assert.ok(!copyText.includes('【十二宫】'), '复制文本不应再包含旧的自由文本十二宫标题');
  assert.ok(panData.horoscope.yearly.mutagen.length > 0, '应包含流年四化');
  assert.equal(panData.birthMutagenSummary.length, 4, '应返回完整的生年四化摘要');
  assert.equal(panData.monthlyMutagenSummary.length, 4, '应返回完整的流月四化落宫');
  assert.equal(panData.dailyMutagenSummary.length, 4, '应返回完整的流日四化落宫');
  assert.ok(
    panData.birthMutagenSummary.every((item) => item.starName && item.mutagen),
    '生年四化摘要应包含四化类型与对应星曜'
  );
  assert.equal(panData.yearlyMutagenSummary.length, 4, '应返回完整的流年四化落宫');
  assert.ok(panData.commandPalaceOverview.length >= 4, '应返回命迁财官摘要');
  assert.ok(panData.autoInsights.length > 0, '应生成自动判语');
  assert.ok(
    panData.autoInsights.every((item) => typeof item.title === 'string' && item.title && typeof item.message === 'string' && item.message),
    '自动判语应包含标题和内容'
  );
  assert.ok(
    panData.corePalaceSummaries.every((item) => item.surrounding.rolePalaces.length === 4 && item.flyMutagens.length === 4),
    '每个核心宫位都应包含三方四正和四化飞宫摘要'
  );
  assert.ok(
    panData.palaces.every((palace) => Array.isArray(palace.majorStars) && Array.isArray(palace.minorStars) && Array.isArray(palace.adjectiveStars)),
    '每个宫位都应包含主星/辅星/杂耀数组'
  );
  assert.ok(
    panData.palaces.every((palace) => Array.isArray(palace.mutagenTags) && Array.isArray(palace.selfMutagens)),
    '每个宫位都应包含四化标签和自化信息'
  );

  let errorCaught = false;
  try {
    getZiWeiPaiPan(new Date('invalid date'), '男');
  } catch (error) {
    errorCaught = true;
    assert.match(error.message, /出生时间无效/);
  }

  assert.equal(errorCaught, true, '无效日期应抛出异常');
  assert.equal(panData.horoscope.solarDate, '2026-3-6', '应使用固定运限目标日期');
  assert.deepEqual(
    panData.birthDateInfo,
    { year: 2000, month: 8, day: 16, hour: 3, minute: 0 },
    '紫微排盘结果应保留出生钟表时间供复制文本复用'
  );

  console.log('[test_ziwei] 所有断言通过');
};

run();
