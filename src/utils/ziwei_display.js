const LOGGER_PREFIX = '[ZiWeiDisplay]';
const PALACE_STAR_FIELDS = ['majorStars', 'minorStars', 'adjectiveStars'];
const MUTAGEN_SCOPE_ORDER = ['birth', 'decadal', 'yearly', 'monthly', 'daily'];
const PALACE_SCOPE_META = {
  decadal: { label: '大限', dataKey: 'decadal' },
  yearly: { label: '流年', dataKey: 'yearly' },
  monthly: { label: '流月', dataKey: 'monthly' },
  daily: { label: '流日', dataKey: 'daily' }
};

export const getZiWeiVisibleStars = (stars) => {
  try {
    if (!Array.isArray(stars)) {
      return [];
    }

    return stars.filter((star) => star && typeof star === 'object');
  } catch (error) {
    console.error(`${LOGGER_PREFIX} 解析星曜列表失败`, error);
    return [];
  }
};

export const getZiWeiStarDisplayMeta = (star) => {
  try {
    if (!star || typeof star !== 'object') {
      return {
        name: '未识别',
        mutagen: '',
        selfMutagens: [],
        state: '',
        title: '未识别'
      };
    }

    const name = typeof star.name === 'string' && star.name.trim()
      ? star.name.trim()
      : '未识别';
    const mutagen = typeof star.mutagen === 'string'
      ? star.mutagen.trim()
      : '';
    const selfMutagens = Array.isArray(star.selfMutagens)
      ? star.selfMutagens.filter((item) => typeof item === 'string' && item.trim()).map((item) => item.trim())
      : [];
    const state = typeof star.brightness === 'string'
      ? star.brightness.trim()
      : '';
    const titleParts = [name];

    if (mutagen) {
      titleParts.push(`化${mutagen}`);
    }

    if (state) {
      titleParts.push(state);
    }

    return {
      name,
      mutagen,
      selfMutagens,
      state,
      title: titleParts.join(' ')
    };
  } catch (error) {
    console.error(`${LOGGER_PREFIX} 解析星曜展示数据失败`, error);

    return {
      name: '未识别',
      mutagen: '',
      selfMutagens: [],
      state: '',
      title: '未识别'
    };
  }
};

export const getZiWeiPalaceDisplayStars = (palace) => {
  try {
    if (!palace || typeof palace !== 'object') {
      return [];
    }

    return PALACE_STAR_FIELDS.flatMap((field) => getZiWeiVisibleStars(palace[field]));
  } catch (error) {
    console.error(`${LOGGER_PREFIX} 解析宫位星曜展示序列失败`, error);
    return [];
  }
};

export const getZiWeiVerticalTextTokens = (text) => {
  try {
    if (typeof text !== 'string') {
      return [];
    }

    const normalizedText = text.trim();

    if (!normalizedText) {
      return [];
    }

    return Array.from(normalizedText);
  } catch (error) {
    console.error(`${LOGGER_PREFIX} 解析竖排文字失败`, error);
    return [];
  }
};

export const getZiWeiStarMetaDisplayItems = (star) => {
  try {
    const starMeta = getZiWeiStarDisplayMeta(star);
    const items = [];

    if (starMeta.state) {
      items.push({ key: 'state', value: starMeta.state });
    }

    if (starMeta.mutagen) {
      items.push({ key: 'mutagen', value: starMeta.mutagen });
    }

    return items;
  } catch (error) {
    console.error(`${LOGGER_PREFIX} 解析星曜元信息展示顺序失败`, error);
    return [];
  }
};

const appendPalaceSuffix = (palaceName) => {
  if (typeof palaceName !== 'string') {
    return '';
  }

  const normalizedName = palaceName.trim();

  if (!normalizedName) {
    return '';
  }

  return normalizedName.endsWith('宫') ? normalizedName : `${normalizedName}宫`;
};

const findSummaryMutagen = (summary, palaceName, starName) => {
  if (!Array.isArray(summary)) {
    return '';
  }

  const targetItem = summary.find((item) => item?.palaceName === palaceName && item?.starName === starName);
  return typeof targetItem?.mutagen === 'string' ? targetItem.mutagen.trim() : '';
};

export const getZiWeiStarScopeMutagenSlots = ({
  palaceName,
  star,
  visibleScopes = [],
  birthMutagenSummary = [],
  decadalMutagenSummary = [],
  yearlyMutagenSummary = [],
  monthlyMutagenSummary = [],
  dailyMutagenSummary = []
}) => {
  try {
    const starMeta = getZiWeiStarDisplayMeta(star);
    const normalizedPalaceName = typeof palaceName === 'string' ? palaceName.trim() : '';
    const scopes = Array.isArray(visibleScopes)
      ? visibleScopes.filter((scope) => MUTAGEN_SCOPE_ORDER.includes(scope))
      : [];
    const summaryMap = {
      birth: birthMutagenSummary,
      decadal: decadalMutagenSummary,
      yearly: yearlyMutagenSummary,
      monthly: monthlyMutagenSummary,
      daily: dailyMutagenSummary
    };

    return scopes.map((scope) => {
      const mutagen = normalizedPalaceName && starMeta.name !== '未识别'
        ? findSummaryMutagen(summaryMap[scope], normalizedPalaceName, starMeta.name)
        : '';

      return {
        scope,
        mutagen,
        empty: !mutagen
      };
    });
  } catch (error) {
    console.error(`${LOGGER_PREFIX} 解析星曜作用域四化失败`, error);
    return [];
  }
};

export const getZiWeiPalaceScopeLabels = ({ palaceIndex, visibleScopes = [], horoscope }) => {
  try {
    if (!Number.isInteger(palaceIndex) || palaceIndex < 0 || !horoscope || typeof horoscope !== 'object') {
      return [];
    }

    const scopes = Array.isArray(visibleScopes)
      ? visibleScopes.filter((scope) => Object.hasOwn(PALACE_SCOPE_META, scope))
      : [];

    return scopes
      .map((scope) => {
        const scopeMeta = PALACE_SCOPE_META[scope];
        const palaceName = horoscope?.[scopeMeta.dataKey]?.palaceNames?.[palaceIndex];
        const displayPalaceName = appendPalaceSuffix(palaceName);

        if (!displayPalaceName) {
          return null;
        }

        return {
          scope,
          label: `${scopeMeta.label}${displayPalaceName}`
        };
      })
      .filter(Boolean);
  } catch (error) {
    console.error(`${LOGGER_PREFIX} 解析宫位作用域标签失败`, error);
    return [];
  }
};
