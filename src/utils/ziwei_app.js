import dayjs from 'dayjs';

const LOGGER_PREFIX = '[ZiWeiApp]';
const SUPPORTED_TARGET_MODES = new Set(['birth', 'now', 'custom']);
const EMPTY_OPTIONS = [];
const EMPTY_QUICK_SELECTION_STATE = {
  activeDecadalKey: '',
  activeYearlyKey: '',
  activeMonthlyKey: '',
  activeDailyKey: '',
  isBirthChart: false
};

const normalizeAgeRange = (range) => {
  if (!Array.isArray(range) || range.length < 2) {
    return null;
  }

  const startAge = Number(range[0]);
  const endAge = Number(range[1]);

  if (!Number.isFinite(startAge) || !Number.isFinite(endAge) || endAge < startAge) {
    return null;
  }

  return [startAge, endAge];
};

const normalizeNominalAge = (value) => {
  const nominalAge = Number(value);
  return Number.isFinite(nominalAge) ? nominalAge : null;
};

const normalizeMonthValue = (value) => {
  const monthValue = Number(value);
  return Number.isInteger(monthValue) && monthValue >= 1 && monthValue <= 12
    ? monthValue
    : null;
};

const normalizeDayValue = (value) => {
  const dayValue = Number(value);
  return Number.isInteger(dayValue) && dayValue >= 1 ? dayValue : null;
};

const normalizeSelectionKey = (value) => (typeof value === 'string' ? value : '');

const formatTwoDigits = (value) => String(value).padStart(2, '0');

export function resolveZiWeiTargetDateTime(
  targetMode,
  customTargetDate,
  nowValue = dayjs(),
  birthDateValue = nowValue
) {
  try {
    if (!SUPPORTED_TARGET_MODES.has(targetMode)) {
      throw new Error(`紫微斗数目标模式无效: ${targetMode}`);
    }

    let resolvedDate = customTargetDate;

    if (targetMode === 'birth') {
      resolvedDate = birthDateValue;
    } else if (targetMode === 'now') {
      resolvedDate = nowValue;
    }

    if (!dayjs.isDayjs(resolvedDate) || !resolvedDate.isValid()) {
      throw new Error('紫微斗数目标时间无效');
    }

    return resolvedDate;
  } catch (error) {
    console.error(`${LOGGER_PREFIX} 解析目标时间失败`, error);
    throw error instanceof Error
      ? error
      : new Error('紫微斗数目标时间解析失败：发生未知错误');
  }
}

export function deriveZiWeiFullSelectionState(panData, targetDate) {
  try {
    const safeTargetDate = resolveZiWeiTargetDateTime('custom', targetDate, targetDate);
    const currentDecadalOption = getZiWeiCurrentDecadalOption(panData);
    const currentNominalAge = normalizeNominalAge(panData?.horoscope?.age?.nominalAge);
    const normalizedNominalAge = normalizeNominalAge(currentNominalAge);

    return {
      activeDecadalKey: currentDecadalOption?.key || '',
      activeYearlyKey: normalizedNominalAge === null ? '' : String(normalizedNominalAge),
      activeMonthlyKey: String(safeTargetDate.month() + 1),
      activeDailyKey: String(safeTargetDate.date()),
      isBirthChart: false
    };
  } catch (error) {
    console.error(`${LOGGER_PREFIX} 根据目标时间推导完整选择状态失败`, error);
    return { ...EMPTY_QUICK_SELECTION_STATE };
  }
}

export function getZiWeiQuickSelectionState(targetMode, selectionState = {}) {
  try {
    if (targetMode === 'birth') {
      return {
        ...EMPTY_QUICK_SELECTION_STATE,
        isBirthChart: true
      };
    }

    return {
      activeDecadalKey: normalizeSelectionKey(selectionState.activeDecadalKey),
      activeYearlyKey: normalizeSelectionKey(selectionState.activeYearlyKey),
      activeMonthlyKey: normalizeSelectionKey(selectionState.activeMonthlyKey),
      activeDailyKey: normalizeSelectionKey(selectionState.activeDailyKey),
      isBirthChart: false
    };
  } catch (error) {
    console.error(`${LOGGER_PREFIX} 计算快速切换高亮状态失败`, error);
    return { ...EMPTY_QUICK_SELECTION_STATE };
  }
}

