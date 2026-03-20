import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { getPaiPan } from './utils/qimen';
import { getDaLiuRenPaiPan } from './utils/daliuren';
import { getLiuYaoPaiPan } from './utils/liuyao';
import { getBaZiPaiPan } from './utils/bazi';
import {
  buildFortunePayload,
  isAiInterpretationSupportedMode
} from './utils/fortunePayload';
import {
  deriveZiWeiFullSelectionState,
  getCopyBlockReason,
  resolveZiWeiTargetDateTime
} from './utils/ziwei_app';
import { buildAiDisabledReason } from './utils/aiInterpretationAvailability';
import { useAiReportFlow } from './hooks/useAiReportFlow';
import { useSessionBootstrap } from './hooks/useSessionBootstrap';
import AiInterpretationSection from './components/AiInterpretationSection';
import QimenDisk from './components/QimenDisk';
import DaLiuRenDisk from './components/DaLiuRenDisk';
import LiuYaoDisk from './components/LiuYaoDisk';
import BaZiDisk from './components/BaZiDisk';
import dayjs from 'dayjs';
import { 
  ConfigProvider, Layout, Typography, Segmented, DatePicker, 
  Radio, InputNumber, Button, Card, Space, Spin, message 
} from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import zhCN from 'antd/locale/zh_CN';
import 'dayjs/locale/zh-cn';
import './index.css';

dayjs.locale('zh-cn');

const { Content } = Layout;
const { Title } = Typography;
// 紫微斗数模块体积较大，按需加载避免常驻主包。
const LazyZiWeiDisk = lazy(() => import('./components/ZiWeiDisk'));
const EMPTY_ZIWEI_SELECTION = Object.freeze({
  activeDecadalKey: '',
  activeYearlyKey: '',
  activeMonthlyKey: '',
  activeDailyKey: ''
});

const createEmptyZiWeiSelection = () => ({ ...EMPTY_ZIWEI_SELECTION });

