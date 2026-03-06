import React from 'react';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Grid,
  Row,
  Typography,
  message
} from 'antd';
import {
  buildZiWeiDecadalOptions,
  buildZiWeiDailyOptions,
  buildZiWeiMonthlyOptions,
  buildZiWeiYearlyOptions,
  getZiWeiQuickSelectionState,
  shiftZiWeiTargetDateByDay,
  shiftZiWeiTargetDateByAge,
  shiftZiWeiTargetDateByMonth
} from '../utils/ziwei_app';
import {
  getZiWeiPalaceScopeLabels,
  getZiWeiPalaceDisplayStars,
  getZiWeiStarScopeMutagenSlots,
  getZiWeiStarDisplayMeta,
  getZiWeiVerticalTextTokens
} from '../utils/ziwei_display';
import './ZiWeiDisk.css';

const { Text, Title } = Typography;
const { useBreakpoint } = Grid;

const LOGGER_PREFIX = '[ZiWeiDisk]';
const PALACE_RING_LAYOUT = [
  '巳', '午', '未', '申',
  '辰', 'CENTER', 'CENTER', '酉',
  '卯', 'CENTER', 'CENTER', '戌',
  '寅', '丑', '子', '亥'
];

const getStarToneClass = (type) => {
  if (type === 'major') {
    return 'ziwei-star--major';
  }

  if (['soft', 'helper', 'lucun', 'tianma', 'flower'].includes(type)) {
    return 'ziwei-star--helper';
  }

  if (type === 'tough') {
    return 'ziwei-star--tough';
  }

  return 'ziwei-star--normal';
};

const getTargetModeLabel = (targetMode) => {
  if (targetMode === 'birth') {
    return '本命盘';
  }

  if (targetMode === 'now') {
    return '当前时间';
  }

  return '自定义时间';
};

const SCOPE_DISPLAY_CONFIG = {
  birth: { label: '生年' },
  decadal: { label: '大限' },
  yearly: { label: '流年' },
  monthly: { label: '流月' },
  daily: { label: '流日' }
};

const getScopeMutagenClassName = (scope, isEmpty) => {
  const classNames = ['ziwei-star__scope-slot', `ziwei-star__scope-slot--${scope}`];

  if (isEmpty) {
    classNames.push('ziwei-star__scope-slot--empty');
  }

  return classNames.join(' ');
};

const formatHoroscopeLabel = (item) => {
  if (!item) {
    return '暂无运限数据';
  }

  const stemBranch = [item.heavenlyStem, item.earthlyBranch].filter(Boolean).join('');
  const palacePath = Array.isArray(item.palaceNames) && item.palaceNames.length > 0
    ? item.palaceNames.join(' → ')
    : '未定位宫位';

  return `${stemBranch || item.name || '未识别'} · ${palacePath}`;
};

const formatBirthMutagenText = (items = []) => {
  const result = items
    .map((item) => {
      if (!item?.mutagen || !item?.starName) {
        return '';
      }

      return `${item.mutagen}${item.starName}`;
    })
    .filter(Boolean);

  return result.length > 0 ? result.join(' / ') : '无';
};

const formatTargetMutagenText = (items = []) => {
  const result = items
    .map((item) => {
      if (!item?.mutagen) {
        return '';
      }

      return `${item.mutagen}到${item.palaceName || '未定位'}`;
    })
    .filter(Boolean);

  return result.length > 0 ? result.join(' / ') : '无';
};

const getPalaceBadgeList = (palace) => {
  const result = [];

  if (palace?.isBodyPalace) {
    result.push({ key: 'body', label: '身' });
  }

  if (palace?.isOriginalPalace) {
    result.push({ key: 'origin', label: '因' });
  }

  if (palace?.isEmpty) {
    result.push({ key: 'empty', label: '空' });
  }

  return result;
};

const getPalaceStarListClassName = (count) => {
  const classNames = ['ziwei-palace__stars'];

  if (count >= 7) {
    classNames.push('ziwei-palace__stars--dense');
  }

  return classNames.join(' ');
};

const renderVerticalText = (text) => {
  const tokens = getZiWeiVerticalTextTokens(text);

  if (tokens.length === 0) {
    return text;
  }

  return tokens.map((token, index) => (
    <span key={`${text}-${token}-${index}`} className="ziwei-star__char">
      {token}
    </span>
  ));
};

