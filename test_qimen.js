import assert from 'node:assert/strict';
import { calculateJu, getPaiPan } from './src/utils/qimen.js';

function expectJu(actual, expected, message) {
  assert.equal(actual.jieQi, expected.jieQi, `${message} 节气不符`);
  assert.equal(actual.effectiveJieQi, expected.effectiveJieQi, `${message} 生效节气不符`);
  assert.equal(actual.yuan, expected.yuan, `${message} 三元不符`);
  assert.equal(actual.juNum, expected.juNum, `${message} 局数不符`);
  assert.equal(actual.type, expected.type, `${message} 阴阳遁不符`);
  assert.equal(actual.rule, expected.rule, `${message} 判局规则不符`);
}

console.log('[Qimen][Test] 开始回归测试');

const beforeLiChun = getPaiPan(new Date('2026-02-04T00:00:00+08:00'), 'chaibu');
const afterLiChun = getPaiPan(new Date('2026-02-04T06:00:00+08:00'), 'chaibu');

assert.equal(beforeLiChun.yearGanZhi, '乙巳', '立春前年柱应仍为乙巳');
assert.equal(beforeLiChun.monthGanZhi, '己丑', '立春前月柱应仍为己丑');
assert.equal(beforeLiChun.jieQi, '大寒', '立春前节气应仍为大寒');
assert.equal(afterLiChun.yearGanZhi, '丙午', '立春后年柱应切换为丙午');
assert.equal(afterLiChun.monthGanZhi, '庚寅', '立春后月柱应切换为庚寅');
assert.equal(afterLiChun.jieQi, '立春', '立春后节气应切换为立春');

expectJu(
  calculateJu(new Date('2026-01-05T00:00:00+08:00'), 'chaibu'),
  {
    jieQi: '冬至',
    effectiveJieQi: '冬至',
    yuan: '上元',
    juNum: 1,
    type: '阳遁',
    rule: '拆补正授'
  },
  '拆补法基准样本'
);

expectJu(
  calculateJu(new Date('2026-05-28T12:00:00+08:00'), 'chaibu'),
  {
    jieQi: '小满',
    effectiveJieQi: '小满',
    yuan: '中元',
    juNum: 2,
    type: '阳遁',
    rule: '拆补正授'
  },
  '拆补法超神前样本'
);

expectJu(
  calculateJu(new Date('2026-05-28T12:00:00+08:00'), 'zhirun'),
  {
    jieQi: '小满',
    effectiveJieQi: '芒种',
    yuan: '中元',
    juNum: 3,
    type: '阳遁',
    rule: '超神接气正授排局'
  },
  '置润法超神接气样本'
);

expectJu(
  calculateJu(new Date('2026-12-07T00:00:00+08:00'), 'zhirun'),
  {
    jieQi: '小雪',
    effectiveJieQi: '小雪',
    yuan: '中元',
    juNum: 8,
    type: '阴遁',
    rule: '其他排局1'
  },
  '置润法冬月样本'
);

const pan = getPaiPan(new Date('2026-03-05T12:00:00+08:00'), 'chaibu');
assert.equal(pan.zhiFuStar, '天任', '值符星应为天任');
assert.equal(pan.zhiShiGate, '生门', '值使门应为生门');
assert.equal(pan.tianPan[3], '天任', '震三宫九星应为天任');
assert.equal(pan.renPan[3], '生门', '震三宫八门应为生门');
assert.equal(pan.shenPan[3], '值符', '震三宫八神应为值符');
assert.equal(pan.tianPanStems[3], '癸', '震三宫天盘干应为癸');
assert.equal(pan.anGan[3], '戊', '震三宫暗干应为戊');

console.log('[Qimen][Test] 拆补法与置润法回归测试通过');