function buildAiPayloadContext({
  appMode,
  birthYear,
  currentZiWeiTargetDate,
  date,
  gender,
  liuyaoInputMode,
  method,
  ziweiQuickSelection,
  ziweiTargetMode
}) {
  // 不同盘型的额外上下文统一从这里进入，避免在载荷构建器里反向读取界面状态。
  const referenceDateTime = date.format('YYYY-MM-DD HH:mm');

  if (appMode === 'qimen') {
    return {
      referenceDateTime,
      method
    };
  }

  if (appMode === 'daliuren') {
    return {
      referenceDateTime,
      birthYear,
      gender
    };
  }

  if (appMode === 'liuyao') {
    return {
      referenceDateTime,
      birthYear,
      gender,
      liuyaoInputMode
    };
  }

  if (appMode === 'ziwei') {
    return {
      referenceDateTime,
      targetDateTime: currentZiWeiTargetDate.format('YYYY-MM-DD HH:mm'),
      targetMode: ziweiTargetMode,
      quickSelection: ziweiQuickSelection
    };
  }

  return {
    referenceDateTime,
    gender
  };
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
          <h2 className="text-lg font-bold mb-2">出错了</h2>
          <pre className="text-sm overflow-auto">{this.state.error && this.state.error.toString()}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const [date, setDate] = useState(dayjs());
  const [method, setMethod] = useState('chaibu');
  const [appMode, setAppMode] = useState('qimen'); // 'qimen', 'daliuren', 'liuyao', 'bazi', 'ziwei'
  const [birthYear, setBirthYear] = useState(2000);
  const [gender, setGender] = useState('男'); // '男' or '女'
  const [ziweiTargetMode, setZiweiTargetMode] = useState('birth'); // 'birth', 'now' or 'custom'
  const [ziweiTargetDate, setZiweiTargetDate] = useState(dayjs());
  const [ziweiNow, setZiweiNow] = useState(dayjs());
  const [ziweiPanData, setZiweiPanData] = useState(null);
  const [ziweiLoading, setZiweiLoading] = useState(false);
  const [ziweiQuickSelection, setZiweiQuickSelection] = useState(createEmptyZiWeiSelection());
  const [ziweiPendingSelectionSource, setZiweiPendingSelectionSource] = useState('');
  
  // Liu Yao specific states
  const [liuyaoInputMode, setLiuyaoInputMode] = useState('time'); // 'time' or 'manual'
  const [manualYao, setManualYao] = useState([7, 7, 7, 7, 7, 7]); // Default to all 少阳
  const sessionBootstrap = useSessionBootstrap();

  const syncPanData = useMemo(() => {
    try {
      const d = date.toDate();
      if (appMode === 'qimen') {
        return getPaiPan(d, method);
      } else if (appMode === 'daliuren') {
        console.log("Calculating Da Liu Ren for:", d, birthYear, gender);
        return getDaLiuRenPaiPan(d, birthYear || 2000, gender);
      } else if (appMode === 'liuyao') {
        console.log("Calculating Liu Yao for:", d, birthYear, liuyaoInputMode);
        const yaoInput = liuyaoInputMode === 'manual' ? manualYao : null;
        return getLiuYaoPaiPan(d, birthYear || 2000, yaoInput, gender);
      } else if (appMode === 'bazi') {
        console.log("Calculating Ba Zi for:", d, gender);
        // For Ba Zi, the selected date IS the birth date, so use d.getFullYear()
        return getBaZiPaiPan(d, d.getFullYear(), gender);
      }
      return null;
    } catch (e) {
      console.error("Calculation Error:", e);
      return { error: e.message };
    }
  }, [appMode, birthYear, date, gender, liuyaoInputMode, manualYao, method]);

  useEffect(() => {
    if (appMode !== 'ziwei' || ziweiTargetMode !== 'now') {
      return undefined;
    }

    const syncCurrentTargetTime = () => {
      setZiweiNow(dayjs());
    };

    syncCurrentTargetTime();

    // “当前时间”模式需要持续推进，否则目标运限会逐渐过期。
    const timerId = window.setInterval(syncCurrentTargetTime, 60 * 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [appMode, ziweiTargetMode]);

  useEffect(() => {
    if (appMode !== 'ziwei') {
      return undefined;
    }

    let isCancelled = false;

    // 仅在进入紫微模式时加载工具模块，避免把 iztro 打进主入口。
    const loadZiWeiPanData = async () => {
      const birthDate = date.toDate();

      setZiweiLoading(true);

      try {
        const targetDate = resolveZiWeiTargetDateTime(
          ziweiTargetMode,
          ziweiTargetDate,
          ziweiNow,
          date
        ).toDate();

        console.log('[ZiWei] 开始按需加载模块', {
          birthDate: birthDate.toISOString(),
          targetDate: targetDate.toISOString(),
          gender,
          targetMode: ziweiTargetMode
        });

        const { getZiWeiPaiPan } = await import('./utils/ziwei');
        const nextPanData = getZiWeiPaiPan(birthDate, gender, targetDate);

        if (!isCancelled) {
          setZiweiPanData(nextPanData);
        }
      } catch (error) {
        console.error('[ZiWei] 模块按需加载或排盘失败', error);

        if (!isCancelled) {
          setZiweiPanData({
            error: error instanceof Error ? error.message : '紫微斗数模块加载失败'
          });
        }
      } finally {
        if (!isCancelled) {
          setZiweiLoading(false);
        }
      }
    };

    loadZiWeiPanData();

    return () => {
      isCancelled = true;
    };
  }, [appMode, date, gender, ziweiNow, ziweiTargetDate, ziweiTargetMode]);

  useEffect(() => {
    if (appMode !== 'ziwei') {
      return undefined;
    }

    console.log('[ZiWei] 出生信息变更，重置为本命盘');
    setZiweiTargetMode('birth');
    setZiweiQuickSelection(createEmptyZiWeiSelection());
    setZiweiPendingSelectionSource('');

    return undefined;
  }, [appMode, date, gender]);

  const panData = appMode === 'ziwei' ? ziweiPanData : syncPanData;
  const copyBlockedReason = getCopyBlockReason(appMode, ziweiLoading, panData);
  const currentZiWeiTargetDate = resolveZiWeiTargetDateTime(
    ziweiTargetMode,
    ziweiTargetDate,
    ziweiNow,
    date
  );
  const aiPayloadContext = useMemo(() => buildAiPayloadContext({
    appMode,
    birthYear,
    currentZiWeiTargetDate,
    date,
    gender,
    liuyaoInputMode,
    method,
    ziweiQuickSelection,
    ziweiTargetMode
  }), [
    appMode,
    birthYear,
    currentZiWeiTargetDate,
    date,
    gender,
    liuyaoInputMode,
    method,
    ziweiQuickSelection,
    ziweiTargetMode
  ]);
  const aiPayload = useMemo(() => {
    if (!isAiInterpretationSupportedMode(appMode)) {
      return null;
    }

    if (!panData || panData.error) {
      return null;
    }

    try {
      return buildFortunePayload(appMode, panData, aiPayloadContext);
    } catch (error) {
      console.error('[AI] 构建解读载荷失败', error);
      return null;
    }
  }, [aiPayloadContext, appMode, panData]);
  const aiDisabledReason = useMemo(() => buildAiDisabledReason({
    aiPayload,
    appMode,
    panData,
    sessionBootstrap,
    ziweiLoading
  }), [aiPayload, appMode, panData, sessionBootstrap, ziweiLoading]);
  const aiReportFlow = useAiReportFlow({
    enabled: !aiDisabledReason,
    mode: appMode,
    payload: aiPayload
  });

  useEffect(() => {
    if (appMode !== 'ziwei' || !ziweiPendingSelectionSource) {
      return;
    }

    if (!ziweiPanData || ziweiPanData.error) {
      return;
    }

    const derivedSelection = deriveZiWeiFullSelectionState(ziweiPanData, currentZiWeiTargetDate);

    console.log('[ZiWei] 根据目标时间回填选择状态', {
      source: ziweiPendingSelectionSource,
      selection: derivedSelection
    });

    setZiweiQuickSelection({
      activeDecadalKey: derivedSelection.activeDecadalKey,
      activeYearlyKey: derivedSelection.activeYearlyKey,
      activeMonthlyKey: derivedSelection.activeMonthlyKey,
      activeDailyKey: derivedSelection.activeDailyKey
    });
    setZiweiPendingSelectionSource('');
  }, [appMode, currentZiWeiTargetDate, ziweiPanData, ziweiPendingSelectionSource]);

  const handleZiWeiTargetDateChange = (nextTargetDate, source = 'panel', payload = {}) => {
    try {
      if (!dayjs.isDayjs(nextTargetDate) || !nextTargetDate.isValid()) {
        throw new Error('紫微斗数目标时间无效');
      }

      console.log('[ZiWei] 更新目标时间', {
        source,
        payload,
        targetDate: nextTargetDate.format('YYYY-MM-DD HH:mm')
      });

      if (source === 'decadal') {
        setZiweiQuickSelection({
          activeDecadalKey: payload?.key || '',
          activeYearlyKey: '',
          activeMonthlyKey: '',
          activeDailyKey: ''
        });
        setZiweiPendingSelectionSource('');
      } else if (source === 'yearly') {
        setZiweiQuickSelection((previous) => ({
          activeDecadalKey: previous.activeDecadalKey,
          activeYearlyKey: payload?.key || '',
          activeMonthlyKey: '',
          activeDailyKey: ''
        }));
        setZiweiPendingSelectionSource('');
      } else if (source === 'monthly') {
        setZiweiQuickSelection((previous) => ({
          activeDecadalKey: previous.activeDecadalKey,
          activeYearlyKey: previous.activeYearlyKey,
          activeMonthlyKey: payload?.key || '',
          activeDailyKey: ''
        }));
        setZiweiPendingSelectionSource('');
      } else if (source === 'daily') {
        setZiweiQuickSelection((previous) => ({
          activeDecadalKey: previous.activeDecadalKey,
          activeYearlyKey: previous.activeYearlyKey,
          activeMonthlyKey: previous.activeMonthlyKey,
          activeDailyKey: payload?.key || ''
        }));
        setZiweiPendingSelectionSource('');
      } else {
        setZiweiQuickSelection(createEmptyZiWeiSelection());
        setZiweiPendingSelectionSource(source);
      }

      setZiweiTargetMode('custom');
      setZiweiTargetDate(nextTargetDate);
    } catch (error) {
      console.error('[ZiWei] 更新目标时间失败', error);
      message.error(error instanceof Error ? error.message : '紫微斗数目标时间更新失败');
    }
  };

  const handleZiWeiSyncNow = () => {
    const nextNow = dayjs();

    console.log('[ZiWei] 同步当前时间', {
      targetDate: nextNow.format('YYYY-MM-DD HH:mm')
    });

    setZiweiQuickSelection(createEmptyZiWeiSelection());
    setZiweiPendingSelectionSource('now');
    setZiweiTargetMode('now');
    setZiweiNow(nextNow);
  };

  const handleZiWeiResetBirth = () => {
    const birthTargetDate = date.format('YYYY-MM-DD HH:mm');

    console.log('[ZiWei] 切回本命盘', {
      targetDate: birthTargetDate
    });

    setZiweiQuickSelection(createEmptyZiWeiSelection());
    setZiweiPendingSelectionSource('');
    setZiweiTargetMode('birth');
  };

  const formatPanData = () => {
    if (appMode === 'ziwei' && ziweiLoading) {
      return '紫微斗数排盘加载中，请稍后再试';
    }

    if (!panData) {
      return '暂无数据';
    }

    if (panData.error) {
      return `排盘失败：${panData.error}`;
    }

    if (isAiInterpretationSupportedMode(appMode)) {
      // 复制文本与 AI Prompt 复用同一份载荷，避免多盘型维护重复的文本拼接逻辑。
      return aiPayload?.promptText || `${getModeTitle()}载荷暂不可用`;
    }

    return '当前排盘文本暂不可用';
  };

  const copyToClipboard = async () => {
    if (copyBlockedReason) {
      if (!panData || panData?.error) {
        message.error(copyBlockedReason);
        return;
      }

      message.warning(copyBlockedReason);
      return;
    }

    const text = formatPanData();
    try {
      await navigator.clipboard.writeText(text);
      message.success('已复制到剪贴板');
    } catch (err) {
      console.error('复制失败:', err);
      message.error('复制失败，请检查浏览器权限');
    }
  };

  const modeOptions = [
    { label: '奇门遁甲', value: 'qimen' },
    { label: '大六壬', value: 'daliuren' },
    { label: '六爻', value: 'liuyao' },
    { label: '八字', value: 'bazi' },
    { label: '紫微斗数', value: 'ziwei' }
  ];

  const getModeTitle = () => {
    const titles = {
      qimen: '奇门遁甲排盘',
      daliuren: '大六壬排盘',
      liuyao: '六爻排盘',
      bazi: '八字排盘',
      ziwei: '紫微斗数排盘'
    };
    return titles[appMode] + (window.electron ? ' (Electron)' : ' (Web)');
  };

  const renderZiWeiLoading = () => (
    <Card style={{ width: '100%' }}>
      <div style={{ minHeight: 280, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <Spin size="large" />
        <div style={{ color: '#666' }}>紫微斗数模块加载中...</div>
      </div>
    </Card>
  );

  const isCopyDisabled = Boolean(copyBlockedReason);

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#4f46e5',
          borderRadius: 8,
        },
      }}
    >
      <ErrorBoundary>
        <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
          <Content style={{ padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Title level={2} style={{ color: '#312e81', marginBottom: 24 }}>
              {getModeTitle()}
            </Title>
            
            <Card style={{ width: '100%', maxWidth: 800, marginBottom: 24 }}>
              <Space orientation="vertical" size="large" style={{ width: '100%' }}>
                {/* Mode Selection */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <Segmented
                    options={modeOptions}
                    value={appMode}
                    onChange={(value) => {
                      if (appMode !== value) {
                        setAppMode(value);
                      }
                    }}
                    size="large"
                  />
                </div>

                {/* Controls */}
                <Space wrap size="middle" style={{ width: '100%' }}>
                  <Space orientation="vertical" size="small">
                    <span style={{ fontSize: 12, color: '#666' }}>
                      {appMode === 'bazi' || appMode === 'ziwei' ? '出生时间' : '日期时间'}
                    </span>
                    <DatePicker
                      showTime
                      value={date}
                      onChange={(value) => value && setDate(value)}
                      format="YYYY-MM-DD HH:mm"
                      allowClear={false}
                    />
                  </Space>
                  
                  {appMode === 'qimen' ? (
                    <Space orientation="vertical" size="small">
                      <span style={{ fontSize: 12, color: '#666' }}>定局方式</span>
                      <Radio.Group 
                        value={method} 
                        onChange={(e) => setMethod(e.target.value)}
                        optionType="button"
                        buttonStyle="solid"
                      >
                        <Radio.Button value="chaibu">拆补法</Radio.Button>
                        <Radio.Button value="zhirun">置润法</Radio.Button>
                      </Radio.Group>
                    </Space>
                  ) : (
                    <>
                      {appMode !== 'bazi' && appMode !== 'ziwei' && (
                        <Space orientation="vertical" size="small">
                          <span style={{ fontSize: 12, color: '#666' }}>出生年份</span>
                          <InputNumber
                            value={birthYear}
                            onChange={(value) => setBirthYear(value || 2000)}
                            min={1900}
                            max={2100}
                            style={{ width: 100 }}
                          />
                        </Space>
                      )}
                      <Space orientation="vertical" size="small">
                        <span style={{ fontSize: 12, color: '#666' }}>性别</span>
                        <Radio.Group 
                          value={gender} 
                          onChange={(e) => setGender(e.target.value)}
                          optionType="button"
                          buttonStyle="solid"
                        >
                          <Radio.Button value="男">男</Radio.Button>
                          <Radio.Button value="女">女</Radio.Button>
                        </Radio.Group>
                      </Space>
                    </>
                  )}

                  {appMode === 'liuyao' && (
                    <>
                      <Space orientation="vertical" size="small">
                        <span style={{ fontSize: 12, color: '#666' }}>起卦方式</span>
                        <Radio.Group 
                          value={liuyaoInputMode} 
                          onChange={(e) => setLiuyaoInputMode(e.target.value)}
                          optionType="button"
                          buttonStyle="solid"
                        >
                          <Radio.Button value="time">正时起卦</Radio.Button>
                          <Radio.Button value="manual">手动起卦</Radio.Button>
                        </Radio.Group>
                      </Space>
                    </>
                  )}
                  
                  <Button 
                    type="primary" 
                    icon={<CopyOutlined />}
                    onClick={copyToClipboard}
                    disabled={isCopyDisabled}
                    style={{ alignSelf: 'flex-end' }}
                  >
                    复制排盘
                  </Button>
                </Space>

                {/* Manual Yao Selection for Liu Yao */}
                {appMode === 'liuyao' && liuyaoInputMode === 'manual' && (
                  <div>
                    <span style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 8 }}>
                      手动指定六爻 (从下到上)
                    </span>
                    <Space>
                      {[1, 2, 3, 4, 5, 6].map(position => {
                        const idx = position - 1;
                        return (
                          <Space key={position} orientation="vertical" size="small" align="center">
                            <span style={{ fontSize: 12, color: '#999' }}>{position}爻</span>
                            <Radio.Group
                              value={manualYao[idx]}
                              onChange={(e) => {
                                const newYao = [...manualYao];
                                newYao[idx] = e.target.value;
                                setManualYao(newYao);
                              }}
                              size="small"
                            >
                              <Space orientation="vertical" size={0}>
                                <Radio value={9}>老阳</Radio>
                                <Radio value={7}>少阳</Radio>
                                <Radio value={6}>老阴</Radio>
                                <Radio value={8}>少阴</Radio>
                              </Space>
                            </Radio.Group>
                          </Space>
                        );
                      })}
                    </Space>
                  </div>
                )}
              </Space>
            </Card>

            {/* Disk Display */}
            <div style={{ width: '100%', maxWidth: 1200 }}>
              {appMode === 'qimen' ? (
                <>
                  {/* Qimen Info Panel */}
                  <Card title="局象信息" style={{ marginBottom: 24 }}>
                    {panData && !panData.error ? (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, fontSize: 14 }}>
                        <div><span style={{ color: '#666' }}>节气:</span> <strong>{panData.jieQi}</strong></div>
                        <div><span style={{ color: '#666' }}>年柱:</span> <strong>{panData.yearGanZhi}</strong></div>
                        <div><span style={{ color: '#666' }}>月柱:</span> <strong>{panData.monthGanZhi}</strong></div>
                        <div><span style={{ color: '#666' }}>日柱:</span> <strong>{panData.dayGanZhi}</strong></div>
                        <div><span style={{ color: '#666' }}>时柱:</span> <strong>{panData.hourGanZhi}</strong></div>
                        <div><span style={{ color: '#666' }}>元遁:</span> <strong>{panData.type} {panData.yuan}</strong></div>
                        <div><span style={{ color: '#666' }}>局数:</span> <strong>{panData.juNum} 局</strong></div>
                        <div><span style={{ color: '#666' }}>空亡:</span> <strong>{panData.dayXunKong} (日) / {panData.hourXunKong} (时)</strong></div>
                        <div><span style={{ color: '#666' }}>马星:</span> <strong>{panData.maXing}</strong></div>
                        <div><span style={{ color: '#666' }}>值符:</span> <strong>{panData.zhiFuStar}</strong></div>
                        <div><span style={{ color: '#666' }}>值使:</span> <strong>{panData.zhiShiGate}</strong></div>
                        <div><span style={{ color: '#666' }}>旬首:</span> <strong>{panData.xun}</strong></div>
                      </div>
                    ) : (
                      <div style={{ color: '#999', fontStyle: 'italic' }}>暂无数据</div>
                    )}
                  </Card>
                  {/* Qimen Disk */}
                  <QimenDisk data={panData} />
                  {/* Usage Instructions */}
                  <Card title="📖 使用说明" size="small" style={{ marginTop: 24, background: '#f0f5ff' }}>
                    <ol style={{ margin: 0, paddingLeft: 20, lineHeight: 2, color: '#333' }}>
                      <li>修改<strong>性别</strong>和<strong>出生年份</strong>（农历年份），<strong>日期时间保持当前时间不变</strong></li>
                      <li>也可直接使用下方 <strong>AI 解读</strong> 面板生成完整报告</li>
                      <li>点击 <strong>「复制排盘」</strong> 按钮</li>
                      <li>将内容粘贴到 <strong>Gemini 3.0 Pro</strong> 大模型中</li>
                      <li>修改文本中 <strong>【*********你的问题*********】</strong> 为你要问的具体问题</li>
                      <li>发送给大模型，等待分析结果</li>
                    </ol>
                  </Card>
                </>
              ) : appMode === 'liuyao' ? (
                <ErrorBoundary>
                  <LiuYaoDisk data={panData} />
                  {/* Usage Instructions */}
                  <Card title="📖 使用说明" size="small" style={{ marginTop: 24, background: '#f0f5ff' }}>
                    <ol style={{ margin: 0, paddingLeft: 20, lineHeight: 2, color: '#333' }}>
                      <li>修改<strong>性别</strong>和<strong>出生年份</strong>（农历年份），<strong>日期时间保持当前时间不变</strong></li>
                      <li>选择起卦方式：正时起卦或手动起卦</li>
                      <li>也可直接使用下方 <strong>AI 解读</strong> 面板生成完整报告</li>
                      <li>点击 <strong>「复制排盘」</strong> 按钮</li>
                      <li>将内容粘贴到 <strong>Gemini 3.0 Pro</strong> 大模型中</li>
                      <li>修改文本中 <strong>【*********你的问题*********】</strong> 为你要问的具体问题</li>
                      <li>发送给大模型，等待分析结果</li>
                    </ol>
                  </Card>
                </ErrorBoundary>
              ) : appMode === 'ziwei' ? (
                <ErrorBoundary>
                  {ziweiLoading && renderZiWeiLoading()}
                  {!ziweiLoading && (
                    <Suspense fallback={renderZiWeiLoading()}>
                      <LazyZiWeiDisk
                        data={panData}
                        targetDate={currentZiWeiTargetDate}
                        targetMode={ziweiTargetMode}
                        quickSelection={ziweiQuickSelection}
                        onTargetDateChange={handleZiWeiTargetDateChange}
                        onSyncCurrent={handleZiWeiSyncNow}
                        onResetBirth={handleZiWeiResetBirth}
                      />
                    </Suspense>
                  )}
                  <Card title="📖 使用说明" size="small" style={{ marginTop: 24, background: '#f6ffed' }}>
                    <ol style={{ margin: 0, paddingLeft: 20, lineHeight: 2, color: '#333' }}>
                      <li><strong>⚠️ 注意：</strong>紫微斗数排盘需要修改<strong>日期时间为出生时间</strong>（阳历）</li>
                      <li>选择正确的<strong>性别</strong></li>
                      <li>默认先显示<strong>本命盘</strong>，此时<strong>大限 / 流年 / 流月 / 流日</strong>均未选中</li>
                      <li>在命盘下方按顺序点击<strong>大限 → 流年 → 流月 → 流日</strong>切换目标运限，未选上一级前下一级不会开放</li>
                      <li>如需精确时点，可直接修改底部的<strong>目标时间</strong></li>
                      <li>也可直接使用下方 <strong>AI 解读</strong> 面板生成完整报告</li>
                      <li>点击 <strong>「复制排盘」</strong> 按钮</li>
                      <li>将内容粘贴到大模型中</li>
                      <li>修改文本中 <strong>【*********你的问题*********】</strong> 为具体问题</li>
                      <li>结合命宫、身宫、十二宫和目标运限进行分析</li>
                    </ol>
                  </Card>
                </ErrorBoundary>
              ) : appMode === 'bazi' ? (
                <ErrorBoundary>
                  <BaZiDisk data={panData} />
                  {/* Usage Instructions */}
                  <Card title="📖 使用说明" size="small" style={{ marginTop: 24, background: '#fff7e6' }}>
                    <ol style={{ margin: 0, paddingLeft: 20, lineHeight: 2, color: '#333' }}>
                      <li><strong>⚠️ 注意：</strong>八字排盘需要修改<strong>日期时间为出生时间</strong>（阳历）</li>
                      <li>选择正确的<strong>性别</strong></li>
                      <li>可直接使用下方 <strong>AI 解读</strong> 面板生成完整报告</li>
                      <li>如需自行调试 Prompt，仍可点击 <strong>「复制排盘」</strong> 按钮</li>
                      <li>开发联调默认由后端直连 <strong>AI Studio API</strong>，生产再切换到 <strong>Vertex AI</strong></li>
                    </ol>
                  </Card>
                </ErrorBoundary>
              ) : (
                <ErrorBoundary>
                  <DaLiuRenDisk data={panData} />
                  {/* Usage Instructions */}
                  <Card title="📖 使用说明" size="small" style={{ marginTop: 24, background: '#f0f5ff' }}>
                    <ol style={{ margin: 0, paddingLeft: 20, lineHeight: 2, color: '#333' }}>
                      <li>修改<strong>性别</strong>和<strong>出生年份</strong>（农历年份），<strong>日期时间保持当前时间不变</strong></li>
                      <li>也可直接使用下方 <strong>AI 解读</strong> 面板生成完整报告</li>
                      <li>点击 <strong>「复制排盘」</strong> 按钮</li>
                      <li>将内容粘贴到 <strong>Gemini 3.0 Pro</strong> 大模型中</li>
                      <li>修改文本中 <strong>【*********你的问题*********】</strong> 为你要问的具体问题</li>
                      <li>发送给大模型，等待分析结果</li>
                    </ol>
                  </Card>
                </ErrorBoundary>
              )}
              {isAiInterpretationSupportedMode(appMode) ? (
                <ErrorBoundary>
                  <AiInterpretationSection
                    disabledReason={aiDisabledReason}
                    flow={aiReportFlow}
                  />
                </ErrorBoundary>
              ) : null}
            </div>
          </Content>
        </Layout>
      </ErrorBoundary>
    </ConfigProvider>
  );
}

export default App;
