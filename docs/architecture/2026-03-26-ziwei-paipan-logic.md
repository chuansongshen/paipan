# 紫微斗数排盘逻辑梳理

## 1. 文档目的

本文用于说明当前仓库里紫微斗数模块的实际排盘流程、依赖边界、本地修正逻辑，以及运限切换与复制文本的生成方式。

本文基于以下文件整理：

- `src/utils/ziwei.js`
- `src/utils/ziwei_calendar.js`
- `src/utils/ziwei_brightness.js`
- `src/utils/ziwei_naming.js`
- `src/utils/ziwei_app.js`
- `src/utils/ziwei_copy.js`
- `test_ziwei.js`

## 2. 总体结论

当前紫微斗数模块不是“完全本地手写排盘”，而是分成三层：

1. 底层排盘层：由 `iztro` 负责生成命盘、宫位、星曜、四化和运限基础数据。
2. 本地修正层：对 `iztro` 的结果做中州派/文墨风格兼容处理，包括命主修正、亮度补表、名称别名、伴星补齐、四化摘要和自动判语。
3. 展示与交互层：负责目标时间切换、复制文本整理、界面所需的数据结构输出。

也就是说，当前项目里的“紫微排盘逻辑”并不只是一套安星公式，而是：

`iztro 基础盘` + `本地口径修正` + `运限摘要生成` + `展示友好化`

## 3. 入口与主链路

核心入口是 `src/utils/ziwei.js` 中的 `getZiWeiPaiPan(date, gender, targetDate)`。

主链路如下：

1. 校验输入
2. 配置 `iztro` 为 `zhongzhou`
3. 把出生时间转成 `iztro` 需要的阳历日期字符串和时辰索引
4. 调用 `astro.bySolar(...)` 生成本命盘
5. 调用 `astrolabe.horoscope(...)` 生成目标时间对应的运限快照
6. 把底层宫位数据格式化为前端可用结构
7. 补亮度、补伴星、修正命主、生成农历/四柱补充信息
8. 生成四化摘要、三方四正摘要、命迁财官摘要和自动提示
9. 返回统一结果对象供页面、复制文本和测试使用

对应代码位置：

- 入口：`src/utils/ziwei.js` 第 638 行起
- 核心返回对象：`src/utils/ziwei.js` 第 679 行起

## 4. 底层依赖边界

### 4.1 `iztro` 负责什么

当前项目通过 `astro.bySolar(solarDate, timeIndex, gender, true, 'zh-CN')` 调用 `iztro`。

`iztro` 负责提供：

- 十二宫
- 主星、辅星、杂曜
- 命宫、身宫、身主、命主的底层结果
- 五行局
- 四化
- 大限、小限、流年、流月、流日、流时
- 三方四正和飞化相关能力

本项目没有重写这些底层安星公式。

### 4.2 当前给 `iztro` 的配置

本地只显式配置了：

```js
astro.config({
  algorithm: 'zhongzhou'
});
```

这意味着当前项目明确锁定了“中州派安星法”，但没有覆写 `iztro` 其他配置项，因此仍沿用 `iztro` 的默认值：

- `yearDivide = 'normal'`
- `horoscopeDivide = 'normal'`
- `ageDivide = 'normal'`
- `dayDivide = 'forward'`

这几个默认值来自当前安装版本 `iztro@2.5.8` 的内部默认配置。

## 5. 输入处理口径

### 5.1 出生时间格式

`getZiWeiPaiPan` 接收的是 JavaScript `Date`。

本地会把它拆成两部分：

- 出生阳历日期字符串：`YYYY-M-D`
- 出生时辰索引：`0 ~ 12`

日期格式由 `formatSolarDate()` 生成，不补零，例如 `2000-8-16`。

### 5.2 时辰索引规则

时辰索引由 `getTimeIndexFromDate()` 计算：

- `23:xx` -> `12`，晚子时
- `00:xx` -> `0`，早子时
- 其他时刻 -> `Math.floor((hour + 1) / 2)`

这意味着：

- 计算时辰只看“小时”，不看分钟
- `01:00` 到 `01:59` 都算丑时
- `03:00` 会映射为寅时
- `23:30` 会映射为晚子时

## 6. 本命盘生成逻辑

### 6.1 调用链

本命盘生成的核心调用是：

```js
const astrolabe = astro.bySolar(solarDate, birthTimeIndex, gender, true, 'zh-CN');
```

其中：

- `solarDate` 是出生公历日期
- `birthTimeIndex` 是上一步计算的时辰索引
- `gender` 只接受 `男 / 女`
- `fixLeap = true`，表示闰月场景按 `iztro` 的“修正闰月”逻辑处理
- 输出语言固定为 `zh-CN`

### 6.2 宫位与星曜格式化

`astrolabe.palaces` 返回底层宫位对象后，会先经过 `formatPalace()` 做统一格式化。

这一层主要做了这些事：

- 统一宫位名称
- 统一星曜名称
- 给所有星曜补 `brightness`
- 提取 `mutagen`
- 初始化 `selfMutagens`
- 读取宫位本身的四化标签
- 读取宫位自化信息
- 把“自化”挂回到具体星曜后面

