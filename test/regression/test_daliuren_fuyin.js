import assert from 'node:assert/strict';
import process from 'node:process';
import { getDaLiuRenPaiPan } from '../../src/utils/daliuren.js';

const EXPECTED_FU_YIN_SAN_CHUAN = [
  { date: '2026-03-01T22:00:00+08:00', day: '甲戌', sanChuan: ['寅', '巳', '申'] },
  { date: '2026-03-02T22:00:00+08:00', day: '乙亥', sanChuan: ['辰', '亥', '巳'] },
  { date: '2026-03-03T22:00:00+08:00', day: '丙子', sanChuan: ['巳', '申', '寅'] },
  { date: '2026-03-04T22:00:00+08:00', day: '丁丑', sanChuan: ['丑', '戌', '未'] },
  { date: '2026-03-05T22:00:00+08:00', day: '戊寅', sanChuan: ['巳', '申', '寅'] },
  { date: '2026-03-06T22:00:00+08:00', day: '己卯', sanChuan: ['卯', '子', '卯'] },
  { date: '2026-03-07T22:00:00+08:00', day: '庚辰', sanChuan: ['申', '寅', '巳'] },
  { date: '2026-03-08T22:00:00+08:00', day: '辛巳', sanChuan: ['巳', '申', '寅'] },
  { date: '2026-03-09T22:00:00+08:00', day: '壬午', sanChuan: ['亥', '午', '子'] },
  { date: '2026-03-10T22:00:00+08:00', day: '癸未', sanChuan: ['丑', '戌', '未'] },
  { date: '2026-03-11T22:00:00+08:00', day: '甲申', sanChuan: ['寅', '巳', '申'] },
  { date: '2026-03-12T22:00:00+08:00', day: '乙酉', sanChuan: ['辰', '酉', '卯'] },
  { date: '2026-03-13T22:00:00+08:00', day: '丙戌', sanChuan: ['巳', '申', '寅'] },
  { date: '2026-03-14T22:00:00+08:00', day: '丁亥', sanChuan: ['亥', '未', '丑'] },
  { date: '2026-03-15T22:00:00+08:00', day: '戊子', sanChuan: ['巳', '申', '寅'] },
  { date: '2026-03-16T22:00:00+08:00', day: '己丑', sanChuan: ['丑', '戌', '未'] },
  { date: '2026-03-17T22:00:00+08:00', day: '庚寅', sanChuan: ['申', '寅', '巳'] },
  { date: '2026-03-18T22:00:00+08:00', day: '辛卯', sanChuan: ['卯', '子', '卯'] }
];

try {
  EXPECTED_FU_YIN_SAN_CHUAN.forEach(({ date, day, sanChuan }) => {
    const result = getDaLiuRenPaiPan(new Date(date), 1990, '男');
    const actualSanChuan = result.sanChuan.map((item) => item.zhi);

    assert.equal(result.ganZhi.day, day, `[DaLiuRen][Test] 日柱不匹配: ${date}`);
    assert.deepEqual(
      result.tianPan,
      ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'],
      `[DaLiuRen][Test] 非伏吟局: ${date}`
    );
    assert.deepEqual(
      actualSanChuan,
      sanChuan,
      `[DaLiuRen][Test] 伏吟局三传不符合预期: ${date}`
    );
    assert.notEqual(
      new Set(actualSanChuan).size,
      1,
      `[DaLiuRen][Test] 伏吟局三传不应全部相同: ${date}`
    );
  });

  console.log('[DaLiuRen][Test] 伏吟局三传回归测试通过');
} catch (error) {
  console.error('[DaLiuRen][Test] 伏吟局三传回归测试失败');
  console.error(error);
  process.exitCode = 1;
}