export function buildZiWeiDecadalOptions(panData) {
  try {
    if (!panData || !Array.isArray(panData.palaces)) {
      return EMPTY_OPTIONS;
    }

    const currentNominalAge = normalizeNominalAge(panData?.horoscope?.age?.nominalAge);
    const optionMap = new Map();

    panData.palaces.forEach((palace) => {
      const decadalRange = normalizeAgeRange(palace?.decadal?.range);

      if (!decadalRange) {
        return;
      }

      const [startAge, endAge] = decadalRange;
      const key = `${startAge}-${endAge}`;

      if (optionMap.has(key)) {
        return;
      }

      const periodText = [palace?.decadal?.heavenlyStem, palace?.decadal?.earthlyBranch]
        .filter(Boolean)
        .join('');

      optionMap.set(key, {
        key,
        startAge,
        endAge,
        palaceName: palace?.name || '未识别宫位',
        periodText,
        primaryLabel: `${startAge}-${endAge}`,
        secondaryLabel: periodText ? `${palace?.name} ${periodText}` : (palace?.name || '未识别宫位'),
        isCurrent: currentNominalAge !== null && currentNominalAge >= startAge && currentNominalAge <= endAge
      });
    });

    return [...optionMap.values()].sort((previous, next) => previous.startAge - next.startAge);
  } catch (error) {
    console.error(`${LOGGER_PREFIX} 构建大限切换选项失败`, error);
    return EMPTY_OPTIONS;
  }
}

export function getZiWeiCurrentDecadalOption(panData) {
  try {
    const decadalOptions = buildZiWeiDecadalOptions(panData);
    return decadalOptions.find((item) => item.isCurrent) || null;
  } catch (error) {
    console.error(`${LOGGER_PREFIX} 获取当前大限选项失败`, error);
    return null;
  }
}

export function buildZiWeiYearlyOptions(panData, targetDate) {
  try {
    if (!panData || !panData.horoscope) {
      return EMPTY_OPTIONS;
    }

    const safeTargetDate = resolveZiWeiTargetDateTime('custom', targetDate, targetDate);
    const nominalAge = normalizeNominalAge(panData?.horoscope?.age?.nominalAge);
    const currentDecadalOption = getZiWeiCurrentDecadalOption(panData);
    const decadalRange = currentDecadalOption
      ? [currentDecadalOption.startAge, currentDecadalOption.endAge]
      : null;

    if (nominalAge === null || !decadalRange) {
      return EMPTY_OPTIONS;
    }

    const [startAge, endAge] = decadalRange;
    const baseYear = safeTargetDate.year();
    const result = [];

    for (let nextAge = startAge; nextAge <= endAge; nextAge += 1) {
      const yearOffset = nextAge - nominalAge;
      const solarYear = baseYear + yearOffset;

      result.push({
        key: String(nextAge),
        nominalAge: nextAge,
        solarYear,
        primaryLabel: String(solarYear),
        secondaryLabel: `${nextAge}虚岁`,
        isCurrent: nextAge === nominalAge
      });
    }

    return result;
  } catch (error) {
    console.error(`${LOGGER_PREFIX} 构建流年切换选项失败`, error);
    return EMPTY_OPTIONS;
  }
}

export function shiftZiWeiTargetDateByAge(targetDate, currentNominalAge, nextNominalAge) {
  try {
    const safeTargetDate = resolveZiWeiTargetDateTime('custom', targetDate, targetDate);
    const currentAge = normalizeNominalAge(currentNominalAge);
    const targetAge = normalizeNominalAge(nextNominalAge);

    if (currentAge === null || targetAge === null) {
      throw new Error('紫微斗数年龄参数无效');
    }

    // 直接按年龄差平移年份，复用现有排盘入口重新生成对应运限快照。
    return safeTargetDate.add(targetAge - currentAge, 'year');
  } catch (error) {
    console.error(`${LOGGER_PREFIX} 根据年龄切换目标时间失败`, error);
    throw error instanceof Error
      ? error
      : new Error('紫微斗数目标时间切换失败：发生未知错误');
  }
}

