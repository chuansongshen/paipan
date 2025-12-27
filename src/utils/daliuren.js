import { Lunar, Solar } from 'lunar-javascript';
import { ZHI_ZHI_DATA } from './zhizhi_data.js';

const GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const JIANG = ['贵人', '螣蛇', '朱雀', '六合', '勾陈', '青龙', '天空', '白虎', '太常', '玄武', '太阴', '天后'];

// Parasitic Palaces for Stems (Ji Gong)
const JI_GONG = {
  '甲': '寅', '乙': '辰', '丙': '巳', '丁': '未', '戊': '巳',
  '己': '未', '庚': '申', '辛': '戌', '壬': '亥', '癸': '丑'
};

// Yue Jiang (Monthly General) Mapping based on Solar Terms (approximate for simplicity, better to use strict solar terms)
// But strictly, Yue Jiang changes at the exact time of the Solar Term.
// Rain Water (Yu Shui) -> Hai
// Spring Equinox (Chun Fen) -> Xu
// Grain Rain (Gu Yu) -> You
// ...
const YUE_JIANG_MAP = {
  '雨水': '亥', '惊蛰': '亥',
  '春分': '戌', '清明': '戌',
  '谷雨': '酉', '立夏': '酉',
  '小满': '申', '芒种': '申',
  '夏至': '未', '小暑': '未',
  '大暑': '午', '立秋': '午',
  '处暑': '巳', '白露': '巳',
  '秋分': '辰', '寒露': '辰',
  '霜降': '卯', '立冬': '卯',
  '小雪': '寅', '大雪': '寅',
  '冬至': '丑', '小寒': '丑',
  '大寒': '子', '立春': '子'
};

// Get ZHI index
const getZhiIdx = (z) => ZHI.indexOf(z);
// Get GAN index
const getGanIdx = (g) => GAN.indexOf(g);

// ========== Shen Sha Constants ==========