格式化完成后，每个宫位会输出：

- `majorStars`
- `minorStars`
- `adjectiveStars`
- `mutagenTags`
- `selfMutagens`
- `majorStarText`
- `decadal`
- `ages`
- `isBodyPalace`
- `isOriginalPalace`

## 7. 本地修正逻辑

这一部分是当前紫微模块最值得特别说明的地方。

### 7.1 命主修正

`iztro` 在 `zhongzhou` 算法下，底层命主取法是“按年支找命主”。

本地代码又增加了一层 `resolveZiWeiSoul()`：

- 不直接使用 `astrolabe.soul`
- 改为优先按“命宫地支”映射到命主星
- 只有映射失败时才回退到底层结果

当前映射表在 `ZIWEI_SOUL_STAR_BY_BRANCH` 中。

这意味着：

- 当前页面里看到的 `soul / 命主`
- 与 `iztro` 原始 `astrolabe.soul`

可能不同。

测试里也明确校验了这一点，例如：

- `2000-08-16 03:00` 最终命主是 `破军`
- 同时日志里能看到底层 `iztro` 原始命主并不相同

### 7.2 星曜亮度补表

`iztro` 并不会覆盖项目现在需要展示的全部亮度信息，因此本地通过 `resolveZiWeiStarBrightness()` 做了两层补充：

1. 先读覆盖表 `STAR_BRIGHTNESS_BRANCH_OVERRIDE`
2. 再读基础亮度总表 `STAR_BRIGHTNESS_TABLE`

如果底层本身已有亮度，也会优先保留已有值，除非命中覆盖表。

这一步主要是为了让当前盘面更贴近项目目标样式，尤其是辅星、杂曜和文墨风格样例。

### 7.3 宫位与星名别名

本地做了少量文案级别的统一：

- `仆役` -> `交友`
- `官府` -> `官符`
- `boshi12` 标签展示为 `太岁煞禄`

这类调整只影响展示与复制文本，不改变底层排盘位置。

### 7.4 伴星补齐

`appendZiWeiCompanionStars()` 会根据当前项目的文墨风格规则补两类伴星：

- 看到 `旬空` 时，在下一个地支宫补 `副旬`
- 看到 `截空` 时，在下一个地支宫补 `副截`

规则特点：

- 只在格式化后的宫位层补，不回写到底层库
- 按“地支顺序的下一宫”补
- 如果目标宫已有同名伴星则不重复补

### 7.5 自化挂星

宫位本身的自化信息不会只停留在宫位层。

本地会根据 `SELF_MUTAGEN_STAR_MAP`：

- 把宫位的自化 `禄 / 权 / 科 / 忌`
- 精确挂到宫内对应的星曜对象上

这样做的目的，是让界面和复制文本能直接在星名后面输出 `[自化禄]` 这类标签。

## 8. 农历与四柱补充逻辑

这部分不是 `iztro` 直接给的，而是本地通过 `lunar-javascript` 在 `buildZiWeiLunarMeta()` 里补出来的。

输出包括：

- `lunarTimeText`
- `seasonalFourPillars`
- `normalFourPillars`
- `childYearDouJun`

其中：

- `seasonalFourPillars` 来自 `Lunar.fromDate(birthDate).getBaZi()`
- `normalFourPillars` 来自 `iztro` 的 `astrolabe.chineseDate`

这说明当前模块内部其实同时保留了两套“四柱来源”：

1. `iztro` 的干支日期文本
2. `lunar-javascript` 重新计算的节气四柱

在多数普通样例里它们可能一致，但在节气交界附近不一定完全相同。

## 9. 运限生成逻辑

### 9.1 目标运限入口

目标运限通过下面的调用生成：

```js
const horoscope = astrolabe.horoscope(now, horoscopeTimeIndex);
```

其中：

- `now` 实际上是传入的 `targetDate`
- `horoscopeTimeIndex` 也是按与出生时间相同的规则计算出来的时辰索引

### 9.2 运限输出内容

当前保留了以下运限对象：

- `decadal` 大限
- `age` 小限
- `yearly` 流年
- `monthly` 流月
- `daily` 流日
- `hourly` 流时

本地会把它们统一格式化成 `formatHoroscope()` 的结果，保留：

- 目标宫位索引
- 宫位名称
- 天干地支
- 十二宫名称列表
- 四化星列表
- 流耀数据

### 9.3 运限切换方式

前端的快速切换不是直接改局部状态，而是“改目标时间，然后重新排盘”。

`src/utils/ziwei_app.js` 负责这部分：

- 切大限/流年：按年龄差平移年份
- 切流月：改月份，自动处理月底越界
- 切流日：改日期，保留月份和时分

然后重新调用 `getZiWeiPaiPan()` 生成新的目标运限快照。

## 10. 摘要与自动提示生成逻辑

当前紫微模块不只返回排盘，还会额外生成几类结构化摘要。

### 10.1 生年四化摘要

`formatBirthMutagenSummary()` 会遍历全部宫位里的全部星曜，把有 `mutagen` 的星曜抽出来，形成生年四化摘要。

