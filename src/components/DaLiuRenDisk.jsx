import React from 'react';

const DaLiuRenDisk = ({ data }) => {
  console.log("DaLiuRenDisk received data:", data);
  if (!data) return <div className="text-gray-500">暂无数据</div>;
  if (data.error) return <div className="text-red-500">错误: {data.error}</div>;

  const {
    dateStr, ganZhi = {}, yueJiang, kongWang,
    sanChuan = [], siKe = { first:{}, second:{}, third:{}, fourth:{} }, tianPan = [], tianJiang = {},
    shenSha = {}, shenShaText, shenShaDistribution, zhiZhi, birthYear, birthYearGanZhi, gender, xingNian
  } = data;

  // Earth Branches for the grid (Standard 3x3 or 4x4 representation? Usually 12 squares around)
  // 巳 午 未 申
  // 辰      酉
  // 卯      戌
  // 寅 丑 子 亥
  const EARTH_ORDER = [
    '巳', '午', '未', '申',
    '辰',           '酉',
    '卯',           '戌',
    '寅', '丑', '子', '亥'
  ];
  
  // Map Earth Branch to its Heaven Branch and General
  const getPalaceData = (earthBranch) => {
    // Find index of earthBranch in standard ZHI array (Zi=0)
    const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    const idx = ZHI.indexOf(earthBranch);
    if (idx === -1 || !tianPan) return { heaven: '?', general: '?' };
    
    const heaven = tianPan[idx];
    const general = tianJiang ? tianJiang[heaven] : '?';
    return { heaven, general };
  };

  const renderPalace = (earthBranch) => {
    const { heaven, general } = getPalaceData(earthBranch);
    return (
      <div className="border border-gray-300 p-2 flex flex-col items-center justify-center min-h-[80px] bg-white rounded shadow-sm">
        <div className="text-xs text-gray-500">{general || '-'}</div>
        <div className="text-lg font-bold text-indigo-700">{heaven || '-'}</div>
        <div className="text-sm text-gray-400 mt-1">{earthBranch}</div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 p-4 bg-gray-50 rounded-xl">
      {/* Header Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-4 rounded-lg shadow-sm">
        <div>
          <span className="text-gray-500 text-sm">日期:</span>
          <span className="font-medium ml-2">{dateStr}</span>
        </div>
        <div>
          <span className="text-gray-500 text-sm">四柱:</span>
          <span className="font-medium ml-2">{ganZhi.year} {ganZhi.month} {ganZhi.day} {ganZhi.hour}</span>
        </div>
        <div>
          <span className="text-gray-500 text-sm">月将:</span>
          <span className="font-medium ml-2">{yueJiang}</span>
        </div>
        <div>
          <span className="text-gray-500 text-sm">空亡:</span>
          <span className="font-medium ml-2">{kongWang}</span>
        </div>
        <div>
          <span className="text-gray-500 text-sm">年命:</span>
          <span className="font-medium ml-2">{birthYearGanZhi || birthYear} ({gender})</span>
        </div>
        <div>
          <span className="text-gray-500 text-sm">行年:</span>
          <span className="font-medium ml-2">{xingNian || '-'}</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Column: San Chuan & Si Ke */}
        <div className="flex flex-col gap-6 w-full md:w-1/3">
          {/* San Chuan */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-bold mb-3 text-indigo-900 border-b pb-2">三传</h3>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">初传</span>
                <span className="font-bold text-lg">
                  <span className="text-gray-600 text-sm mr-1">{sanChuan[0]?.gan}</span>
                  {sanChuan[0]?.zhi}
                </span>
                <span className="text-xs text-gray-400">{tianJiang[sanChuan[0]?.zhi]}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">中传</span>
                <span className="font-bold text-lg">
                  <span className="text-gray-600 text-sm mr-1">{sanChuan[1]?.gan}</span>
                  {sanChuan[1]?.zhi}
                </span>
                <span className="text-xs text-gray-400">{tianJiang[sanChuan[1]?.zhi]}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">末传</span>
                <span className="font-bold text-lg">
                  <span className="text-gray-600 text-sm mr-1">{sanChuan[2]?.gan}</span>
                  {sanChuan[2]?.zhi}
                </span>
                <span className="text-xs text-gray-400">{tianJiang[sanChuan[2]?.zhi]}</span>
              </div>
            </div>
          </div>

          {/* Si Ke */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-bold mb-3 text-indigo-900 border-b pb-2">四课</h3>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="flex flex-col gap-1">
                <div className="text-xs text-gray-400">第四课</div>
                <div className="text-xs text-purple-600">{tianJiang[siKe.fourth.zhi] || '-'}</div>
                <div className="font-bold text-lg">{siKe.fourth.zhi}</div>
                <div className="font-medium text-gray-600">{siKe.fourth.gan}</div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-xs text-gray-400">第三课</div>
                <div className="text-xs text-purple-600">{tianJiang[siKe.third.zhi] || '-'}</div>
                <div className="font-bold text-lg">{siKe.third.zhi}</div>
                <div className="font-medium text-gray-600">{siKe.third.gan}</div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-xs text-gray-400">第二课</div>
                <div className="text-xs text-purple-600">{tianJiang[siKe.second.zhi] || '-'}</div>
                <div className="font-bold text-lg">{siKe.second.zhi}</div>
                <div className="font-medium text-gray-600">{siKe.second.gan}</div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-xs text-gray-400">第一课</div>
                <div className="text-xs text-purple-600">{tianJiang[siKe.first.zhi] || '-'}</div>
                <div className="font-bold text-lg">{siKe.first.zhi}</div>
                <div className="font-medium text-gray-600">{siKe.first.gan}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Tian Di Pan Grid */}
        <div className="flex-1 bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-bold mb-3 text-indigo-900 border-b pb-2">天地盘</h3>
          <div className="grid grid-cols-4 gap-2 aspect-square max-w-md mx-auto">
            {/* Row 1: Si Wu Wei Shen */}
            {renderPalace('巳')}
            {renderPalace('午')}
            {renderPalace('未')}
            {renderPalace('申')}
            
            {/* Row 2: Chen (Empty) (Empty) You */}
            {renderPalace('辰')}
            <div className="col-span-2 row-span-2 flex items-center justify-center bg-indigo-50 rounded text-center p-4">
              <div className="text-sm text-indigo-800">
                <div>月将: {yueJiang}</div>
                <div>占时: {ganZhi.hour}</div>
              </div>
            </div>
            {renderPalace('酉')}
            
            {/* Row 3: Mao (Empty) (Empty) Xu */}
            {renderPalace('卯')}
            {renderPalace('戌')}
            
            {/* Row 4: Yin Chou Zi Hai */}
            {renderPalace('寅')}
            {renderPalace('丑')}
            {renderPalace('子')}
            {renderPalace('亥')}
          </div>
        </div>
      </div>

      {/* Shen Sha Section */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="text-lg font-bold mb-3 text-indigo-900 border-b pb-2">神煞</h3>
        <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed max-h-96 overflow-y-auto">
          {shenShaText}
        </div>
      </div>

      {/* Zhi Zhi Section */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="text-lg font-bold mb-3 text-indigo-900 border-b pb-2">大六壬直指</h3>
        <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed max-h-96 overflow-y-auto">
          {zhiZhi}
        </div>
      </div>
    </div>
  );
};

export default DaLiuRenDisk;
