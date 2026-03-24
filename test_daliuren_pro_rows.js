import assert from 'node:assert/strict';
import process from 'node:process';
import dayjs from 'dayjs';
import { getDaLiuRenPaiPan } from './src/utils/daliuren.js';
import {
  buildDaLiuRenProRows,
  getTransmissionSeatBranch
} from './src/utils/daliuren_pro.js';

const TEST_RANGE = [dayjs('2026-03-21'), dayjs('2026-03-22')];
const TEST_TIME = dayjs('2026-03-24T21:30:00+08:00');
const TEST_BIRTH_YEAR = 1990;
const TEST_GENDER = '男';

try {
  const rows = buildDaLiuRenProRows(TEST_RANGE, TEST_TIME, TEST_BIRTH_YEAR, TEST_GENDER);

  assert.equal(rows.length, 2, '[DaLiuRen][Pro][Test] 结果行数应为 2');

  rows.forEach((row) => {
    const targetDate = new Date(`${row.date}T21:30:00+08:00`);
    const pan = getDaLiuRenPaiPan(targetDate, TEST_BIRTH_YEAR, TEST_GENDER);
    const [chu = {}, zhong = {}, mo = {}] = pan.sanChuan || [];

    assert.equal(row.hasError, false, `[DaLiuRen][Pro][Test] 结果不应标记为失败: ${row.date}`);
    assert.equal(row.year, pan.ganZhi.year, `[DaLiuRen][Pro][Test] 年柱不匹配: ${row.date}`);
    assert.equal(row.month, pan.ganZhi.month, `[DaLiuRen][Pro][Test] 月柱不匹配: ${row.date}`);
    assert.equal(row.day, pan.ganZhi.day, `[DaLiuRen][Pro][Test] 日柱不匹配: ${row.date}`);
    assert.equal(row.chu, chu.zhi, `[DaLiuRen][Pro][Test] 初传不匹配: ${row.date}`);
    assert.equal(row.zhong, zhong.zhi, `[DaLiuRen][Pro][Test] 中传不匹配: ${row.date}`);
    assert.equal(row.mo, mo.zhi, `[DaLiuRen][Pro][Test] 末传不匹配: ${row.date}`);
    assert.equal(
      row.chuSeat,
      getTransmissionSeatBranch(chu.zhi, pan.tianPan),
      `[DaLiuRen][Pro][Test] 初传坐支不匹配: ${row.date}`
    );
    assert.equal(
      row.zhongSeat,
      getTransmissionSeatBranch(zhong.zhi, pan.tianPan),
      `[DaLiuRen][Pro][Test] 中传坐支不匹配: ${row.date}`
    );
    assert.equal(
      row.moSeat,
      getTransmissionSeatBranch(mo.zhi, pan.tianPan),
      `[DaLiuRen][Pro][Test] 末传坐支不匹配: ${row.date}`
    );
  });

  assert.equal(
    getTransmissionSeatBranch('子', ['午', '未', '申']),
    '-',
    '[DaLiuRen][Pro][Test] 非法天盘应返回占位符'
  );

  console.log('[DaLiuRen][Pro][Test] 专业计算结果行回归测试通过');
} catch (error) {
  console.error('[DaLiuRen][Pro][Test] 专业计算结果行回归测试失败');
  console.error(error);
  process.exitCode = 1;
}