这类摘要用于：

- 页面展示
- 复制文本输出
- 自动判语

### 10.2 目标运限四化摘要

`formatHoroscopeMutagenSummary()` 会读取某个运限对象的四化星名，再反查这些星曜落在哪个宫位。

当前生成了：

- `decadalMutagenSummary`
- `yearlyMutagenSummary`
- `monthlyMutagenSummary`
- `dailyMutagenSummary`

### 10.3 三方四正与飞化摘要

当前只对核心宫位做重点摘要：

- 命宫
- 财帛
- 官禄
- 迁移
- 夫妻
- 福德

其中会分别生成：

- `surroundedSummaries`
- `corePalaceSummaries`
- `commandPalaceOverview`

`commandPalaceOverview` 会进一步压缩成“命、迁、财、官”四条主线，供自动判语使用。

### 10.4 自动判语

`autoInsights` 的来源不是底层库，而是本地规则引擎。

当前逻辑主要看：

- 命迁财官四条主线的自化
- 飞化目标宫
- 三方四正是否见忌
- 三方四正是否同时见禄权科
- 目标大限和目标流年的四化落宫

最后按优先级排序、去重，并截取前 10 条。

因此，`autoInsights` 是“项目自己的解释层”，不是 `iztro` 的原生结果。

## 11. 复制文本逻辑

复制文本由 `src/utils/ziwei_copy.js` 负责。

这里有两个重要口径：

### 11.1 真太阳时只用于复制文本

`ziwei_copy.js` 会根据固定经度推一个“真太阳时”，并写进复制文本。

但当前核心排盘 `getZiWeiPaiPan()` 并没有使用这个真太阳时重新排盘。

也就是说：

- 命盘本体：按输入的钟表时间排
- 复制文本：额外展示一个近似真太阳时

两者不是同一套输入。

### 11.2 十二宫输出顺序

复制文本里的十二宫不是按原数组顺序，而是按地支顺序重新排序输出。

同时会额外补：

- 大限
- 小限
- 流年
- 伴星、自化、生年四化等标签

## 12. 当前结果对象的关键字段

`getZiWeiPaiPan()` 最终返回的数据大致可以分成 5 组：

### 12.1 基本信息

- `gender`
- `solarDate`
- `lunarDate`
- `chineseDate`
- `time`
- `timeRange`
- `sign`
- `zodiac`
- `fiveElementsClass`

### 12.2 命盘主体

- `palaces`
- `soulPalace`
- `bodyPalace`
- `fortunePalace`
- `careerPalace`
- `spousePalace`
- `movePalace`

### 12.3 出生补充信息

- `birthDateInfo`
- `birthDateTime`
- `lunarTimeText`
- `seasonalFourPillars`
- `normalFourPillars`

### 12.4 运限信息

- `horoscopeTargetDateTime`
- `horoscopeTargetTimeIndex`
- `horoscope`

### 12.5 本地增强摘要

- `birthMutagenSummary`
- `decadalMutagenSummary`
- `yearlyMutagenSummary`
- `monthlyMutagenSummary`
- `dailyMutagenSummary`
- `surroundedSummaries`
- `corePalaceSummaries`
- `commandPalaceOverview`
- `autoInsights`

## 13. 当前口径与注意事项

### 13.1 当前命盘并不使用真太阳时

真太阳时只出现在复制文本里，不参与 `getZiWeiPaiPan()` 的核心排盘。

### 13.2 当前命主不是完全信任底层库

命主会被本地按命宫地支再修正一次，因此日志里的 `soulByIztro` 与最终返回的 `soul` 可能不同。

### 13.3 当前时辰索引只看小时

分钟不会影响时辰归属，只有 `23 点` 和 `0 点` 被单独识别为晚子时、早子时。

### 13.4 当前只显式锁定了中州派算法

项目没有显式设置 `yearDivide / horoscopeDivide / ageDivide / dayDivide`，因此这些行为依赖当前 `iztro` 默认值。

### 13.5 当前自动判语属于项目自定义解释层

它是为了增强可读性和分析效率，不等同于任何传统文献里的原始断语。

## 14. 推荐维护方式

如果后续要调整紫微模块，建议按下面顺序判断应该改哪一层：

1. 如果“宫位、星曜位置、运限本体”不对，先检查 `iztro` 配置和调用方式。
2. 如果“命主、亮度、别名、伴星”不对，优先检查本地修正层。
3. 如果“自动提示、摘要、复制文本”不对，检查本地解释层和展示层。
4. 如果“流年/流月/流日切换行为”不对，检查 `ziwei_app.js` 的目标时间平移逻辑。

## 15. 本次核对方式

本文整理后，已经用仓库现有回归测试核对过关键行为：

```bash
node test_ziwei.js
```

测试通过，且关键样例验证了以下事实：

- 当前紫微模块会返回 12 宫
- 当前命主会按本地命宫地支映射修正
- 当前亮度补表和伴星补齐已生效
- 当前会输出节气四柱、非节气四柱和目标运限快照
- 当前目标运限切换依赖重新排盘而不是局部改值
