import React, { useState, useEffect } from 'react';
import { getPaiPan } from './utils/qimen';
import { getDaLiuRenPaiPan } from './utils/daliuren';
import { getLiuYaoPaiPan } from './utils/liuyao';
import { getBaZiPaiPan } from './utils/bazi';
import QimenDisk from './components/QimenDisk';
import DaLiuRenDisk from './components/DaLiuRenDisk';
import LiuYaoDisk from './components/LiuYaoDisk';
import BaZiDisk from './components/BaZiDisk';
import dayjs from 'dayjs';
import './index.css';

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
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DDTHH:mm'));
  const [method, setMethod] = useState('chaibu');
  const [appMode, setAppMode] = useState('qimen'); // 'qimen', 'daliuren', 'liuyao', 'bazi'
  const [birthYear, setBirthYear] = useState('2000');
  const [gender, setGender] = useState('男'); // '男' or '女'
  const [panData, setPanData] = useState(null);
  
  // Liu Yao specific states
  const [liuyaoInputMode, setLiuyaoInputMode] = useState('time'); // 'time' or 'manual'
  const [manualYao, setManualYao] = useState([7, 7, 7, 7, 7, 7]); // Default to all 少阳

  useEffect(() => {
    calculate();
  }, [date, method, appMode, birthYear, gender, liuyaoInputMode, manualYao]);

  const calculate = () => {
    try {
      const d = new Date(date);
      let data;
      if (appMode === 'qimen') {
        data = getPaiPan(d, method);
      } else if (appMode === 'daliuren') {
        console.log("Calculating Da Liu Ren for:", d, birthYear, gender);
        data = getDaLiuRenPaiPan(d, parseInt(birthYear) || 2000, gender);
      } else if (appMode === 'liuyao') {
        console.log("Calculating Liu Yao for:", d, birthYear, liuyaoInputMode);
        const yaoInput = liuyaoInputMode === 'manual' ? manualYao : null;
        data = getLiuYaoPaiPan(d, parseInt(birthYear) || 2000, yaoInput);
      } else if (appMode === 'bazi') {
        console.log("Calculating Ba Zi for:", d, gender);
        // For Ba Zi, the selected date IS the birth date, so use d.getFullYear()
        data = getBaZiPaiPan(d, d.getFullYear(), gender);
      }
      setPanData(data);
    } catch (e) {
      console.error("Calculation Error:", e);
      setPanData({ error: e.message });
    }
  };

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
      let text = '你是一个精通六爻的高手，请基于下面的排盘信息，分析一下【*********你的问题*********】，排盘信息如下：\n\n';
      text += '========== 六爻排盘 ==========\n\n';
      text += `求测年命: ${panData.benMing} (${gender})  行年: ${panData.xingNian}\n`;
      text += `日期: ${panData.dateStr}\n`;
      text += `干支: ${panData.ganZhi.year} ${panData.ganZhi.month} ${panData.ganZhi.day} ${panData.ganZhi.hour}\n`;
      text += `空亡: ${panData.dayXunKong} (日) / ${panData.hourXunKong} (时)\n`;
      text += `动爻: ${panData.movingYao}爻\n\n`;
      
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
      let text = '你是一个精通四柱八字的高手，现在是2025年年底，请分别用梁湘润、盲派、子平命理等八字理论对下面的八字命盘进行推算，分析一下命主的整体命运情况，考虑身强身弱，分析大运流年和十神关系，体用平衡，分析一下命格的成就如何，分析一下人生的关键节点，分析一下【2026】以及【2027】两年的流年，注意逻辑合理，综合各种信息文本判断准确的关系模型，交叉验证，多次迭代后输出最终正确结果，八字命盘信息如下：\n\n';
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
      alert('已复制到剪贴板');
    } catch (err) {
      console.error('复制失败:', err);
      alert('复制失败，请检查浏览器权限');
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-100 p-[30px] flex flex-col items-center font-sans text-gray-800">
        <h1 className="text-3xl font-bold mb-6 text-indigo-900">
          {appMode === 'qimen' ? '奇门遁甲排盘' : appMode === 'daliuren' ? '大六壬排盘' : appMode === 'liuyao' ? '六爻排盘' : '八字排盘'} {window.electron ? '(Electron)' : '(Web)'}
        </h1>
        
        <div className="bg-white p-6 rounded-xl shadow-md mb-8 w-full max-w-2xl flex flex-col gap-6">
          {/* Mode Selection */}
          <div className="flex gap-4 justify-center border-b pb-4">
            <button 
              onClick={() => { 
                if (appMode !== 'qimen') {
                  setAppMode('qimen'); 
                  setPanData(null); 
                }
              }}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${
                appMode === 'qimen' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              奇门遁甲
            </button>
            <button 
              onClick={() => { 
                if (appMode !== 'daliuren') {
                  setAppMode('daliuren'); 
                  setPanData(null); 
                }
              }}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${
                appMode === 'daliuren' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              大六壬
            </button>
            <button 
              onClick={() => { 
                if (appMode !== 'liuyao') {
                  setAppMode('liuyao'); 
                  setPanData(null); 
                }
              }}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${
                appMode === 'liuyao' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              六爻
            </button>
            <button 
              onClick={() => { 
                if (appMode !== 'bazi') {
                  setAppMode('bazi'); 
                  setPanData(null); 
                }
              }}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${
                appMode === 'bazi' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              八字
            </button>
          </div>

          <div className="flex flex-wrap gap-6 items-end">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-600">日期时间</label>
              <input 
                type="datetime-local" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            {appMode === 'qimen' ? (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-600">定局方式</label>
                <div className="flex gap-4 bg-gray-50 p-2 rounded border border-gray-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="method" 
                      value="chaibu" 
                      checked={method === 'chaibu'} 
                      onChange={() => setMethod('chaibu')}
                      className="text-indigo-600"
                    />
                    <span>拆补法</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="method" 
                      value="zhirun" 
                      checked={method === 'zhirun'} 
                      onChange={() => setMethod('zhirun')}
                      className="text-indigo-600"
                    />
                    <span>置润法</span>
                  </label>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-600">求测人信息</label>
                  <div className="flex gap-2 items-center">
                    {appMode !== 'bazi' && (
                      <input 
                        type="number" 
                        value={birthYear} 
                        onChange={(e) => setBirthYear(e.target.value)}
                        placeholder="例如: 2000"
                        className="border border-gray-300 rounded px-3 py-2 w-24 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    )}
                    <div className="flex bg-gray-50 rounded border border-gray-200 p-1">
                      <button
                        onClick={() => setGender('男')}
                        className={`px-3 py-1 rounded text-sm transition-colors ${gender === '男' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-200'}`}
                      >
                        男
                      </button>
                      <button
                        onClick={() => setGender('女')}
                        className={`px-3 py-1 rounded text-sm transition-colors ${gender === '女' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-200'}`}

                      >
                        女
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            )}
            {appMode === 'liuyao' && (
                  <>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-600">起卦方式</label>
                      <div className="flex gap-4 bg-gray-50 p-2 rounded border border-gray-200">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="radio" 
                            name="liuyaoMode" 
                            value="time" 
                            checked={liuyaoInputMode === 'time'} 
                            onChange={() => setLiuyaoInputMode('time')}
                            className="text-indigo-600"
                          />
                          <span>正时起卦</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="radio" 
                            name="liuyaoMode" 
                            value="manual" 
                            checked={liuyaoInputMode === 'manual'} 
                            onChange={() => setLiuyaoInputMode('manual')}
                            className="text-indigo-600"
                          />
                          <span>手动起卦</span>
                        </label>
                      </div>
                    </div>
                    
                    {liuyaoInputMode === 'manual' && (
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-600">手动指定六爻 (从下到上)</label>
                        <div className="grid grid-cols-6 gap-2">
                          {[1, 2, 3, 4, 5, 6].map(position => {
                            const idx = position - 1;
                            const yaoNames = {9: '老阳', 7: '少阳', 6: '老阴', 8: '少阴'};
                            return (
                              <div key={position} className="flex flex-col gap-1">
                                <span className="text-xs text-gray-500 text-center">{position}爻</span>
                                <select
                                  value={manualYao[idx]}
                                  onChange={(e) => {
                                    const newYao = [...manualYao];
                                    newYao[idx] = parseInt(e.target.value);
                                    setManualYao(newYao);
                                  }}
                                  className="text-xs border border-gray-300 rounded px-1 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                  <option value={9}>老阳</option>
                                  <option value={7}>少阳</option>
                                  <option value={6}>老阴</option>
                                  <option value={8}>少阴</option>
                                </select>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}

            
            <button 
              onClick={copyToClipboard}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded font-medium transition-colors"
            >
              复制排盘
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-8 items-center w-full max-w-5xl">
          {appMode === 'qimen' ? (
            <>
              {/* Qimen Info Panel */}
              <div className="w-full bg-white p-6 rounded-xl shadow-md space-y-4">
                <h2 className="text-xl font-semibold border-b pb-2">局象信息</h2>
                {panData && !panData.error ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">节气:</span>
                      <span className="font-medium">{panData.jieQi}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">年柱:</span>
                      <span className="font-medium">{panData.yearGanZhi}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">月柱:</span>
                      <span className="font-medium">{panData.monthGanZhi}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">日柱:</span>
                      <span className="font-medium">{panData.dayGanZhi}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">时柱:</span>
                      <span className="font-medium">{panData.hourGanZhi}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">元遁:</span>
                      <span className="font-medium">{panData.type} {panData.yuan}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">局数:</span>
                      <span className="font-medium">{panData.juNum} 局</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">空亡:</span>
                      <span className="font-medium">{panData.dayXunKong} (日) / {panData.hourXunKong} (时)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">马星:</span>
                      <span className="font-medium">{panData.maXing}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">值符:</span>
                      <span className="font-medium">{panData.zhiFuStar}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">值使:</span>
                      <span className="font-medium">{panData.zhiShiGate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">旬首:</span>
                      <span className="font-medium">{panData.xun}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400 italic">暂无数据</div>
                )}
              </div>

              {/* Qimen Disk */}
              <div className="flex-1">
                <QimenDisk data={panData} />
              </div>
            </>
          ) : appMode === 'liuyao' ? (
            /* Liu Yao Display */
            <div className="w-full">
              <ErrorBoundary>
                <LiuYaoDisk data={panData} />
              </ErrorBoundary>
            </div>
          ) : appMode === 'bazi' ? (
            /* Ba Zi Display */
            <div className="w-full">
              <ErrorBoundary>
                <BaZiDisk data={panData} />
              </ErrorBoundary>
            </div>
          ) : (
            /* Da Liu Ren Display */
            <div className="w-full">
              <ErrorBoundary>
                <DaLiuRenDisk data={panData} />
              </ErrorBoundary>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
