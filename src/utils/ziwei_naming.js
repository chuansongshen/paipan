const LOGGER_PREFIX = '[ZiWeiNaming]';

const ZIWEI_PALACE_NAME_ALIAS = {
  仆役: '交友'
};

const ZIWEI_STAR_NAME_ALIAS = {
  官府: '官符'
};

const ZIWEI_SECTION_LABELS = {
  changsheng12: '十二长生',
  boshi12: '太岁煞禄',
  suiqian12: '岁前星',
  jiangqian12: '将前星'
};

export const getZiWeiPalaceDisplayName = (name) => {
  try {
    return ZIWEI_PALACE_NAME_ALIAS[name] || name;
  } catch (error) {
    console.error(`${LOGGER_PREFIX} 宫位名称格式化失败`, { name, error });
    return name;
  }
};

export const getZiWeiStarDisplayName = (name) => {
  try {
    return ZIWEI_STAR_NAME_ALIAS[name] || name;
  } catch (error) {
    console.error(`${LOGGER_PREFIX} 星曜名称格式化失败`, { name, error });
    return name;
  }
};

export const getZiWeiSectionLabel = (key) => {
  try {
    return ZIWEI_SECTION_LABELS[key] || key;
  } catch (error) {
    console.error(`${LOGGER_PREFIX} 分组标签格式化失败`, { key, error });
    return key;
  }
};