const renderCompactStarList = (palace, displayContext = {}) => {
  const displayStars = getZiWeiPalaceDisplayStars(palace);

  if (displayStars.length === 0) {
    return <span className="ziwei-palace__empty-text">暂无星曜</span>;
  }

  const className = getPalaceStarListClassName(displayStars.length);

  return (
    <div className={className}>
      {displayStars.map((star, index) => {
        const starMeta = getZiWeiStarDisplayMeta(star);
        const scopeSlots = getZiWeiStarScopeMutagenSlots({
          palaceName: palace.name,
          star,
          visibleScopes: displayContext.visibleMutagenScopes,
          birthMutagenSummary: displayContext.birthMutagenSummary,
          decadalMutagenSummary: displayContext.decadalMutagenSummary,
          yearlyMutagenSummary: displayContext.yearlyMutagenSummary,
          monthlyMutagenSummary: displayContext.monthlyMutagenSummary,
          dailyMutagenSummary: displayContext.dailyMutagenSummary
        });

        return (
          <span
            key={`${palace.name}-${starMeta.name}-${index}`}
            className={`ziwei-star ${getStarToneClass(star.type)}`}
            title={starMeta.title}
          >
            <span className="ziwei-star__name">{renderVerticalText(starMeta.name)}</span>
            {starMeta.state && <span className="ziwei-star__state">{starMeta.state}</span>}
            {scopeSlots.length > 0 && (
              <span className="ziwei-star__scope-stack">
                {scopeSlots.map((slot) => (
                  <span
                    key={`${starMeta.name}-${slot.scope}`}
                    className={getScopeMutagenClassName(slot.scope, slot.empty)}
                    title={slot.empty ? `${SCOPE_DISPLAY_CONFIG[slot.scope]?.label || slot.scope}四化空位` : ''}
                  >
                    {slot.mutagen || '空'}
                  </span>
                ))}
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
};

const renderCompactPalaceContent = (palace, displayContext = {}) => {
  if (!palace) {
    return (
      <div className="ziwei-palace ziwei-palace--empty">
        <span className="ziwei-palace__empty-text">暂无宫位数据</span>
      </div>
    );
  }

  const badges = getPalaceBadgeList(palace);
  const periodLabels = getZiWeiPalaceScopeLabels({
    palaceIndex: palace.index,
    visibleScopes: displayContext.visiblePalaceScopes,
    horoscope: displayContext.horoscope
  });
  const agePreview = Array.isArray(palace.ages) && palace.ages.length > 0
    ? palace.ages.slice(0, 3).join('/')
    : '-';
  const decadalRange = Array.isArray(palace?.decadal?.range) ? palace.decadal.range : ['-', '-'];

  return (
    <div className="ziwei-palace">
      <div className="ziwei-palace__head">
        <div>
          <div className="ziwei-palace__title">{palace.name}</div>
          <div className="ziwei-palace__branch">{palace.heavenlyStem}{palace.earthlyBranch}</div>
        </div>
        <div className="ziwei-palace__badge-list">
          {badges.map((badge) => (
            <span key={badge.key} className="ziwei-palace__badge">{badge.label}</span>
          ))}
        </div>
      </div>

      <div className="ziwei-palace__body">
        {renderCompactStarList(palace, displayContext)}
        {periodLabels.length > 0 && (
          <div className="ziwei-palace__period-list">
            {periodLabels.map((item) => (
              <span
                key={`${palace.name}-${item.scope}`}
                className={`ziwei-palace__period-label ziwei-palace__period-label--${item.scope}`}
              >
                {item.label}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="ziwei-palace__footer">
        <span>限 {decadalRange[0]}-{decadalRange[1]}</span>
        <span>岁 {agePreview}</span>
        <span>长 {palace.changsheng12}</span>
        <span>前 {palace.suiqian12}</span>
      </div>
    </div>
  );
};

const renderAutoInsights = (items = []) => {
  if (items.length === 0) {
    return <Text type="secondary">暂无自动判语</Text>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map((item, index) => (
        <div
          key={`${item.kind}-${item.title}-${index}`}
          style={{
            padding: 12,
            borderRadius: 8,
            border: '1px solid #e6f4ff',
            background: '#f7fbff'
          }}
        >
          <Text strong style={{ color: '#1d4ed8' }}>{item.title}</Text>
          <div style={{ marginTop: 6, color: '#444', lineHeight: 1.7 }}>{item.message}</div>
        </div>
      ))}
    </div>
  );
};

const renderSummaryItem = (label, value, strong = false) => (
  <div className="ziwei-summary__item" key={label}>
    <span className="ziwei-summary__item-label">{label}</span>
    <span className={`ziwei-summary__item-value ${strong ? 'ziwei-summary__item-value--strong' : ''}`}>
      {value}
    </span>
  </div>
);

const renderQuickSelectorRow = (title, options, activeKey, onSelect, enabled = true, emptyText = '暂无可切换项') => (
  <div className="ziwei-quick-row">
    <div className="ziwei-quick-row__title">{title}</div>
    <div className="ziwei-quick-row__options">
      {!enabled ? (
        <div className="ziwei-quick-row__empty">{emptyText}</div>
      ) : options.length === 0 ? (
        <div className="ziwei-quick-row__empty">暂无可切换项</div>
      ) : (
        options.map((option) => {
          const isActive = option.key === activeKey;

          return (
            <button
              type="button"
              key={`${title}-${option.key}`}
              className={`ziwei-switch-button ${isActive ? 'ziwei-switch-button--active' : ''}`}
              onClick={() => onSelect(option)}
            >
              <span className="ziwei-switch-button__primary">{option.primaryLabel}</span>
              <span className="ziwei-switch-button__secondary">{option.secondaryLabel}</span>
            </button>
          );
        })
      )}
    </div>
  </div>
);

const renderCenterCard = (data, targetMode, targetDateText, selectedDecadalText, selectedYearlyText) => {
  const isBirthChart = targetMode === 'birth';

  return (
    <div className="ziwei-center-card">
      <div className="ziwei-center-card__mode">
        {isBirthChart ? '默认本命盘' : `${getTargetModeLabel(targetMode)}盘`}
      </div>
      <div className="ziwei-center-card__title">紫微斗数</div>
      <div className="ziwei-center-card__subtitle">{data.solarDate} · {data.timeRange}</div>
      <div className="ziwei-center-card__target">
        {isBirthChart ? '默认以出生时间起本命盘，未选目标运限' : `目标 ${targetDateText}`}
      </div>

      <div className="ziwei-center-card__grid">
        <div>
          <span>命主</span>
          <strong>{data.soul}</strong>
        </div>
        <div>
          <span>身主</span>
          <strong>{data.body}</strong>
        </div>
        <div>
          <span>命宫</span>
          <strong>{data.earthlyBranchOfSoulPalace}</strong>
        </div>
        <div>
          <span>身宫</span>
          <strong>{data.earthlyBranchOfBodyPalace}</strong>
        </div>
      </div>

      <div className="ziwei-center-card__period">
        <span>目标大限</span>
        <strong>{selectedDecadalText}</strong>
      </div>
      <div className="ziwei-center-card__period">
        <span>目标流年</span>
        <strong>{selectedYearlyText}</strong>
      </div>
    </div>
  );
};

const ZiWeiDisk = ({
  data,
  targetDate,
  targetMode = 'birth',
  quickSelection,
  onTargetDateChange,
  onSyncCurrent,
  onResetBirth
}) => {
  const screens = useBreakpoint();

  if (!data) {
    return <div style={{ color: '#999' }}>暂无数据</div>;
  }

  if (data.error) {
    return <div style={{ color: '#ff4d4f' }}>错误: {data.error}</div>;
  }

  const palaceMap = new Map(data.palaces.map((palace) => [palace.earthlyBranch, palace]));
  const decadalOptions = buildZiWeiDecadalOptions(data);
  const yearlyOptions = buildZiWeiYearlyOptions(data, targetDate);
  const monthlyOptions = buildZiWeiMonthlyOptions(targetDate);
  const dailyOptions = buildZiWeiDailyOptions(targetDate);
  const currentNominalAge = Number(data?.horoscope?.age?.nominalAge || 0);
  const selectionState = getZiWeiQuickSelectionState(targetMode, quickSelection);
  const activeDecadalKey = selectionState.activeDecadalKey;
  const activeYearlyKey = selectionState.activeYearlyKey;
  const activeMonthlyKey = selectionState.activeMonthlyKey;
  const activeDailyKey = selectionState.activeDailyKey;
  const isBirthChart = selectionState.isBirthChart;
  const hasDecadalSelection = Boolean(activeDecadalKey);
  const hasYearlySelection = Boolean(activeYearlyKey);
  const hasMonthlySelection = Boolean(activeMonthlyKey);
  const hasDailySelection = Boolean(activeDailyKey);
  const targetDateText = typeof targetDate?.format === 'function'
    ? targetDate.format('YYYY-MM-DD HH:mm')
    : data.horoscopeTargetDateTime;
  const isCompact = !screens.lg;
  const birthMutagenText = formatBirthMutagenText(data.birthMutagenSummary);
  const decadalMutagenText = hasDecadalSelection ? formatTargetMutagenText(data.decadalMutagenSummary) : '未选择';
  const yearlyMutagenText = hasYearlySelection ? formatTargetMutagenText(data.yearlyMutagenSummary) : '未选择';
  const targetModeLabel = getTargetModeLabel(targetMode);
  const selectedDecadalOption = decadalOptions.find((item) => item.key === activeDecadalKey) || null;
  const selectedYearlyOption = yearlyOptions.find((item) => item.key === activeYearlyKey) || null;
  const selectedDecadalText = selectedDecadalOption
    ? `${selectedDecadalOption.primaryLabel} · ${selectedDecadalOption.secondaryLabel}`
    : '未选择';
  const selectedYearlyText = selectedYearlyOption
    ? `${selectedYearlyOption.primaryLabel} · ${selectedYearlyOption.secondaryLabel}`
    : '未选择';
  const summaryItems = [
    ['命主', data.soul, true],
    ['身主', data.body, true],
    ['命宫', data.earthlyBranchOfSoulPalace, false],
    ['身宫', data.earthlyBranchOfBodyPalace, false],
    ['生肖', data.zodiac, false],
    ['星座', data.sign, false],
    ['时辰', data.time, false],
    ['五行局', data.fiveElementsClass, false],
    ['公历时间', data.birthDateTime || '未提供', false],
    ['农历时间', data.lunarTimeText || '未提供', false],
    ['节气四柱', data.seasonalFourPillars || '未提供', false]
  ];
  const visibleMutagenScopes = [
    'birth',
    ...(hasDecadalSelection ? ['decadal'] : []),
    ...(hasYearlySelection ? ['yearly'] : []),
    ...(hasMonthlySelection ? ['monthly'] : []),
    ...(hasDailySelection ? ['daily'] : [])
  ];
  const visiblePalaceScopes = [
    ...(hasDecadalSelection ? ['decadal'] : []),
    ...(hasYearlySelection ? ['yearly'] : []),
    ...(hasMonthlySelection ? ['monthly'] : []),
    ...(hasDailySelection ? ['daily'] : [])
  ];
  const palaceDisplayContext = {
    visibleMutagenScopes,
    visiblePalaceScopes,
    birthMutagenSummary: data.birthMutagenSummary,
    decadalMutagenSummary: data.decadalMutagenSummary,
    yearlyMutagenSummary: data.yearlyMutagenSummary,
    monthlyMutagenSummary: data.monthlyMutagenSummary,
    dailyMutagenSummary: data.dailyMutagenSummary,
    horoscope: data.horoscope
  };

  const handleQuickTargetChange = (nextDate, scope, payload) => {
    try {
      if (typeof onTargetDateChange !== 'function') {
        throw new Error('未提供紫微斗数目标时间回调');
      }

      console.log(`${LOGGER_PREFIX} 快速切换运限`, {
        scope,
        payload,
        nextTargetDate: nextDate.format('YYYY-MM-DD HH:mm')
      });

      onTargetDateChange(nextDate, scope, payload);
    } catch (error) {
      console.error(`${LOGGER_PREFIX} 快速切换运限失败`, error);
      message.error(error instanceof Error ? error.message : '紫微斗数运限切换失败');
    }
  };

  const handleDecadalSelect = (option) => {
    try {
      const nextDate = shiftZiWeiTargetDateByAge(targetDate, currentNominalAge, option.startAge);
      handleQuickTargetChange(nextDate, 'decadal', option);
    } catch (error) {
      console.error(`${LOGGER_PREFIX} 切换大限失败`, error);
      message.error(error instanceof Error ? error.message : '紫微斗数大限切换失败');
    }
  };

  const handleYearlySelect = (option) => {
    try {
      const nextDate = shiftZiWeiTargetDateByAge(targetDate, currentNominalAge, option.nominalAge);
      handleQuickTargetChange(nextDate, 'yearly', option);
    } catch (error) {
      console.error(`${LOGGER_PREFIX} 切换流年失败`, error);
      message.error(error instanceof Error ? error.message : '紫微斗数流年切换失败');
    }
  };

  const handleMonthlySelect = (option) => {
    try {
      const nextDate = shiftZiWeiTargetDateByMonth(targetDate, option.monthValue);
      handleQuickTargetChange(nextDate, 'monthly', option);
    } catch (error) {
      console.error(`${LOGGER_PREFIX} 切换流月失败`, error);
      message.error(error instanceof Error ? error.message : '紫微斗数流月切换失败');
    }
  };

  const handleDailySelect = (option) => {
    try {
      const nextDate = shiftZiWeiTargetDateByDay(targetDate, option.dayValue);
      handleQuickTargetChange(nextDate, 'daily', option);
    } catch (error) {
      console.error(`${LOGGER_PREFIX} 切换流日失败`, error);
      message.error(error instanceof Error ? error.message : '紫微斗数流日切换失败');
    }
  };

  const handleDatePickerChange = (value) => {
    if (!value) {
      return;
    }

    handleQuickTargetChange(value, 'picker', {
      value: value.format('YYYY-MM-DD HH:mm')
    });
  };

  const handleSyncCurrent = () => {
    try {
      if (typeof onSyncCurrent !== 'function') {
        throw new Error('未提供紫微斗数同步当前时间回调');
      }

      console.log(`${LOGGER_PREFIX} 同步当前目标时间`);
      onSyncCurrent();
    } catch (error) {
      console.error(`${LOGGER_PREFIX} 同步当前目标时间失败`, error);
      message.error(error instanceof Error ? error.message : '紫微斗数同步当前时间失败');
    }
  };

  const handleResetBirth = () => {
    try {
      if (typeof onResetBirth !== 'function') {
        throw new Error('未提供紫微斗数本命盘回调');
      }

      console.log(`${LOGGER_PREFIX} 切回本命盘`);
      onResetBirth();
    } catch (error) {
      console.error(`${LOGGER_PREFIX} 切回本命盘失败`, error);
      message.error(error instanceof Error ? error.message : '紫微斗数本命盘切换失败');
    }
  };

  return (
    <div className="ziwei-disk">
      <section className="ziwei-summary">
        <div className="ziwei-summary__header">
          <div>
            <div className="ziwei-summary__eyebrow">文墨式移动宫盘</div>
            <Title level={3} style={{ margin: 0 }} className="ziwei-summary__title">
              紫微斗数命盘
            </Title>
            <Text className="ziwei-summary__subtitle">
              {data.solarDate} · {data.timeRange} · {isBirthChart ? '默认本命起盘' : `目标 ${targetDateText}`}
            </Text>
          </div>
          <div className={`ziwei-summary__mode ${targetMode === 'now' ? 'ziwei-summary__mode--live' : ''}`}>
            {targetModeLabel}
          </div>
        </div>

        <div className="ziwei-summary__grid">
          {summaryItems.map(([label, value, strong]) => renderSummaryItem(label, value, strong))}
        </div>
      </section>

      <Card size="small" styles={{ body: { padding: isCompact ? 8 : 16 } }} className="ziwei-board-shell">
        <div className={`ziwei-board ${isCompact ? 'ziwei-board--compact' : ''}`}>
          {PALACE_RING_LAYOUT.map((branch, index) => {
            if (branch === 'CENTER') {
              return index === 5 ? (
                <React.Fragment key="center">
                  <div className="ziwei-board__center">
                    {renderCenterCard(data, targetMode, targetDateText, selectedDecadalText, selectedYearlyText)}
                  </div>
                </React.Fragment>
              ) : null;
            }

            const palace = palaceMap.get(branch);

            return (
              <div key={`${branch}-${palace?.name || index}`} className="ziwei-board__cell">
                {renderCompactPalaceContent(palace, palaceDisplayContext)}
              </div>
            );
          })}
        </div>
      </Card>

      <section className="ziwei-quick-panel">
        <div className="ziwei-quick-panel__header">
          <div>
            <div className="ziwei-quick-panel__title">下方点击切换目标运限</div>
            <div className="ziwei-quick-panel__desc">
              默认先显示本命盘；需要看运限时，再依次点大限、流年、流月、流日。
            </div>
          </div>
          <div className="ziwei-quick-panel__actions">
            <DatePicker
              showTime
              value={targetDate}
              onChange={handleDatePickerChange}
              format="YYYY-MM-DD HH:mm"
              allowClear={false}
              style={{ minWidth: isCompact ? '100%' : 220 }}
            />
            <Button type={isBirthChart ? 'primary' : 'default'} onClick={handleResetBirth}>
              回到本命
            </Button>
            <Button type={targetMode === 'now' ? 'primary' : 'default'} onClick={handleSyncCurrent}>
              同步当前
            </Button>
          </div>
        </div>

        {renderQuickSelectorRow('大限', decadalOptions, activeDecadalKey, handleDecadalSelect)}
        {renderQuickSelectorRow('流年', yearlyOptions, activeYearlyKey, handleYearlySelect, hasDecadalSelection, '请先选择大限')}
        {renderQuickSelectorRow('流月', monthlyOptions, activeMonthlyKey, handleMonthlySelect, hasYearlySelection, '请先选择流年')}
        {renderQuickSelectorRow('流日', dailyOptions, activeDailyKey, handleDailySelect, hasMonthlySelection, '请先选择流月')}
      </section>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="自动判语" size="small" style={{ height: '100%' }}>
            {renderAutoInsights(data.autoInsights)}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="目标运限" size="small" style={{ height: '100%' }}>
            <div className="ziwei-target-grid">
              <div className="ziwei-target-grid__item">
                <Text type="secondary">盘面状态</Text>
                <div>{isBirthChart ? '本命盘（未选运限）' : `${targetModeLabel} · ${targetDateText}`}</div>
              </div>
              <div className="ziwei-target-grid__item">
                <Text type="secondary">目标时间</Text>
                <div>{targetDateText}</div>
              </div>
              <div className="ziwei-target-grid__item">
                <Text type="secondary">目标日期</Text>
                <div>{data.horoscope.solarDate} / {data.horoscope.lunarDate}</div>
              </div>
              <div className="ziwei-target-grid__item">
                <Text type="secondary">大限</Text>
                <div>{selectedDecadalText}</div>
              </div>
              <div className="ziwei-target-grid__item">
                <Text type="secondary">小限</Text>
                <div>{hasYearlySelection ? `${data.horoscope.age.nominalAge}虚岁 · ${formatHoroscopeLabel(data.horoscope.age)}` : '未选择'}</div>
              </div>
              <div className="ziwei-target-grid__item">
                <Text type="secondary">流年</Text>
                <div>{selectedYearlyText}</div>
                <div style={{ marginTop: 4 }}>
                  <Text type="secondary">流年四化：</Text>
                  <Text>{yearlyMutagenText}</Text>
                </div>
              </div>
              <div className="ziwei-target-grid__item">
                <Text type="secondary">生年 / 大限四化</Text>
                <div>{birthMutagenText}</div>
                <div>{decadalMutagenText}</div>
              </div>
              <div className="ziwei-target-grid__item">
                <Text type="secondary">流月 / 流日 / 流时</Text>
                <div>{hasYearlySelection && hasMonthlySelection ? formatHoroscopeLabel(data.horoscope.monthly) : '未选择'}</div>
                <div>{hasMonthlySelection && activeDailyKey ? formatHoroscopeLabel(data.horoscope.daily) : '未选择'}</div>
                <div>{hasMonthlySelection && activeDailyKey ? formatHoroscopeLabel(data.horoscope.hourly) : '未选择'}</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

    </div>
  );
};

export default ZiWeiDisk;
