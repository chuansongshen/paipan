import assert from 'node:assert/strict';
import process from 'node:process';
import { getDaLiuRenPaiPan } from './src/utils/daliuren.js';

const REGRESSION_CASES = [
  {
    label: '阳日别责: 戊午日干上午',
    date: '2026-02-13T21:30:00+08:00',
    day: '戊午',
    firstKeTop: '午',
    expectedSanChuan: ['寅', '午', '午']
  },
  {
    label: '阴日别责: 辛酉日干上酉',
    date: '2026-02-16T02:00:00+08:00',
    day: '辛酉',
    firstKeTop: '酉',
    expectedSanChuan: ['丑', '酉', '酉']
  },
  {
    label: '阳日八专: 庚申日干上丑',
    date: '2026-02-15T14:00:00+08:00',
    day: '庚申',
    firstKeTop: '丑',
    expectedSanChuan: ['卯', '丑', '丑']
  },
  {
    label: '阴日八专: 己未日干上戌',
    date: '2026-02-14T18:00:00+08:00',
    day: '己未',
    firstKeTop: '戌',
    expectedSanChuan: ['亥', '戌', '戌']
  }
];

try {
  REGRESSION_CASES.forEach(({ label, date, day, firstKeTop, expectedSanChuan }) => {
    const result = getDaLiuRenPaiPan(new Date(date), 1990, '男');
    const actualSanChuan = result.sanChuan.map((item) => item.zhi);

    assert.equal(result.ganZhi.day, day, `[DaLiuRen][BieZeBaZhuan] 日柱不匹配: ${label}`);
    assert.equal(result.siKe.first.zhi, firstKeTop, `[DaLiuRen][BieZeBaZhuan] 干上不匹配: ${label}`);
    assert.deepEqual(
      actualSanChuan,
      expectedSanChuan,
      `[DaLiuRen][BieZeBaZhuan] 三传不匹配: ${label}`
    );
  });

  console.log('[DaLiuRen][BieZeBaZhuan] 别责与八专回归测试通过');
} catch (error) {
  console.error('[DaLiuRen][BieZeBaZhuan] 别责与八专回归测试失败');
  console.error(error);
  process.exitCode = 1;
}
