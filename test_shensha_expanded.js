import assert from 'node:assert/strict';
import { getBaZiPaiPan } from './src/utils/bazi.js';

console.log('[BaZi][ShenSha][Test] 开始神煞回归测试');

const tianDeSample = getBaZiPaiPan(new Date('2020-12-15T10:00:00+08:00'), 2020, '男');
assert.equal(tianDeSample.月柱.干支, '戊子', '天德样本月柱应为戊子');
assert.equal(tianDeSample.日柱.干支, '壬辰', '天德样本日柱应为壬辰');
assert.equal(tianDeSample.时柱.干支, '乙巳', '天德样本时柱应为乙巳');
assert.ok(
  tianDeSample.时柱.神煞.includes('天德贵人'),
  '子月见巳应命中天德贵人'
);
assert.ok(
  !tianDeSample.日柱.神煞.includes('天德贵人'),
  '子月不应仅因见壬而误判天德贵人'
);

const kuiGangSample = getBaZiPaiPan(new Date('2000-02-10T00:00:00+08:00'), 2000, '男');
assert.equal(kuiGangSample.日柱.干支, '戊戌', '魁罡样本日柱应为戊戌');
assert.ok(kuiGangSample.日柱.神煞.includes('魁罡'), '戊戌日柱应命中魁罡');

const wenChangByYearGanSample = getBaZiPaiPan(new Date('2004-02-08T00:00:00+08:00'), 2004, '男');
assert.equal(wenChangByYearGanSample.年柱.干支, '甲申', '文昌样本年柱应为甲申');
assert.equal(wenChangByYearGanSample.日柱.干支, '丁巳', '文昌样本日柱应为丁巳');
assert.ok(
  wenChangByYearGanSample.日柱.神煞.includes('文昌贵人'),
  '甲年见巳时，文昌贵人应支持按年干判定'
);

const xueTangStrictSample = getBaZiPaiPan(new Date('2004-02-26T00:00:00+08:00'), 2004, '男');
assert.equal(xueTangStrictSample.年柱.干支, '甲申', '学堂样本年柱应为甲申');
assert.equal(xueTangStrictSample.日柱.干支, '乙亥', '学堂样本日柱应为乙亥');
assert.ok(
  !xueTangStrictSample.日柱.神煞.includes('学堂'),
  '乙亥不应仅因亥支而误判为甲干学堂'
);

console.log('[BaZi][ShenSha][Test] 神煞回归测试通过');
