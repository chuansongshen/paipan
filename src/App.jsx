import React, { useMemo, useState } from 'react';
import { getPaiPan } from './utils/qimen';
import { getDaLiuRenPaiPan } from './utils/daliuren';
import { getLiuYaoPaiPan } from './utils/liuyao';
import { getBaZiPaiPan } from './utils/bazi';
import QimenDisk from './components/QimenDisk';
import DaLiuRenDisk from './components/DaLiuRenDisk';
import LiuYaoDisk from './components/LiuYaoDisk';
import BaZiDisk from './components/BaZiDisk';
import dayjs from 'dayjs';
import { 
  ConfigProvider, Layout, Typography, Segmented, DatePicker, 
  Radio, InputNumber, Button, Card, Space, message 
} from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import zhCN from 'antd/locale/zh_CN';
import 'dayjs/locale/zh-cn';
import './index.css';

dayjs.locale('zh-cn');

const { Content } = Layout;
const { Title } = Typography;

const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const getZhiIdx = (z) => ZHI.indexOf(z);

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
  const [appMode, setAppMode] = useState('qimen'); // 'qimen', 'daliuren', 'liuyao', 'bazi'
  const [birthYear, setBirthYear] = useState(2000);
  const [gender, setGender] = useState('男'); // '男' or '女'
  
  // Liu Yao specific states
  const [liuyaoInputMode, setLiuyaoInputMode] = useState('time'); // 'time' or 'manual'
  const [manualYao, setManualYao] = useState([7, 7, 7, 7, 7, 7]); // Default to all 少阳

  const panData = useMemo(() => {
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

  const formatPanData = () => {
    if (!panData || panData.error) return '暂无数据';
    
    if (appMode === 'qimen') {
      const PALACE_MAP = [
        { id: 4, name: '巽宫' }, { id: 9, name: '离宫' }, { id: 2, name: '坤宫' },
        { id: 3, name: '震宫' }, { id: 5, name: '中宫' }, { id: 7, name: '兑宫' },
        { id: 8, name: '艮宫' }, { id: 1, name: '坎宫' }, { id: 6, name: '乾宫' }
      ];
      
      let text = '你是一个精通奇门遁甲的高手，请基于下面的排盘信息，分析一下【*********你的问题*********】，排盘信息如下：\n\n';
      text += '========== 奇门遁甲排盘 ==========\n\n';
      text += `【局象信息】\n`;
      text += `节气：${panData.jieQi}\n`;
      text += `年柱：${panData.yearGanZhi}\n`;
      text += `月柱：${panData.monthGanZhi}\n`;
      text += `日柱：${panData.dayGanZhi}\n`;
      text += `时柱：${panData.hourGanZhi}\n`;
      text += `元遁：${panData.type} ${panData.yuan}\n`;
      text += `局数：${panData.juNum} 局\n`;
      text += `空亡：${panData.dayXunKong} (日) / ${panData.hourXunKong} (时)\n`;
      text += `马星：${panData.maXing}\n`;
      text += `值符：${panData.zhiFuStar}\n`;
      text += `值使：${panData.zhiShiGate}\n`;
      text += `旬首：${panData.xun}\n\n`;
      
      text += `【九宫信息】\n`;
      PALACE_MAP.forEach(palace => {
        const p = palace.id;
        text += `\n【${palace.name}】\n`;
        text += `  八神：${panData.shenPan[p] || '-'}\n`;
        text += `  九星：${panData.tianPan[p] || '-'}\n`;
        text += `  八门：${panData.renPan[p] || '-'}\n`;
        text += `  天盘干：${panData.tianPanStems[p] || '-'}\n`;
        text += `  地盘干：${panData.diPan[p] || '-'}\n`;
        text += `  暗干：${panData.anGan[p] || '-'}\n`;
        
        if (panData.maXingPalace === p) {
          text += `  ★ 马星所在宫位\n`;
        }
        if (panData.kongWangPalaces.includes(p)) {
          text += `  ⭕️ 空亡宫位\n`;
        }
      });
      
      text += '\n=================================';
      return text;
    } else if (appMode === 'daliuren') {
      // Da Liu Ren Text Format
      let text = '你是一个精通大六壬的高手，请基于下面的排盘信息，分析一下【*********你的问题*********】，排盘信息如下：\n\n';
      text += '========== 大六壬排盘 ==========\n\n';
      text += `求测年命: ${panData.birthYearGanZhi || birthYear} (${gender})  行年: ${panData.xingNian}\n`;
      text += `日期: ${panData.dateStr}\n`;
      text += `四柱: ${panData.ganZhi.year} ${panData.ganZhi.month} ${panData.ganZhi.day} ${panData.ganZhi.hour}\n`;
      text += `月将: ${panData.yueJiang}  空亡: ${panData.kongWang}\n\n`;
      
      text += `【三传】\n`;
      text += `初传: ${panData.sanChuan[0]?.gan}${panData.sanChuan[0]?.zhi} (${panData.tianJiang?.[panData.sanChuan[0]?.zhi] || '-'})\n`;
      text += `中传: ${panData.sanChuan[1]?.gan}${panData.sanChuan[1]?.zhi} (${panData.tianJiang?.[panData.sanChuan[1]?.zhi] || '-'})\n`;
      text += `末传: ${panData.sanChuan[2]?.gan}${panData.sanChuan[2]?.zhi} (${panData.tianJiang?.[panData.sanChuan[2]?.zhi] || '-'})\n\n`;
      
      text += `【四课】\n`;
      // 神将行
      text += `${panData.tianJiang?.[panData.siKe.fourth.zhi] || '-'} ${panData.tianJiang?.[panData.siKe.third.zhi] || '-'} ${panData.tianJiang?.[panData.siKe.second.zhi] || '-'} ${panData.tianJiang?.[panData.siKe.first.zhi] || '-'}\n`;
      // 调整顺序：zhi在上，gan在下
      text += `${panData.siKe.fourth.zhi} ${panData.siKe.third.zhi} ${panData.siKe.second.zhi} ${panData.siKe.first.zhi}\n`;
      text += `${panData.siKe.fourth.gan} ${panData.siKe.third.gan} ${panData.siKe.second.gan} ${panData.siKe.first.gan}\n\n`;
      
      text += `【天地盘】\n`;
      // Output tian pan, di pan, and tian jiang in a table format
      text += `地支:   ${ZHI.join('  ')}\n`;
      text += `天盘:   ${panData.tianPan.map(z => z.padEnd(2, ' ')).join('  ')}\n`;
      text += `贵神:   ${ZHI.map(z => (panData.tianJiang[panData.tianPan[getZhiIdx(z)]] || '').slice(0, 2).padEnd(2, ' ')).join('  ')}\n\n`;
      
      // Add Shen Sha Text
      if (panData.shenShaText) {
        text += `【神煞】\n`;
        text += panData.shenShaText + '\n';
      }
      
      // Add Zhi Zhi
      if (panData.zhiZhi) {
        text += `【大六壬直指】\n`;
        text += panData.zhiZhi + '\n';
      }
      
      text += '\n=================================';
      return text;
    } else if (appMode === 'liuyao') {
      // Liu Yao Text Format
      const movingText = panData.movingYaos && panData.movingYaos.length > 0
        ? panData.movingYaos.join('、')
        : panData.movingYao;
      let text = '你是一个精通六爻的高手，请基于下面的排盘信息，分析一下【*********你的问题*********】，排盘信息如下：\n\n';
      text += '========== 六爻排盘 ==========\n\n';
      text += `求测年命: ${panData.benMing} (${gender})  行年: ${panData.xingNian}\n`;
      text += `日期: ${panData.dateStr}\n`;
      text += `干支: ${panData.ganZhi.year} ${panData.ganZhi.month} ${panData.ganZhi.day} ${panData.ganZhi.hour}\n`;
      text += `空亡: ${panData.dayXunKong} (日) / ${panData.hourXunKong} (时)\n`;
      text += `动爻: ${movingText}爻\n\n`;
      
      text += `【本卦】 ${panData.benGua.name}\n`;
      // Add simple representation of lines
      panData.benGua.yaoData.slice().reverse().forEach(yao => {
         const isMoving = yao.position === panData.movingYao;
         text += `${yao.position}爻: ${yao.stem}${yao.branch} (${yao.wuxing}) ${yao.yinYang === 1 ? '—' : '--'} ${isMoving ? '○ 动爻' : ''}\n`;
      });
      text += '\n';
      
      // Add Ben Gua Yao Ci
      if (panData.benGua.yaoCi) {
        text += `【本卦爻辞】\n`;
        panData.benGua.yaoCi.slice().reverse().forEach((ci, idx) => {
          text += `${panData.benGua.yaoData[5-idx].position}爻：${ci}\n`;
        });
        text += '\n';
      }
      
      if (panData.bianGua) {
        text += `【变卦】 ${panData.bianGua.name}\n`;
        panData.bianGua.yaoData.slice().reverse().forEach(yao => {
           text += `${yao.position}爻: ${yao.stem}${yao.branch} (${yao.wuxing}) ${yao.yinYang === 1 ? '—' : '--'}\n`;
        });
        text += '\n';
        
        // Add Bian Gua Yao Ci
        if (panData.bianGua.yaoCi) {
          text += `【变卦爻辞】\n`;
          panData.bianGua.yaoCi.slice().reverse().forEach((ci, idx) => {
            text += `${panData.bianGua.yaoData[5-idx].position}爻：${ci}\n`;
          });
          text += '\n';
        }
      }
      
      text += `【神煞】\n`;
      Object.entries(panData.shenSha).forEach(([key, value]) => {
        text += `${key}: ${value || '-'}\n`;
      });
      
      text += '\n=================================';
      return text;
    } else if (appMode === 'bazi') {
      const currentYear = dayjs().year();
      let text = `你是一个精通四柱八字的高手，现在是${currentYear}年，请分别用梁湘润、盲派、子平命理等八字理论对下面的八字命盘进行推算，分析一下命主的整体命运情况，考虑身强身弱，分析大运流年和十神关系，体用平衡，分析一下命格的成就如何，分析一下人生的关键节点，分析一下【${currentYear}】以及【${currentYear + 1}】两年的流年，注意逻辑合理，综合各种信息文本判断准确的关系模型，交叉验证，多次迭代后输出最终正确结果，八字命盘信息如下：\n\n`;
      text += '========== 八字排盘 ==========\n\n';
      text += `性别: ${panData.性别}\n`;
      text += `阳历: ${panData.阳历}\n`;
      text += `农历: ${panData.农历}\n`;
      text += `生肖: ${panData.生肖}\n\n`;
      
      text += `【八字】\n${panData.八字}\n`;
      text += `日主: ${panData.日主}\n\n`;
      
      text += `【四柱】\n`;
      const pillars = [
        { name: '年柱', data: panData.年柱 },
        { name: '月柱', data: panData.月柱 },
        { name: '日柱', data: panData.日柱 },
        { name: '时柱', data: panData.时柱 }
      ];
      
      pillars.forEach(p => {
        text += `${p.name}: ${p.data.干支}\n`;
        text += `  天干: ${p.data.天干.天干} (${p.data.天干.五行} ${p.data.天干.阴阳})`;
        if (p.data.天干.十神) text += ` [${p.data.天干.十神}]`;
        text += `\n`;
        text += `  地支: ${p.data.地支.地支} (${p.data.地支.五行} ${p.data.地支.阴阳})\n`;
        if (p.data.地支.藏干) {
          text += `  藏干: `;
          const cangGan = Object.entries(p.data.地支.藏干).map(([type, info]) => 
            `${type}${info.天干}[${info.十神}]`
          ).join(' ');
          text += cangGan + '\n';
        }
        text += `  纳音: ${p.data.纳音}\n`;
        if (p.data.神煞 && p.data.神煞.length > 0) {
          text += `  神煞: ${p.data.神煞.join(' ')}\n`;
        }
        text += `\n`;
      });
      
      if (panData.刑冲合会 && panData.刑冲合会.length > 0) {
        text += `【刑冲合会】\n${panData.刑冲合会.join(' ')}\n\n`;
      }
      
      text += `【其他】\n`;
      text += `胎元: ${panData.胎元}  命宫:${panData.命宫}  身宫: ${panData.身宫}\n\n`;
      
      if (panData.大运) {
        text += `【大运】(起运年龄: ${panData.大运.起运年龄}岁)\n`;
        panData.大运.大运.forEach(dy => {
          text += `${dy.干支} (${dy.开始年份}-${dy.结束年份}, ${dy.开始年龄}-${dy.结束年龄}岁) `;
          text += `天干[${dy.天干十神}] `;
          const hidden = dy.地支藏干.map((gan, i) => `${gan}(${dy.地支十神[i]})`).join(' ');
          text += `地支藏干[${hidden}]\n`;
        });
      }
      
      text += '\n=================================';
      return text;
    } else {
      return '大六壬排盘 - Formatted text for copy';
    }
  };

  const copyToClipboard = async () => {
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
    { label: '八字', value: 'bazi' }
  ];

  const getModeTitle = () => {
    const titles = {
      qimen: '奇门遁甲排盘',
      daliuren: '大六壬排盘',
      liuyao: '六爻排盘',
      bazi: '八字排盘'
    };
    return titles[appMode] + (window.electron ? ' (Electron)' : ' (Web)');
  };

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
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
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
                  <Space direction="vertical" size="small">
                    <span style={{ fontSize: 12, color: '#666' }}>日期时间</span>
                    <DatePicker
                      showTime
                      value={date}
                      onChange={(value) => value && setDate(value)}
                      format="YYYY-MM-DD HH:mm"
                      allowClear={false}
                    />
                  </Space>
                  
                  {appMode === 'qimen' ? (
                    <Space direction="vertical" size="small">
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
                      {appMode !== 'bazi' && (
                        <Space direction="vertical" size="small">
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
                      <Space direction="vertical" size="small">
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
                      <Space direction="vertical" size="small">
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
                          <Space key={position} direction="vertical" size="small" align="center">
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
                              <Space direction="vertical" size={0}>
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
                      <li>点击 <strong>「复制排盘」</strong> 按钮</li>
                      <li>将内容粘贴到 <strong>Gemini 3.0 Pro</strong> 大模型中</li>
                      <li>修改文本中 <strong>【*********你的问题*********】</strong> 为你要问的具体问题</li>
                      <li>发送给大模型，等待分析结果</li>
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
                      <li>点击 <strong>「复制排盘」</strong> 按钮</li>
                      <li>将内容粘贴到 <strong>Gemini 3.0 Pro</strong> 大模型中</li>
                      <li>修改文本中需要分析的具体内容</li>
                      <li>发送给大模型，等待分析结果</li>
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
                      <li>点击 <strong>「复制排盘」</strong> 按钮</li>
                      <li>将内容粘贴到 <strong>Gemini 3.0 Pro</strong> 大模型中</li>
                      <li>修改文本中 <strong>【*********你的问题*********】</strong> 为你要问的具体问题</li>
                      <li>发送给大模型，等待分析结果</li>
                    </ol>
                  </Card>
                </ErrorBoundary>
              )}
            </div>
          </Content>
        </Layout>
      </ErrorBoundary>
    </ConfigProvider>
  );
}

export default App;