export function buildZiWeiMonthlyOptions(targetDate) {
  try {
    const safeTargetDate = resolveZiWeiTargetDateTime('custom', targetDate, targetDate);
    const currentMonth = safeTargetDate.month() + 1;
    const currentYear = safeTargetDate.year();

    return Array.from({ length: 12 }, (_, index) => {
      const monthValue = index + 1;

      return {
        key: String(monthValue),
        monthValue,
        primaryLabel: `${formatTwoDigits(monthValue)}月`,
        secondaryLabel: `${currentYear}年`,
        isCurrent: monthValue === currentMonth
      };
    });
  } catch (error) {
    console.error(`${LOGGER_PREFIX} 构建流月切换选项失败`, error);
    return EMPTY_OPTIONS;
  }
}

export function buildZiWeiDailyOptions(targetDate) {
  try {
    const safeTargetDate = resolveZiWeiTargetDateTime('custom', targetDate, targetDate);
    const currentDay = safeTargetDate.date();
    const currentMonth = safeTargetDate.month() + 1;
    const daysInMonth = safeTargetDate.daysInMonth();

    return Array.from({ length: daysInMonth }, (_, index) => {
      const dayValue = index + 1;

      return {
        key: String(dayValue),
        dayValue,
        primaryLabel: `${formatTwoDigits(dayValue)}日`,
        secondaryLabel: `${formatTwoDigits(currentMonth)}月`,
        isCurrent: dayValue === currentDay
      };
    });
  } catch (error) {
    console.error(`${LOGGER_PREFIX} 构建流日切换选项失败`, error);
    return EMPTY_OPTIONS;
  }
}

export function shiftZiWeiTargetDateByMonth(targetDate, nextMonthValue) {
  try {
    const safeTargetDate = resolveZiWeiTargetDateTime('custom', targetDate, targetDate);
    const monthValue = normalizeMonthValue(nextMonthValue);

    if (monthValue === null) {
      throw new Error('紫微斗数流月参数无效');
    }

    const nextDate = safeTargetDate.date(1).month(monthValue - 1);
    const nextDay = Math.min(safeTargetDate.date(), nextDate.daysInMonth());

    return nextDate.date(nextDay);
  } catch (error) {
    console.error(`${LOGGER_PREFIX} 根据流月切换目标时间失败`, error);
    throw error instanceof Error
      ? error
      : new Error('紫微斗数流月切换失败：发生未知错误');
  }
}

export function shiftZiWeiTargetDateByDay(targetDate, nextDayValue) {
  try {
    const safeTargetDate = resolveZiWeiTargetDateTime('custom', targetDate, targetDate);
    const dayValue = normalizeDayValue(nextDayValue);

    if (dayValue === null || dayValue > safeTargetDate.daysInMonth()) {
      throw new Error('紫微斗数流日参数无效');
    }

    return safeTargetDate.date(dayValue);
  } catch (error) {
    console.error(`${LOGGER_PREFIX} 根据流日切换目标时间失败`, error);
    throw error instanceof Error
      ? error
      : new Error('紫微斗数流日切换失败：发生未知错误');
  }
}

export function getCopyBlockReason(appMode, ziweiLoading, panData) {
  try {
    if (appMode === 'ziwei' && ziweiLoading) {
      return '紫微斗数模块仍在加载，请稍后再复制';
    }

    if (!panData) {
      return '暂无排盘数据，无法复制';
    }

    if (typeof panData.error === 'string' && panData.error) {
      return panData.error;
    }

    return '';
  } catch (error) {
    console.error(`${LOGGER_PREFIX} 计算复制状态失败`, error);
    return '复制前校验失败，请稍后再试';
  }
}