// Year Deities (岁煞) - indexed by year branch
const SHEN_SHA = {
  // Stem-based (for year stem, indexed by stem 0-9)
  suide: ['甲', '庚', '丙', '壬', '戊', '甲', '庚', '丙', '壬', '戊'], // 岁德
  suidehe: ['己', '乙', '辛', '丁', '癸', '己', '乙', '辛', '丁', '癸'], // 岁德合
  
  // Year Branch-based (indexed by branch 0-11: 子丑寅...)
  liuhe: ['丑', '子', '亥', '戌', '酉', '申', '未', '午', '巳', '辰', '卯', '寅'], // 六合
  dizhipo: ['午', '未', '申', '酉', '戌', '亥', '子', '丑', '寅', '卯', '辰', '巳'], // 地支破
  suimu: ['未', '申', '酉', '戌', '亥', '子', '丑', '寅', '卯', '辰', '巳', '午'], // 岁墓
  suixing: ['卯', '戌', '巳', '子', '辰', '申', '午', '丑', '寅', '酉', '未', '亥'], // 岁刑
  suisha: ['未', '辰', '丑', '戌', '未', '辰', '丑', '戌', '未', '辰', '丑', '戌'], // 岁煞
  zaisha: ['午', '卯', '子', '酉', '午', '卯', '子', '酉', '午', '卯', '子', '酉'], // 灾煞
  dahao: ['午', '未', '申', '酉', '戌', '亥', '子', '丑', '寅', '卯', '辰', '巳'], // 大耗
  xiaohao: ['巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑', '寅', '卯', '辰'], // 小耗
  nianjiangjun: ['酉', '酉', '子', '子', '子', '卯', '卯', '卯', '午', '午', '午', '酉'], // 将军
  
  // Season Deities (季煞) - indexed by month branch
  tianzhuan: ['壬子', '壬子', '乙卯', '乙卯', '乙卯', '丙午', '丙午', '丙午', '辛酉', '辛酉', '辛酉', '壬子'], // 天转
  dizhuan: ['丙子', '丙子', '辛卯', '辛卯', '辛卯', '戊午', '戊午', '戊午', '癸酉', '癸酉', '癸酉', '丙子'], // 地转
  guchen: ['寅', '寅', '巳', '巳', '巳', '申', '申', '申', '亥', '亥', '亥', '寅'], // 孤辰
  guasu: ['戌', '戌', '丑', '丑', '丑', '辰', '辰', '辰', '未', '未', '未', '戌'], // 寡宿
  huangshu: ['亥', '亥', '寅', '寅', '寅', '巳', '巳', '巳', '申', '申', '申', '亥'], // 皇书
  sangche: ['午', '午', '酉', '酉', '酉', '子', '子', '子', '卯', '卯', '卯', '午'], // 丧车煞
  yupen: ['丑', '丑', '辰', '辰', '辰', '未', '未', '未', '戌', '戌', '戌', '丑'], // 浴盆
  tianshe: ['子', '子', '寅', '寅', '寅', '午', '午', '午', '申', '申', '申', '子'], // 天赦
  huogui: ['卯', '卯', '午', '午', '午', '酉', '酉', '酉', '子', '子', '子', '卯'], // 火鬼
  feihuo: ['亥', '亥', '申', '申', '申', '寅', '寅', '寅', '巳', '巳', '巳', '亥'], // 飞祸
  tianche: ['戌', '戌', '丑', '丑', '丑', '辰', '辰', '辰', '未', '未', '未', '戌'], // 天车
  tiandao: ['子', '子', '酉', '酉', '酉', '午', '午', '午', '卯', '卯', '卯', '子'], // 天盗
  tianxi: ['未', '未', '戌', '戌', '戌', '丑', '丑', '丑', '辰', '辰', '辰', '未'], // 天禧
  yueshen: ['寅', '寅', '巳', '巳', '巳', '申', '申', '申', '亥', '亥', '亥', '寅'], // 钥神
  sanqiu: ['未', '未', '丑', '丑', '丑', '辰', '辰', '辰', '戌', '戌', '戌', '未'], // 三丘
  sifei: ['午', '午', '酉', '酉', '酉', '子', '子', '子', '卯', '卯', '卯', '午'], // 四废
  wumu: ['丑', '丑', '未', '未', '未', '戌', '戌', '戌', '辰', '辰', '辰', '丑'], // 五墓
  xishen: ['辰', '辰', '巳', '巳', '巳', '子', '子', '子', '酉', '酉', '酉', '辰'], // 戏神
  youshen: ['戌', '戌', '丑', '丑', '丑', '子', '子', '子', '亥', '亥', '亥', '戌'], // 游神
  jianshen: ['巳', '巳', '寅', '寅', '寅', '亥', '亥', '亥', '申', '申', '申', '巳'], // 奸神
  
  // Month Deities (月煞) - indexed by month branch
  jiesha: ['巳', '寅', '亥', '申', '巳', '寅', '亥', '申', '巳', '寅', '亥', '申'], // 劫煞
  tianma: ['寅', '辰', '午', '申', '戌', '子', '寅', '辰', '午', '申', '戌', '子'], // 天马
  yuede: ['亥', '申', '巳', '寅', '亥', '申', '巳', '寅', '亥', '申', '巳', '寅'], // 月德
  tiande: ['巳', '庚', '丁', '申', '壬', '辛', '亥', '甲', '癸', '寅', '丙', '乙'], // 天德
  shengqi: ['戌', '亥', '子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉'], // 生气
  siqi: ['辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑', '寅', '卯'], // 死气
  sishen: ['卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑', '寅'], // 死神
  yuepo: ['午', '未', '申', '酉', '戌', '亥', '子', '丑', '寅', '卯', '辰', '巳'], // 月破
  tianyi: ['申', '酉', '戌', '亥', '子', '丑', '寅', '卯', '辰', '巳', '午', '未'], // 天医
  diyi: ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'], // 地医
  chengshen: ['亥', '寅', '巳', '申', '亥', '寅', '巳', '申', '亥', '寅', '巳', '申'], // 成神
  huishen: ['申', '辰', '未', '戌', '寅', '亥', '酉', '子', '丑', '午', '巳', '卯'], // 会神
  tiancai: ['子', '寅', '辰', '午', '申', '戌', '子', '寅', '辰', '午', '申', '戌'], // 天财
  xinshen: ['申', '戌', '寅', '丑', '亥', '辰', '巳', '未', '巳', '未', '申', '戌'], // 信神
  tianji: ['亥', '戌', '酉', '申', '未', '午', '巳', '辰', '卯', '寅', '丑', '子'], // 天鸡
  tianzhao: ['酉', '戌', '亥', '子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申'], // 天诏
  huangen: ['卯', '巳', '未', '酉', '亥', '丑', '卯', '巳', '未', '酉', '亥', '丑'], // 皇恩
  shengxin: ['亥', '巳', '子', '午', '丑', '未', '寅', '申', '卯', '酉', '辰', '戌'], // 圣心
  changsheng: ['卯', '子', '酉', '午', '卯', '子', '酉', '午', '卯', '子', '酉', '午'], // 长绳
  xuansuo: ['酉', '午', '卯', '子', '酉', '午', '卯', '子', '酉', '午', '卯', '子'], // 悬索
  jianmen: ['寅', '巳', '申', '亥', '寅', '巳', '申', '亥', '寅', '巳', '申', '亥'], // 奸门
  tianwu: ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'], // 天巫
  tianjieshen: ['辰', '午', '申', '戌', '子', '寅', '辰', '午', '申', '戌', '子', '寅'], // 天解神
  yuexing: ['卯', '戌', '巳', '子', '辰', '申', '午', '丑', '寅', '酉', '未', '亥'], // 月刑
  mihuo: ['未', '辰', '丑', '戌', '未', '辰', '丑', '戌', '未', '辰', '丑', '戌'], // 迷惑
  kugu: ['巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑', '寅', '卯', '辰'], // 枯骨
  xuezhi: ['亥', '子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌'], // 血支
  xueji: ['丑', '未', '寅', '申', '卯', '酉', '辰', '戌', '巳', '亥', '午', '子'], // 血忌
  cihusha: ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'], // 雌虎煞
  chansha: ['申', '亥', '寅', '巳', '申', '亥', '寅', '巳', '申', '亥', '寅', '巳'], // 产煞
  xianchi: ['酉', '午', '卯', '子', '酉', '午', '卯', '子', '酉', '午', '卯', '子'], // 咸池
  yueyan: ['子', '亥', '戌', '酉', '申', '未', '午', '巳', '辰', '卯', '寅', '丑'], // 月厌
  feilian: ['申', '酉', '戌', '巳', '午', '未', '寅', '卯', '辰', '亥', '子', '丑'], // 飞廉
  tiangui: ['卯', '子', '酉', '午', '卯', '子', '酉', '午', '卯', '子', '酉', '午'], // 天鬼
  leigong: ['申', '巳', '寅', '亥', '申', '巳', '寅', '亥', '申', '巳', '寅', '亥'], // 雷公
  leisha: ['巳', '寅', '亥', '申', '巳', '寅', '亥', '申', '巳', '寅', '亥', '申'], // 雷煞
  fengbo: ['戌', '酉', '申', '未', '午', '巳', '辰', '卯', '寅', '丑', '子', '亥'], // 风伯
  fengsha: ['辰', '卯', '寅', '丑', '子', '亥', '戌', '酉', '申', '未', '午', '巳'], // 风煞
  yusha: ['午', '卯', '子', '酉', '午', '卯', '子', '酉', '午', '卯', '子', '酉'], // 雨煞
  
  // Xun Deities (旬煞) - indexed by xun (0-5: 甲子 甲戌 甲申 甲午 甲辰 甲寅)
  xunqi: ['亥', '亥', '子', '子', '丑', '丑'], // 旬奇
  xunyi: ['子', '戌', '申', '午', '辰', '寅'], // 旬仪
  dingma: ['丁卯', '丁丑', '丁亥', '丁酉', '丁未', '丁巳'], // 丁马
  bikou: ['酉', '未', '巳', '卯', '丑', '亥'], // 闭口
  
  // Day Stem Deities (日煞) - indexed by day stem (0-9)
  lushen: ['寅', '卯', '巳', '午', '巳', '午', '申', '酉', '亥', '子'], // 日禄
  ride: ['寅', '申', '巳', '亥', '巳', '寅', '申', '巳', '亥', '巳'], // 日德
  wuhe: ['己', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊'], // 五合
  zhangsheng: ['亥', '亥', '寅', '寅', '申', '申', '巳', '巳', '申', '申'], // 长生
  wenxing: ['亥', '亥', '寅', '寅', '午', '午', '巳', '巳', '申', '申'], // 文星
  fuxing: ['子', '丑', '子', '子', '未', '未', '丑', '丑', '巳', '巳'], // 福星
  riyi: ['卯', '亥', '丑', '未', '巳', '卯', '亥', '丑', '未', '巳'], // 日医
  yangren: ['卯', '辰', '午', '未', '午', '未', '酉', '戌', '子', '丑'], // 羊刃
  zhifu: ['巳', '辰', '卯', '寅', '丑', '午', '未', '申', '酉', '戌'], // 值符
  youdu: ['丑', '子', '寅', '巳', '申', '丑', '子', '寅', '巳', '申'], // 游都
  ludu: ['卯', '亥', '丑', '未', '巳', '卯', '亥', '丑', '未', '巳'], // 鲁都
  
  // Day Branch Deities (支煞) - indexed by day branch (0-11)
  zhiyi: ['午', '巳', '辰', '卯', '寅', '丑', '未', '申', '酉', '戌', '亥', '子'], // 支仪
  zhide: ['巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑', '寅', '卯', '辰'], // 支德
  yima: ['寅', '亥', '申', '巳', '寅', '亥', '申', '巳', '寅', '亥', '申', '巳'], // 驿马
  taohua: ['酉', '午', '卯', '子', '酉', '午', '卯', '子', '酉', '午', '卯', '子'], // 桃花
  zhixing: ['卯', '戌', '巳', '子', '辰', '申', '午', '丑', '寅', '酉', '未', '亥'], // 支刑
  liupo: ['酉', '辰', '亥', '午', '丑', '申', '卯', '戌', '巳', '子', '未', '寅'], // 六破
  liuchong: ['午', '未', '申', '酉', '戌', '亥', '子', '丑', '寅', '卯', '辰', '巳'], // 六冲
  liuhai: ['未', '子', '巳', '辰', '卯', '寅', '丑', '子', '亥', '戌', '酉', '申'], // 六害
  posui: ['巳', '丑', '酉', '巳', '丑', '酉', '巳', '丑', '酉', '巳', '丑', '酉'], // 破碎
  yushi: ['申', '酉', '戌', '亥', '子', '丑', '寅', '卯', '辰', '巳', '午', '未'], // 雨师
  qinglang: ['午', '未', '申', '酉', '戌', '亥', '子', '丑', '寅', '卯', '辰', '巳'], // 晴朗
  jiangxing: ['子', '酉', '午', '卯', '子', '酉', '午', '卯', '子', '酉', '午', '卯'], // 将星
  zhihuagai: ['辰', '丑', '戌', '未', '辰', '丑', '戌', '未', '辰', '丑', '戌', '未'], // 支华盖
};

// Shen Sha Descriptions
const SHEN_SHA_DESC = {
  '太岁': '天子，元首，总统，佛祖，教主，头头，父母、长辈、祖上。太岁应一岁吉凶',
  '岁德': '入占则福集殃消',
  '岁德合': '入占则福集殃消',
  '岁合': '合吉星为福，合凶星为祸',
  '岁破': '太岁所冲之辰，又为大耗，并财神主破耗财物，岁破作鬼主讼',
  '岁墓': '暗昧抑塞，防讼狱',
  '岁刑': '主官非刑非。病讼最忌',
  '劫煞': '凡占皆凶',
  '灾煞': '凡占皆凶',
  '岁煞': '凡占皆凶',
  '官符': '太岁三合前支，主官司词讼之事',
  '将军': '主征伐，行人',
  '大耗': '太岁所冲之辰，主破耗',
  '小耗': '病符所冲之支，主破耗',
  '病符': '旧太岁，主病',
  '丧门': '丧吊俱到且克干克支，方以丧服论',
  '吊客': '丧吊俱到且克干克支，方以丧服论',
  '孤辰': '男忌，妨害六亲，不利婚姻',
  '寡宿': '女忌，妨害六亲，不利婚姻',
  '天赦': '主恩赦人情，官讼喜见',
  '天马': '官升迁，行人至。凡占主速',
  '天德': '主吉庆，可逢凶化吉',
  '月德': '可逢凶化吉',
  '月破': '破坏，无成',
  '日禄': '象吉，将吉为食禄，象凶，将凶为比劫',
  '日德': '福佑之神，凡占大吉',
  '羊刃': '静吉动凶，又主血光',
  '驿马': '主动，又主速',
  '桃花': '主淫乱',
  '支刑': '主刑伤',
  '六合': '吉',
  '六冲': '凡占不吉',
  '空亡': '不实，落空',
};


export const getDaLiuRenPaiPan = (date, birthYear, gender = '男') => {

  const lunar = Lunar.fromDate(date);
  const solar = Solar.fromDate(date);
  
  // 1. Four Pillars
  const yearGanZhi = lunar.getYearInGanZhiExact();
  const monthGanZhi = lunar.getMonthInGanZhiExact();
  const dayGanZhi = lunar.getDayInGanZhiExact();
  const hourGanZhi = lunar.getTimeInGanZhi();
  
  const dayGan = dayGanZhi.substring(0, 1);
  const dayZhi = dayGanZhi.substring(1, 2);
  const hourZhi = hourGanZhi.substring(1, 2);

  // 2. Determine Yue Jiang
  const prevJieQi = lunar.getPrevJieQi(false);
  const prevJieQiName = prevJieQi.getName();
  const yueJiang = getYueJiangFromTerm(prevJieQiName);

  // 3. Tian Pan (Heaven Plate)
  const yueJiangIdx = getZhiIdx(yueJiang);
  const hourIdx = getZhiIdx(hourZhi);
  const shift = (yueJiangIdx - hourIdx + 12) % 12;
  
  const tianPan = [];
  for (let i = 0; i < 12; i++) {
    tianPan[i] = ZHI[(i + shift) % 12];
  }

  // 4. Si Ke (Four Classes)
  const ganJiGong = JI_GONG[dayGan];
  const ganJiGongIdx = getZhiIdx(ganJiGong);
  const firstKeGan = dayGan;
  const firstKeZhi = tianPan[ganJiGongIdx];
  
  const firstKeZhiIdx = getZhiIdx(firstKeZhi);
  const secondKeGan = firstKeZhi;
  const secondKeZhi = tianPan[firstKeZhiIdx];
  
  const dayZhiIdx = getZhiIdx(dayZhi);
  const thirdKeGan = dayZhi;
  const thirdKeZhi = tianPan[dayZhiIdx];
  
  const thirdKeZhiIdx = getZhiIdx(thirdKeZhi);
  const fourthKeGan = thirdKeZhi;
  const fourthKeZhi = tianPan[thirdKeZhiIdx];
  
  const siKe = {
    first: { gan: firstKeGan, zhi: firstKeZhi },
    second: { gan: secondKeGan, zhi: secondKeZhi },
    third: { gan: thirdKeGan, zhi: thirdKeZhi },
    fourth: { gan: fourthKeGan, zhi: fourthKeZhi }
  };

  // 5. San Chuan (Three Transmissions)
  const sanChuan = getSanChuan(siKe, dayGan, dayZhi, tianPan);

  // 6. Tian Jiang (12 Generals)
  // Determine Day/Night Gui Ren
  // Day: Mao (3) to Shen (8)
  const isDay = (hourIdx >= 3 && hourIdx <= 8);
  const guiRenStart = getGuiRenStart(dayGan, isDay);
  
  const guiRenHeaven = guiRenStart;
  let guiRenEarthIdx = -1;
  for (let i = 0; i < 12; i++) {
    if (tianPan[i] === guiRenHeaven) {
      guiRenEarthIdx = i;
      break;
    }
  }
  
  const isClockwise = (guiRenEarthIdx >= 11 || guiRenEarthIdx <= 4); // Hai(11) to Chen(4) -> Clockwise
  
  const tianJiang = {};
  const guiRenHeavenIdx = getZhiIdx(guiRenHeaven);
  
  for (let i = 0; i < 12; i++) {
    let offset = i;
    if (!isClockwise) {
      offset = -i;
    }
    const currentHeavenIdx = (guiRenHeavenIdx + offset + 12) % 12;
    const currentHeaven = ZHI[currentHeavenIdx];
    tianJiang[currentHeaven] = JIANG[i];
  }

  // 7. Comprehensive Shen Sha
  const yearGan = yearGanZhi.substring(0, 1);
  const yearZhi = yearGanZhi.substring(1, 2);
  const monthGan = monthGanZhi.substring(0, 1);
  const monthZhi = monthGanZhi.substring(1, 2);
  
  const shenShaData = getAllShenSha({
    yearGan, yearZhi,
    monthGan, monthZhi,
    dayGan, dayZhi,
    dayGanZhi
  });
  
  // Calculate Xing Nian
  const currentYear = lunar.getYear();
  const xingNian = getXingNian(birthYear, gender, currentYear);
  
  // 8. Zhi Zhi lookup
  const zhiZhi = getZhiZhi(dayGanZhi, firstKeZhi);
  
  // 9. Shen Sha Distribution (By Palace)
  const shenShaDistribution = getShenShaDistribution(shenShaData);
  
  // 10. Comprehensive Shen Sha Text Analysis
  const shenShaText = getShenShaText(shenShaData, dayGanZhi, monthGanZhi);
  
  // Calculate Birth Year Gan Zhi
  // Use mid-year to avoid boundary issues if only year is provided
  const birthLunar = Lunar.fromYmd(birthYear, 6, 1);
  const birthYearGanZhi = birthLunar.getYearInGanZhi();

  return {
    dateStr: date.toLocaleString(),
    ganZhi: {
      year: yearGanZhi,
      month: monthGanZhi,
      day: dayGanZhi,
      hour: hourGanZhi
    },
    yueJiang: yueJiang,
    kongWang: getKongWang(dayGanZhi),
    tianPan: tianPan,
    siKe: siKe,
    sanChuan: sanChuan,
    tianJiang: tianJiang,
    shenSha: shenShaData,
    shenShaText: shenShaText,
    shenShaDistribution: shenShaDistribution,
    zhiZhi: zhiZhi,
    birthYear: birthYear,
    birthYearGanZhi: birthYearGanZhi,
    gender: gender,
    xingNian: xingNian
  };
};

// Helper Functions

function getXingNian(birthYear, gender, currentYear) {
  // Nominal Age (Xu Sui) = Current Year - Birth Year + 1
  const age = currentYear - birthYear + 1;
  if (age < 1) return '';
  
  // Male: Start from Bing Yin (丙寅). Clockwise.
  // Female: Start from Ren Shen (壬申). Counter-Clockwise.
  
  const GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  
  let ganIdx, zhiIdx;
  
  if (gender === '男') {
    // Start at Bing (2) Yin (2). 1 year old.
    // Clockwise: + (age - 1)
    ganIdx = (2 + (age - 1)) % 10;
    zhiIdx = (2 + (age - 1)) % 12;
  } else {
    // Start at Ren (8) Shen (8). 1 year old.
    // Counter-clockwise: - (age - 1)
    let gVal = (8 - (age - 1)) % 10;
    if (gVal < 0) gVal += 10;
    ganIdx = gVal;
    
    let zVal = (8 - (age - 1)) % 12;
    if (zVal < 0) zVal += 12;
    zhiIdx = zVal;
  }
  
  return GAN[ganIdx] + ZHI[zhiIdx];
}

function getAllShenSha({yearGan, yearZhi, monthGan, monthZhi, dayGan, dayZhi, dayGanZhi}) {
  const yearGanIdx = getGanIdx(yearGan);
  const yearZhiIdx = getZhiIdx(yearZhi);
  const monthZhiIdx = getZhiIdx(monthZhi);
  const dayGanIdx = getGanIdx(dayGan);
  const dayZhiIdx = getZhiIdx(dayZhi);
  
  // Calculate Xun index (0-5) for day pillar
  const getXunIndex = (ganZhi) => {
    const idx = getGanZhiIndex(ganZhi);
    return Math.floor(idx / 10) % 6;
  };
  const xunIdx = getXunIndex(dayGan + dayZhi);
  
  const result = {
    // Year Deities
    nianSha: {
      '太岁': { zhi: yearZhi, desc: SHEN_SHA_DESC['太岁'] },
      '岁德': { zhi: SHEN_SHA.suide[yearGanIdx], desc: SHEN_SHA_DESC['岁德'] },
      '岁德合': { zhi: SHEN_SHA.suidehe[yearGanIdx], desc: SHEN_SHA_DESC['岁德合'] },
      '岁合': { zhi: SHEN_SHA.liuhe[yearZhiIdx], desc: SHEN_SHA_DESC['岁合'] },
      '岁破': { zhi: SHEN_SHA.dizhipo[yearZhiIdx], desc: SHEN_SHA_DESC['岁破'] },
      '岁墓': { zhi: SHEN_SHA.suimu[yearZhiIdx], desc: SHEN_SHA_DESC['岁墓'] },
      '岁刑': { zhi: SHEN_SHA.suixing[yearZhiIdx], desc: SHEN_SHA_DESC['岁刑'] },
      '岁煞': { zhi: SHEN_SHA.suisha[yearZhiIdx], desc: SHEN_SHA_DESC['岁煞'] },
      '灾煞': { zhi: SHEN_SHA.zaisha[yearZhiIdx], desc: SHEN_SHA_DESC['灾煞'] },
      '大耗': { zhi: SHEN_SHA.dahao[yearZhiIdx], desc: SHEN_SHA_DESC['大耗'] },
      '小耗': { zhi: SHEN_SHA.xiaohao[yearZhiIdx], desc: SHEN_SHA_DESC['小耗'] },
      '将军': { zhi: SHEN_SHA.nianjiangjun[monthZhiIdx], desc: SHEN_SHA_DESC['将军'] },
      '病符': { zhi: ZHI[(yearZhiIdx - 1 + 12) % 12], desc: SHEN_SHA_DESC['病符'] },
      '丧门': { zhi: ZHI[(yearZhiIdx - 2 + 12) % 12], desc: SHEN_SHA_DESC['丧门'] },
      '吊客': { zhi: ZHI[(yearZhiIdx + 2) % 12], desc: SHEN_SHA_DESC['吊客'] },
    },
    // Season & Month Deities
    yueSha: {
      // Season Deities
      '天转': { zhi: SHEN_SHA.tianzhuan[monthZhiIdx], desc: '' },
      '地转': { zhi: SHEN_SHA.dizhuan[monthZhiIdx], desc: '' },
      '孤辰': { zhi: SHEN_SHA.guchen[monthZhiIdx], desc: SHEN_SHA_DESC['孤辰'] },
      '寡宿': { zhi: SHEN_SHA.guasu[monthZhiIdx], desc: SHEN_SHA_DESC['寡宿'] },
      '皇书': { zhi: SHEN_SHA.huangshu[monthZhiIdx], desc: '' },
      '丧车煞': { zhi: SHEN_SHA.sangche[monthZhiIdx], desc: '' },
      '浴盆': { zhi: SHEN_SHA.yupen[monthZhiIdx], desc: '' },
      '天赦': { zhi: SHEN_SHA.tianshe[monthZhiIdx], desc: SHEN_SHA_DESC['天赦'] },
      '火鬼': { zhi: SHEN_SHA.huogui[monthZhiIdx], desc: '' },
      '飞祸': { zhi: SHEN_SHA.feihuo[monthZhiIdx], desc: '' },
      '天车': { zhi: SHEN_SHA.tianche[monthZhiIdx], desc: '' },
      '天盗': { zhi: SHEN_SHA.tiandao[monthZhiIdx], desc: '' },
      '天禧': { zhi: SHEN_SHA.tianxi[monthZhiIdx], desc: '' },
      '钥神': { zhi: SHEN_SHA.yueshen[monthZhiIdx], desc: '' },
      '三丘': { zhi: SHEN_SHA.sanqiu[monthZhiIdx], desc: '' },
      '四废': { zhi: SHEN_SHA.sifei[monthZhiIdx], desc: '' },
      '五墓': { zhi: SHEN_SHA.wumu[monthZhiIdx], desc: '' },
      '戏神': { zhi: SHEN_SHA.xishen[monthZhiIdx], desc: '' },
      '游神': { zhi: SHEN_SHA.youshen[monthZhiIdx], desc: '' },
      '奸神': { zhi: SHEN_SHA.jianshen[monthZhiIdx], desc: '' },
      // Month Deities
      '劫煞': { zhi: SHEN_SHA.jiesha[monthZhiIdx], desc: SHEN_SHA_DESC['劫煞'] },
      '天马': { zhi: SHEN_SHA.tianma[monthZhiIdx], desc: SHEN_SHA_DESC['天马'] },
      '月德': { zhi: SHEN_SHA.yuede[monthZhiIdx], desc: SHEN_SHA_DESC['月德'] },
      '天德': { zhi: SHEN_SHA.tiande[monthZhiIdx], desc: SHEN_SHA_DESC['天德'] },
      '生气': { zhi: SHEN_SHA.shengqi[monthZhiIdx], desc: '' },
      '死气': { zhi: SHEN_SHA.siqi[monthZhiIdx], desc: '' },
      '死神': { zhi: SHEN_SHA.sishen[monthZhiIdx], desc: '' },
      '月破': { zhi: SHEN_SHA.yuepo[monthZhiIdx], desc: SHEN_SHA_DESC['月破'] },
      '天医': { zhi: SHEN_SHA.tianyi[monthZhiIdx], desc: '' },
      '地医': { zhi: SHEN_SHA.diyi[monthZhiIdx], desc: '' },
      '成神': { zhi: SHEN_SHA.chengshen[monthZhiIdx], desc: '' },
      '会神': { zhi: SHEN_SHA.huishen[monthZhiIdx], desc: '' },
      '天财': { zhi: SHEN_SHA.tiancai[monthZhiIdx], desc: '' },
      '信神': { zhi: SHEN_SHA.xinshen[monthZhiIdx], desc: '' },
      '天鸡': { zhi: SHEN_SHA.tianji[monthZhiIdx], desc: '' },
      '天诏': { zhi: SHEN_SHA.tianzhao[monthZhiIdx], desc: '' },
      '皇恩': { zhi: SHEN_SHA.huangen[monthZhiIdx], desc: '' },
      '圣心': { zhi: SHEN_SHA.shengxin[monthZhiIdx], desc: '' },
      '长绳': { zhi: SHEN_SHA.changsheng[monthZhiIdx], desc: '' },
      '悬索': { zhi: SHEN_SHA.xuansuo[monthZhiIdx], desc: '' },
      '奸门': { zhi: SHEN_SHA.jianmen[monthZhiIdx], desc: '' },
      '天巫': { zhi: SHEN_SHA.tianwu[monthZhiIdx], desc: '' },
      '天解神': { zhi: SHEN_SHA.tianjieshen[monthZhiIdx], desc: '' },
      '月刑': { zhi: SHEN_SHA.yuexing[monthZhiIdx], desc: '' },
      '迷惑': { zhi: SHEN_SHA.mihuo[monthZhiIdx], desc: '' },
      '枯骨': { zhi: SHEN_SHA.kugu[monthZhiIdx], desc: '' },
      '血支': { zhi: SHEN_SHA.xuezhi[monthZhiIdx], desc: '' },
      '血忌': { zhi: SHEN_SHA.xueji[monthZhiIdx], desc: '' },
      '雌虎煞': { zhi: SHEN_SHA.cihusha[monthZhiIdx], desc: '' },
      '产煞': { zhi: SHEN_SHA.chansha[monthZhiIdx], desc: '' },
      '咸池': { zhi: SHEN_SHA.xianchi[monthZhiIdx], desc: '' },
      '月厌': { zhi: SHEN_SHA.yueyan[monthZhiIdx], desc: '' },
      '飞廉': { zhi: SHEN_SHA.feilian[monthZhiIdx], desc: '' },
      '天鬼': { zhi: SHEN_SHA.tiangui[monthZhiIdx], desc: '' },
      '雷公': { zhi: SHEN_SHA.leigong[monthZhiIdx], desc: '' },
      '雷煞': { zhi: SHEN_SHA.leisha[monthZhiIdx], desc: '' },
      '风伯': { zhi: SHEN_SHA.fengbo[monthZhiIdx], desc: '' },
      '风煞': { zhi: SHEN_SHA.fengsha[monthZhiIdx], desc: '' },
      '雨煞': { zhi: SHEN_SHA.yusha[monthZhiIdx], desc: '' },
    },
    // Xun Deities
    xunSha: {
      '空亡': { zhi: getKongWang(dayGanZhi), desc: SHEN_SHA_DESC['空亡'] },
      '旬奇': { zhi: SHEN_SHA.xunqi[xunIdx], desc: '' },
      '旬仪': { zhi: SHEN_SHA.xunyi[xunIdx], desc: '' },
      '丁马': { zhi: SHEN_SHA.dingma[xunIdx], desc: '' },
      '闭口': { zhi: SHEN_SHA.bikou[xunIdx], desc: '' },
    },
    // Day Stem Deities
    riSha: {
      '日禄': { zhi: SHEN_SHA.lushen[dayGanIdx], desc: SHEN_SHA_DESC['日禄'] },
      '日德': { zhi: SHEN_SHA.ride[dayGanIdx], desc: SHEN_SHA_DESC['日德'] },
      '五合': { zhi: SHEN_SHA.wuhe[dayGanIdx], desc: '' },
      '长生': { zhi: SHEN_SHA.zhangsheng[dayGanIdx], desc: '' },
      '文星': { zhi: SHEN_SHA.wenxing[dayGanIdx], desc: '' },
      '福星': { zhi: SHEN_SHA.fuxing[dayGanIdx], desc: '' },
      '日医': { zhi: SHEN_SHA.riyi[dayGanIdx], desc: '' },
      '羊刃': { zhi: SHEN_SHA.yangren[dayGanIdx], desc: SHEN_SHA_DESC['羊刃'] },
      '值符': { zhi: SHEN_SHA.zhifu[dayGanIdx], desc: '' },
      '游都': { zhi: SHEN_SHA.youdu[dayGanIdx], desc: '' },
      '鲁都': { zhi: SHEN_SHA.ludu[dayGanIdx], desc: '' },
    },
    // Day Branch Deities
    zhiSha: {
      '支仪': { zhi: SHEN_SHA.zhiyi[dayZhiIdx], desc: '' },
      '支德': { zhi: SHEN_SHA.zhide[dayZhiIdx], desc: '' },
      '驿马': { zhi: SHEN_SHA.yima[dayZhiIdx], desc: SHEN_SHA_DESC['驿马'] },
      '桃花': { zhi: SHEN_SHA.taohua[dayZhiIdx], desc: SHEN_SHA_DESC['桃花'] },
      '支刑': { zhi: SHEN_SHA.zhixing[dayZhiIdx], desc: SHEN_SHA_DESC['支刑'] },
      '六破': { zhi: SHEN_SHA.liupo[dayZhiIdx], desc: '' },
      '六合': { zhi: SHEN_SHA.liuhe[dayZhiIdx], desc: SHEN_SHA_DESC['六合'] },
      '六冲': { zhi: SHEN_SHA.liuchong[dayZhiIdx], desc: SHEN_SHA_DESC['六冲'] },
      '六害': { zhi: SHEN_SHA.liuhai[dayZhiIdx], desc: '' },
      '破碎': { zhi: SHEN_SHA.posui[dayZhiIdx], desc: '' },
      '雨师': { zhi: SHEN_SHA.yushi[dayZhiIdx], desc: '' },
      '晴朗': { zhi: SHEN_SHA.qinglang[dayZhiIdx], desc: '' },
      '将星': { zhi: SHEN_SHA.jiangxing[dayZhiIdx], desc: '' },
      '支华盖': { zhi: SHEN_SHA.zhihuagai[dayZhiIdx], desc: '' },
    }
  };
  
  return result;
}

function getZhiZhi(dayGanZhi, dayTopZhi) {
  // Calculate base file index for this day pillar
  const dayPillarIndex = getGanZhiIndex(dayGanZhi);
  
  if (dayPillarIndex === -1) {
    return '无法找到对应的直指内容';
  }
  
  // For this day pillar, there are 12 possible files (one for each "干上" branch)
  // We need to find the file where "干上" matches dayTopZhi
  const baseIndex = dayPillarIndex * 12 + 1;
  
  for (let i = 0; i < 12; i++) {
    const fileIndex = baseIndex + i;
    
    if (fileIndex >= ZHI_ZHI_DATA.length) {
      break;
    }
    
    const content = ZHI_ZHI_DATA[fileIndex];
    if (!content) continue;
    
    // Search for "干上" in the content
    const ganShangMatch = content.match(/干上(.)/);
    if (ganShangMatch && ganShangMatch[1] === dayTopZhi) {
      return content;
    }
  }
  
  return '未找到匹配的直指内容';
}

// Helper to get Gan-Zhi index in 60 jia zi cycle
function getGanZhiIndex(ganZhi) {
  const gan = ganZhi.substring(0, 1);
  const zhi = ganZhi.substring(1, 2);
  const ganIdx = getGanIdx(gan);
  const zhiIdx = getZhiIdx(zhi);
  
  if (ganIdx === -1 || zhiIdx === -1) return -1;
  
  // Formula: (zhi - gan) mod 12 gives the xun offset, then we can calculate the 60-cycle index
  // Simpler: iterate through 60 combinations
  for (let i = 0; i < 60; i++) {
    if (GAN[i % 10] === gan && ZHI[i % 12] === zhi) {
      return i;
    }
  }
  
  return -1;
}

function getYueJiangFromTerm(term) {
  // Simplified map logic
  // Need to handle the sequence correctly
  const map = {
    '雨水': '亥', '惊蛰': '亥',
    '春分': '戌', '清明': '戌',
    '谷雨': '酉', '立夏': '酉',
    '小满': '申', '芒种': '申',
    '夏至': '未', '小暑': '未',
    '大暑': '午', '立秋': '午',
    '处暑': '巳', '白露': '巳',
    '秋分': '辰', '寒露': '辰',
    '霜降': '卯', '立冬': '卯',
    '小雪': '寅', '大雪': '寅',
    '冬至': '丑', '小寒': '丑',
    '大寒': '子', '立春': '子'
  };
  return map[term] || '子'; // Default fallback
}

function getSanChuan(siKe, dayGan, dayZhi, tianPan) {
  // 1. Zei Ke (Overcoming)
  // Check each of the 4 Kes: Lower (Earth) overcomes Upper (Heaven) -> Zei (Bandit)
  // Upper (Heaven) overcomes Lower (Earth) -> Ke (Overcoming)
  // We need 5 Elements relationship
  const wuxing = {
    '甲': 'wood', '乙': 'wood', '寅': 'wood', '卯': 'wood',
    '丙': 'fire', '丁': 'fire', '巳': 'fire', '午': 'fire',
    '戊': 'earth', '己': 'earth', '辰': 'earth', '戌': 'earth', '丑': 'earth', '未': 'earth',
    '庚': 'metal', '辛': 'metal', '申': 'metal', '酉': 'metal',
    '壬': 'water', '癸': 'water', '亥': 'water', '子': 'water'
  };
  
  const overcomes = (a, b) => { // Does a overcome b?
    const wa = wuxing[a];
    const wb = wuxing[b];
    if (wa === 'wood' && wb === 'earth') return true;
    if (wa === 'earth' && wb === 'water') return true;
    if (wa === 'water' && wb === 'fire') return true;
    if (wa === 'fire' && wb === 'metal') return true;
    if (wa === 'metal' && wb === 'wood') return true;
    return false;
  };

  const kes = [siKe.first, siKe.second, siKe.third, siKe.fourth];
  const zeis = []; // Lower overcomes Upper (Earth overcomes Heaven) - actually usually called "Zei" (Bandit)
  const kes_matches = []; // Upper overcomes Lower (Heaven overcomes Earth) - "Ke"
  
  // Note: In Liu Ren, 
  // Lower = Earth Plate (The 'Gan' or 'Zhi' position in the Ke structure)
  // Upper = Heaven Plate (The 'Zhi' in the Ke structure)
  // Wait, my SiKe structure: { gan: '甲', zhi: '寅' } -> 'gan' is the bottom (Earth/Station), 'zhi' is the top (Heaven).
  // For 1st Ke: Gan (Earth) -> Heaven Branch.
  // For 2nd Ke: 1st Heaven (as Earth) -> Its Heaven.
  
  kes.forEach((k, i) => {
    // k.gan is Bottom, k.zhi is Top
    if (overcomes(k.gan, k.zhi)) {
      // Bottom overcomes Top -> Zei (Bandit) - inverse?
      // Wait, standard terminology:
      // Top overcomes Bottom = Ke (Ke)
      // Bottom overcomes Top = Zei (Bandit)
      zeis.push({ ...k, index: i });
    }
    if (overcomes(k.zhi, k.gan)) {
      // Top overcomes Bottom = Ke
      kes_matches.push({ ...k, index: i });
    }
  });
  
  let chuChuan = '';
  
  // Rule 1: Zei Ke
  // If there are Zei (Bottom overcomes Top), take Zei.
  // If multiple Zei, compare with Day Gan (Bi Yong).
  // If no Zei, take Ke (Top overcomes Bottom).
  // If multiple Ke, compare with Day Gan (Bi Yong).
  
  let candidates = [];
  if (zeis.length > 0) {
    candidates = zeis; // Prioritize Zei (called "Shi" - Start?) No, usually "Zei Ke" method prioritizes the one that is "Zei".
    // Actually, the rule is: "Xia Ke Shang Wei Zei, Shang Ke Xia Wei Ke".
    // "Zei" is more urgent. If there is Zei, use Zei.
  } else if (kes_matches.length > 0) {
    candidates = kes_matches;
  }
  
  if (candidates.length === 1) {
    chuChuan = candidates[0].zhi;
  } else if (candidates.length > 1) {
    // When multiple Zei/Ke exist, need to check for She Hai (涉害)
    // She Hai: Calculate the "depth" - how many different 五行 elements 
    // each branch traverses before returning to its home position
    
    // Helper function to calculate She Hai depth for a branch
    const calculateSheHaiDepth = (branch) => {
      const zhiIdx = getZhiIdx(branch);
      const elements = [];
      
      // Traverse forward through 12 branches, counting unique elements
      for (let i = 1; i < 12; i++) {
        const nextIdx = (zhiIdx + i) % 12;
        const nextZhi = ZHI[nextIdx];
        const element = wuxing[nextZhi];
        
        // Count each unique element encountered
        if (!elements.includes(element)) {
          elements.push(element);
        }
      }
      
      return elements.length;
    };
    
    // Calculate She Hai depth for each candidate
    const candidatesWithDepth = candidates.map(c => ({
      ...c,
      sheHaiDepth: calculateSheHaiDepth(c.zhi)
    }));
    
    // Find maximum depth
    const maxDepth = Math.max(...candidatesWithDepth.map(c => c.sheHaiDepth));
    const deepest = candidatesWithDepth.filter(c => c.sheHaiDepth === maxDepth);
    
    if (deepest.length === 1) {
      // One has deeper She Hai, use it
      chuChuan = deepest[0].zhi;
    } else {
      // Multiple with same depth - use Bi Yong (Yin/Yang matching)
      const dayYang = ['甲', '丙', '戊', '庚', '壬'].includes(dayGan);
      const matches = deepest.filter(c => {
        const zhiYang = ['子', '寅', '辰', '午', '申', '戌'].includes(c.zhi);
        return dayYang === zhiYang;
      });
      
      if (matches.length > 0) {
        chuChuan = matches[0].zhi;
      } else {
        // No Yin/Yang match, use Meng-Zhong-Ji priority
        // Meng (孟): 寅申巳亥 (positions 2,8,5,11)
        // Zhong (仲): 子午卯酉 (positions 0,6,3,9)  
        // Ji (季): 辰戌丑未 (positions 4,10,1,7)
        const getMengZhongJi = (zhi) => {
          const idx = getZhiIdx(zhi);
          if ([2, 8, 5, 11].includes(idx)) return 0; // Meng
          if ([0, 6, 3, 9].includes(idx)) return 1; // Zhong
          return 2; // Ji
        };
        
        // Sort by Meng < Zhong < Ji priority
        deepest.sort((a, b) => getMengZhongJi(a.zhi) - getMengZhongJi(b.zhi));
        chuChuan = deepest[0].zhi;
      }
    }
  } else {
    // No Zei and No Ke -> Yao Ke (Remote Overcoming)
    // Compare Day Gan with the Heaven Branches of the 4 Kes (siKe.first.zhi, etc.)
    // But wait, Yao Ke is specifically Day Gan vs the 3rd/4th/2nd?
    // Rule: Look for Day Gan overcoming Heaven Branches (Yao Ke).
    // If none, look for Heaven Branches overcoming Day Gan (Gao Ke).
    
    const heavenBranches = [siKe.first.zhi, siKe.second.zhi, siKe.third.zhi, siKe.fourth.zhi];
    const yaoKes = []; // Day Gan overcomes Heaven
    const gaoKes = []; // Heaven overcomes Day Gan
    
    heavenBranches.forEach((zhi, i) => {
      // Day Gan overcomes Heaven Branch?
      // Need to convert Branch to Element
      if (overcomes(dayGan, zhi)) {
        yaoKes.push({ zhi, index: i });
      }
      if (overcomes(zhi, dayGan)) {
        gaoKes.push({ zhi, index: i });
      }
    });
    
    if (yaoKes.length > 0) {
      // Take the first Yao Ke?
      // If multiple, compare Bi Yong?
      // Simplified: Take first.
      chuChuan = yaoKes[0].zhi;
    } else if (gaoKes.length > 0) {
      chuChuan = gaoKes[0].zhi;
    } else {
      // Mao Xing (Subterranean) - No Yao Ke either.
      // Yang Day: Gan on Shen (Day Gui Ren?) No.
      // Yin Day: Zhi on ...
      // Simplified fallback: Just take the 1st Ke's Top for now.
      chuChuan = siKe.first.zhi;
    }
  }
  
  // Zhong Chuan: Heaven Branch on Chu Chuan's position (Earth)
  // Find Chu Chuan on Earth Plate
  // tianPan array: index is Earth Branch (0=Zi, 1=Chou...), value is Heaven Branch
  const chuChuanIdx = getZhiIdx(chuChuan);
  const zhongChuan = tianPan[chuChuanIdx];
  
  // Mo Chuan: Heaven Branch on Zhong Chuan's position (Earth)
  const zhongChuanIdx = getZhiIdx(zhongChuan);
  const moChuan = tianPan[zhongChuanIdx];
  
  // Add Dun Gan (Hidden Stem) to San Chuan
  // Based on Day Xun
  const dayGanZhi = dayGan + dayZhi;
  const chuGan = getDunGan(dayGan, chuChuan, dayGanZhi);
  const zhongGan = getDunGan(dayGan, zhongChuan, dayGanZhi);
  const moGan = getDunGan(dayGan, moChuan, dayGanZhi);
  
  return [
    { gan: chuGan, zhi: chuChuan },
    { gan: zhongGan, zhi: zhongChuan },
    { gan: moGan, zhi: moChuan }
  ]; 
}

function getDunGan(dayGan, branch, dayGanZhi) {
  // San Chuan stems are based on the Day Xun (旬)
  // Each Xun starts with Jia and covers 10 Gan-Zhi pairs
  // For example, Jia Zi Xun: Jia-Zi, Yi-Chou, Bing-Yin, ..., Gui-You (10 pairs)
  // The remaining 2 branches (Xu, Hai) are Kong Wang (empty/void)
  
  // Find which Xun the day belongs to
  const gan = dayGanZhi.substring(0, 1);
  const zhi = dayGanZhi.substring(1, 2);
  const gIdx = GAN.indexOf(gan);
  const zIdx = ZHI.indexOf(zhi);
  
  // The Xun starts at the branch that aligns with the day's Gan-Zhi
  // Xun Shou index = (zIdx - gIdx + 12) % 12
  const xunStartIdx = (zIdx - gIdx + 12) % 12;
  
  // Check if the target branch is within this Xun
  const targetIdx = ZHI.indexOf(branch);
  
  // Calculate the offset from Xun start
  let offset = (targetIdx - xunStartIdx + 12) % 12;
  
  // If offset >= 10, it's Kong Wang (beyond the 10 Gan-Zhi pairs in the Xun)
  if (offset >= 10) {
    return ''; // Kong Wang - no stem
  }
  
  // The stem is determined by offset from "Jia" (0)
  // Jia (0), Yi (1), Bing (2), ..., Gui (9)
  const stemIdx = offset % 10;
  return GAN[stemIdx];
}

function getGuiRenStart(dayGan, isDay) {
  // Day/Night Gui Ren Table
  // Jia/Wu/Geng: Chou (Day), Wei (Night) -> Wait, different schools have different rules.
  // Standard: Jia Wu Geng Niu Yang. (Chou Wei)
  // Yi Ji Shu Hou Xiang. (Zi Shen)
  // Bing Ding Zhu Ji Wei. (Hai You)
  // Liu Xin Feng Ma Hu. (Wu Yin)
  // Ren Gui Tu She Cang. (Si Mao)
  
  // Day: First one. Night: Second one.
  // Note: Some schools swap Day/Night for some stems.
  // Let's use a standard map.
  
  const map = {
    '甲': ['丑', '未'], '戊': ['丑', '未'], '庚': ['丑', '未'],
    '乙': ['子', '申'], '己': ['子', '申'],
    '丙': ['亥', '酉'], '丁': ['亥', '酉'],
    '壬': ['巳', '卯'], '癸': ['巳', '卯'],
    '辛': ['午', '寅']
  };
  
  const pair = map[dayGan] || ['丑', '未'];
  return isDay ? pair[0] : pair[1];
}

function getKongWang(ganZhi) {
  // Calculate Kong Wang from Day GanZhi
  // Xun Shou
  // Jia Zi (0) -> Xu Hai
  // Jia Xu (10) -> Shen You
  // ...
  // Simplified:
  const gan = ganZhi.substring(0, 1);
  const zhi = ganZhi.substring(1, 2);
  const gIdx = GAN.indexOf(gan);
  const zIdx = ZHI.indexOf(zhi);
  const diff = (zIdx - gIdx + 12) % 12; // Index of 1st branch in Xun (Jia-X)
  // Xun Shou is at zIdx - gIdx.
  // Kong Wang is the two branches before the Xun Shou?
  // No.
  // Jia Zi (0,0) -> diff=0. Xun starts at Zi. Kong Wang is Xu(10), Hai(11).
  // Jia Xu (0,10) -> diff=10. Xun starts at Xu. Kong Wang is Shen(8), You(9).
  // Formula: (diff - 2 + 12) % 12 and (diff - 1 + 12) % 12
  
  const k1 = ZHI[(diff - 2 + 12) % 12];
  const k2 = ZHI[(diff - 1 + 12) % 12];
  return `${k1}${k2}`;
}

function getMaXing(zhi) {
  // Shen-Zi-Chen -> Yin
  // Yin-Wu-Xu -> Shen
  // Si-You-Chou -> Hai
  // Hai-Mao-Wei -> Si
  if (['申', '子', '辰'].includes(zhi)) return '寅';
  if (['寅', '午', '戌'].includes(zhi)) return '申';
  if (['巳', '酉', '丑'].includes(zhi)) return '亥';
  if (['亥', '卯', '未'].includes(zhi)) return '巳';
  return '';
}

function getTaoHua(zhi) {
  // Shen-Zi-Chen -> You
  // Yin-Wu-Xu -> Mao
  // Si-You-Chou -> Wu
  // Hai-Mao-Wei -> Zi
  if (['申', '子', '辰'].includes(zhi)) return '酉';
  if (['寅', '午', '戌'].includes(zhi)) return '卯';
  if (['巳', '酉', '丑'].includes(zhi)) return '午';
  if (['亥', '卯', '未'].includes(zhi)) return '子';
  return '';
}

function getLu(gan) {
  const map = {
    '甲': '寅', '乙': '卯', '丙': '巳', '丁': '午', '戊': '巳',
    '己': '午', '庚': '申', '辛': '酉', '壬': '亥', '癸': '子'
  };
  return map[gan] || '';
}

function getYangRen(gan) {
  const map = {
    '甲': '卯', '乙': '辰', '丙': '午', '丁': '未', '戊': '午',
    '己': '未', '庚': '酉', '辛': '戌', '壬': '子', '癸': '丑'
  };
  return map[gan] || '';
}

function getShenShaDistribution(shenShaData) {
  const distribution = {};
  ZHI.forEach(z => distribution[z] = []);
  
  const categories = ['nianSha', 'yueSha', 'xunSha', 'riSha', 'zhiSha'];
  
  categories.forEach(cat => {
    if (shenShaData[cat]) {
      Object.entries(shenShaData[cat]).forEach(([name, data]) => {
        if (data && data.zhi) {
          // Handle potential multiple branches if any (though current logic returns single)
          const zhis = data.zhi.split(''); // Just in case, but usually it's one char
          // Actually, my logic returns single char strings like '子'.
          // But let's be safe.
          if (distribution[data.zhi]) {
            distribution[data.zhi].push(name);
          }
        }
      });
    }
  });
  
  return distribution;
}

function getXunShou(dayGanZhi) {
  // Xun Shou = the Jia-X pair that starts the 10-day cycle containing this day
  const gan = dayGanZhi.substring(0, 1);
  const zhi = dayGanZhi.substring(1, 2);
  const gIdx = GAN.indexOf(gan);
  const zIdx = ZHI.indexOf(zhi);
  
  // Xun starts where offset from Jia is 0
  // Offset = (zIdx - gIdx + 12) % 12
  const xunStartIdx = (zIdx - gIdx + 12) % 12;
  return '甲' + ZHI[xunStartIdx];
}

function getXunWei(dayGanZhi) {
  // Xun Wei = the last pair in the 10-day cycle (Gui-X)
  const xunShou = getXunShou(dayGanZhi);
  const xunStartIdx = ZHI.indexOf(xunShou.substring(1, 2));
  // The 10th item is at offset 9, which is Gui
  const xunWeiIdx = (xunStartIdx + 9) % 12;
  return '癸' + ZHI[xunWeiIdx];
}

function getShenShaText(shenShaData, dayGanZhi, monthGanZhi) {
  const monthZhi = monthGanZhi.substring(1, 2);
  
  // Helper to get Shen Sha value by name
  const getSha = (name) => {
    for (const category of ['nianSha', 'yueSha', 'xunSha', 'riSha', 'zhiSha']) {
      if (shenShaData[category] && shenShaData[category][name]) {
        return shenShaData[category][name].zhi || '';
      }
    }
    return '';
  };
  
  let text = '';
  
  // 1. Key Shen Sha
  text += `日空：${getKongWang(dayGanZhi)}\n`;
  text += `旬首：${getXunShou(dayGanZhi)}\n`;
  text += `旬尾：${getXunWei(dayGanZhi)}\n`;
  text += `太岁：${getSha('太岁')}\n`;
  text += `岁破：${getSha('岁破')}\n`;
  text += `月建：${monthZhi}\n`;
  text += `月破：${getSha('月破')}\n`;
  text += `日禄：${getSha('日禄')}\n`;
  text += `日德：${getSha('日德')}\n`;
  text += `日马：${getSha('驿马')}\n`;
  text += `旬丁：${getSha('丁马')}\n`;
  text += `天马：${getSha('天马')}\n`;
  text += `生气：${getSha('生气')}\n`;
  text += `死气：${getSha('死气')}\n`;
  text += `病符：${getSha('病符')}\n`;
  text += `劫煞：${getSha('劫煞')}\n\n`;
  
  // 2. Per-branch Shen Sha listing
  const distribution = getShenShaDistribution(shenShaData);
  
  ZHI.forEach(zhi => {
    const shas = distribution[zhi];
    const shaList = shas.length > 0 ? shas.join('、') : '';
    text += `${zhi}：${shaList}\n\n`;
  });
  
  return text;
}

