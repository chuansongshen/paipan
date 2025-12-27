import React from 'react';
import { Card, Tag } from 'antd';
import classNames from 'classnames';

const PALACE_MAP = [
  { id: 4, name: '巽' }, { id: 9, name: '离' }, { id: 2, name: '坤' },
  { id: 3, name: '震' }, { id: 5, name: '中' }, { id: 7, name: '兑' },
  { id: 8, name: '艮' }, { id: 1, name: '坎' }, { id: 6, name: '乾' }
];

const QimenDisk = ({ data }) => {
  if (!data || data.error) return <div style={{ color: '#ff4d4f' }}>{data?.error || 'No Data'}</div>;

  const renderCell = (palaceId) => {
    const isCenter = palaceId === 5;
    
    // Data for this palace
    const star = data.tianPan[palaceId];
    const gate = data.renPan[palaceId];
    const god = data.shenPan[palaceId];
    const diStem = data.diPan[palaceId];
    const tianStem = data.tianPanStems[palaceId];
    const anGan = data.anGan[palaceId];
    
    const isMa = data.maXingPalace === palaceId;
    const isKong = data.kongWangPalaces.includes(palaceId);
    
    if (isCenter) {
      return (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%', 
          background: 'rgba(255, 251, 235, 0.5)',
          gap: 4,
          padding: 8
        }}>
          <div style={{ color: '#999', fontSize: 14 }}>中宫</div>
          <div style={{ display: 'flex', gap: 4 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.6 }}>
              <span style={{ fontSize: 8, color: '#999' }}>暗</span>
              <span style={{ fontWeight: 'bold', fontSize: 14, color: '#666' }}>{anGan}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: 8, color: '#999' }}>天</span>
              <span style={{ fontWeight: 'bold', fontSize: 18, color: '#dc2626' }}>{tianStem}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: 8, color: '#999' }}>地</span>
              <span style={{ fontWeight: 'bold', fontSize: 18, color: '#b45309' }}>{diStem}</span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={classNames("h-full relative", {
        "bg-gray-100": isKong
      })} style={{ position: 'relative', display: 'flex', padding: 4 }}>
        
        {/* Left Column: 八神、九星、八门 */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flex: 1,
          paddingRight: 4
        }}>
          {/* 八神 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <span style={{ fontSize: 12, color: '#7c3aed', fontWeight: 'bold' }}>{god}</span>
            {isMa && <Tag color="red" style={{ transform: 'scale(0.65)', transformOrigin: 'left', margin: 0, padding: '0 2px' }}>马</Tag>}
          </div>
          {/* 九星 */}
          <div>
            <span style={{ fontSize: 14, color: '#1d4ed8', fontWeight: 500 }}>{star && star.split('/')[0]}</span>
          </div>
          {/* 八门 */}
          <div>
            <span style={{ fontSize: 14, color: '#15803d', fontWeight: 500 }}>{gate}</span>
          </div>
        </div>
        
        {/* Right Column: 暗干、天盘干、地盘干 */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'flex-end',
          alignItems: 'flex-end',
          gap: 2
        }}>
          {/* 暗干 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.6 }}>
            <span style={{ fontSize: 8, color: '#999' }}>暗</span>
            <span style={{ fontWeight: 'bold', fontSize: 12, color: '#666' }}>{anGan}</span>
          </div>
          {/* 天盘干 + 地盘干 横排 */}
          <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: 8, color: '#999' }}>天</span>
              <span style={{ fontWeight: 'bold', fontSize: 18, color: '#dc2626' }}>{tianStem}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: 8, color: '#999' }}>地</span>
              <span style={{ fontWeight: 'bold', fontSize: 18, color: '#b45309' }}>{diStem}</span>
            </div>
          </div>
        </div>
        
        {/* Kong Wang Indicator */}
        {isKong && (
          <div style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none'
          }}>
            <span style={{ fontSize: 32, color: 'rgba(239, 68, 68, 0.15)', fontWeight: 'bold' }}>⭕</span>
          </div>
        )}
        
        {/* Palace Name Watermark */}
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          opacity: 0.05, 
          pointerEvents: 'none'
        }}>
          <span style={{ fontSize: 48, fontFamily: 'serif' }}>{PALACE_MAP.find(p => p.id === palaceId)?.name}</span>
        </div>
      </div>
    );
  };

  return (
    <Card 
      styles={{ body: { padding: 0 } }}
      style={{ width: '100%', maxWidth: 540, margin: '0 auto' }}
    >
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gridTemplateRows: 'repeat(3, 1fr)', 
        height: '100%',
        minHeight: 420
      }}>
        {PALACE_MAP.map((palace, idx) => (
          <div 
            key={palace.id} 
            style={{ 
              position: 'relative', 
              background: '#fff',
              borderRight: (idx % 3 !== 2) ? '1px solid #e5e7eb' : 'none',
              borderBottom: (Math.floor(idx / 3) !== 2) ? '1px solid #e5e7eb' : 'none',
              minHeight: 120
            }}
          >
            {renderCell(palace.id)}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default QimenDisk;
