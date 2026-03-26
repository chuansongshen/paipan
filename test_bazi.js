import assert from 'node:assert/strict';
import { getBaZiPaiPan } from './src/utils/bazi.js';

console.log('[BaZi][Test] 开始基础回归测试');

const beforeLiChun = getBaZiPaiPan(new Date('2021-02-03T22:58:00+08:00'), 2021, '男');
const afterLiChun = getBaZiPaiPan(new Date('2021-02-03T22:58:58+08:00'), 2021, '男');

assert.equal(beforeLiChun.error, undefined, '立春前样本不应排盘失败');
assert.equal(afterLiChun.error, undefined, '立春后样本不应排盘失败');
assert.equal(beforeLiChun.年柱.干支, '庚子', '立春前年柱应保持上一年');
assert.equal(beforeLiChun.生肖, '鼠', '立春前生肖应与年柱口径一致');
assert.equal(afterLiChun.年柱.干支, '辛丑', '立春后年柱应切换为辛丑');
assert.equal(afterLiChun.生肖, '牛', '立春后生肖应与年柱口径一致');

const preciseYun = getBaZiPaiPan(new Date('2024-07-15T12:00:00+08:00'), 2024, '男');
const firstDaYun = preciseYun.大运.大运[0];

assert.equal(preciseYun.error, undefined, '起运样本不应排盘失败');
assert.equal(preciseYun.大运.起运年龄, 7, '起运周岁年数应保留实际相差年数');
assert.equal(preciseYun.大运.起运月数, 7, '起运月数应保留精确结果');
assert.equal(preciseYun.大运.起运天数, 10, '起运天数应保留精确结果');
assert.equal(preciseYun.大运.起运公历, '2032-02-25', '起运公历日期应与底层历法库一致');
assert.equal(preciseYun.大运.起运描述, '7年7个月10天', '起运描述应包含完整年月日');
assert.equal(preciseYun.大运.首运年龄, 9, '首运年龄应与常见大运表口径一致');
assert.equal(firstDaYun.干支, '壬申', '首运干支应正确');
assert.equal(firstDaYun.开始年份, 2032, '首运开始年份应按真实起运日期计算');
assert.equal(firstDaYun.结束年份, 2042, '首运结束年份应按真实结束日期计算');
assert.equal(firstDaYun.开始日期, '2032-02-25', '首运开始日期应精确到日');
assert.equal(firstDaYun.结束日期, '2042-02-24', '首运结束日期应精确到日');
assert.equal(firstDaYun.开始年龄, 9, '首运年龄区间应沿用常见大运表口径');
assert.equal(firstDaYun.结束年龄, 18, '首运年龄区间结束值应正确');

console.log('[BaZi][Test] 基础回归测试通过');
