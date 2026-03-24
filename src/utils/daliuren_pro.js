import dayjs from 'dayjs';
import { getDaLiuRenPaiPan } from './daliuren.js';

const LOGGER_PREFIX = '[DaLiuRen][Pro]';
const EARTH_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

export const getTransmissionSeatBranch = (transmissionBranch, tianPan) => {
  if (!transmissionBranch) {
    console.warn(`${LOGGER_PREFIX} 三传坐支反查失败: 三传地支为空`);
    return '-';
  }

  if (!Array.isArray(tianPan) || tianPan.length !== EARTH_BRANCHES.length) {
    console.warn(`${LOGGER_PREFIX} 三传坐支反查失败: 天盘无效`, {
      transmissionBranch,
      tianPan
    });
    return '-';
  }

  const earthIdx = tianPan.indexOf(transmissionBranch);
  if (earthIdx === -1) {
    console.warn(`${LOGGER_PREFIX} 三传坐支反查失败: 未找到对应天盘位置`, {
      transmissionBranch,
      tianPan
    });
    return '-';
  }

  return EARTH_BRANCHES[earthIdx] || '-';
};

export const buildDaLiuRenProRows = (dateRange, timePoint, birthYear, gender) => {
  if (!Array.isArray(dateRange) || dateRange.length !== 2) {
    throw new Error('请选择完整的日期范围');
  }

  const [startDate, endDate] = dateRange;
  if (!dayjs.isDayjs(startDate) || !startDate.isValid()) {
    throw new Error('开始日期无效');
  }

  if (!dayjs.isDayjs(endDate) || !endDate.isValid()) {
    throw new Error('结束日期无效');
  }

  if (!dayjs.isDayjs(timePoint) || !timePoint.isValid()) {
    throw new Error('时间无效');
  }

  const normalizedStart = startDate.startOf('day');
  const normalizedEnd = endDate.startOf('day');

  if (normalizedStart.isAfter(normalizedEnd, 'day')) {
    throw new Error('开始日期不能晚于结束日期');
  }

  const rows = [];
  let currentDate = normalizedStart;

  // 批量计算逐日固定时点的三传，并在同一处统一补齐导出所需字段。
  while (currentDate.isBefore(normalizedEnd, 'day') || currentDate.isSame(normalizedEnd, 'day')) {
    const targetDate = currentDate
      .hour(timePoint.hour())
      .minute(timePoint.minute())
      .second(0)
      .millisecond(0);

    try {
      const pan = getDaLiuRenPaiPan(targetDate.toDate(), birthYear || 2000, gender || '男');
      const [chu = {}, zhong = {}, mo = {}] = pan.sanChuan || [];

      rows.push({
        key: targetDate.format('YYYY-MM-DD'),
        date: targetDate.format('YYYY-MM-DD'),
        year: pan.ganZhi?.year || '-',
        month: pan.ganZhi?.month || '-',
        day: pan.ganZhi?.day || '-',
        chu: chu.zhi || '-',
        chuSeat: getTransmissionSeatBranch(chu.zhi, pan.tianPan),
        zhong: zhong.zhi || '-',
        zhongSeat: getTransmissionSeatBranch(zhong.zhi, pan.tianPan),
        mo: mo.zhi || '-',
        moSeat: getTransmissionSeatBranch(mo.zhi, pan.tianPan),
        hasError: false
      });
    } catch (error) {
      const wrappedError = error instanceof Error ? error : new Error('未知计算错误');
      console.error(`${LOGGER_PREFIX} 批量计算失败`, {
        date: targetDate.format('YYYY-MM-DD HH:mm'),
        message: wrappedError.message
      });

      rows.push({
        key: targetDate.format('YYYY-MM-DD'),
        date: targetDate.format('YYYY-MM-DD'),
        year: '-',
        month: '-',
        day: '-',
        chu: '计算失败',
        chuSeat: '-',
        zhong: '-',
        zhongSeat: '-',
        mo: '-',
        moSeat: '-',
        hasError: true
      });
    }

    currentDate = currentDate.add(1, 'day');
  }

  return rows;
};
