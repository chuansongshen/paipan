import assert from 'node:assert/strict';
import process from 'node:process';
import { getDaLiuRenPaiPan } from './src/utils/daliuren.js';

// 参考 GitHub 仓库 kentang2017/kinliuren 的输出，覆盖本次修复涉及的课式：
// 1. 多贼克并见时的初传选择
// 2. 无贼克、无遥克时的昴星法
const REFERENCE_CASES = [
  {
    date: '2026-03-21T21:30:00+08:00',
    day: '甲午',
    sanChuan: ['辰', '卯', '寅']
  },
  {
    date: '2026-03-22T21:30:00+08:00',
    day: '乙未',
    sanChuan: ['戌', '卯', '午']
  },
  {
    date: '2026-03-31T21:30:00+08:00',
    day: '甲辰',
    sanChuan: ['寅', '丑', '子']
  }
];

try {
  REFERENCE_CASES.forEach(({ date, day, sanChuan }) => {
    const result = getDaLiuRenPaiPan(new Date(date), 1990, '男');
    const actualSanChuan = result.sanChuan.map((item) => item.zhi);

    assert.equal(result.ganZhi.day, day, `[DaLiuRen][Reference] 日柱不匹配: ${date}`);
    assert.deepEqual(
      actualSanChuan,
      sanChuan,
      `[DaLiuRen][Reference] 三传与 GitHub 参考实现不一致: ${date}`
    );
  });

  console.log('[DaLiuRen][Reference] GitHub 参考课例回归测试通过');
} catch (error) {
  console.error('[DaLiuRen][Reference] GitHub 参考课例回归测试失败');
  console.error(error);
  process.exitCode = 1;
}
