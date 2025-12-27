import React from 'react';
import { Card, Descriptions, Typography, Row, Col, Divider } from 'antd';

const { Text, Title } = Typography;

const DaLiuRenDisk = ({ data }) => {
  console.log("DaLiuRenDisk received data:", data);
  if (!data) return <div style={{ color: '#999' }}>暂无数据</div>;
  if (data.error) return <div style={{ color: '#ff4d4f' }}>错误: {data.error}</div>;

  const {
    dateStr, ganZhi = {}, yueJiang, kongWang,
    sanChuan = [], siKe = { first:{}, second:{}, third:{}, fourth:{} }, tianPan = [], tianJiang = {},
    shenShaText, zhiZhi, birthYearGanZhi, gender, xingNian
  } = data;

  // Earth Branches for the grid
  const EARTH_ORDER = [
    '巳', '午', '未', '申',
    '辰',           '酉',
    '卯',           '戌',
    '寅', '丑', '子', '亥'
  ];
  
  // Map Earth Branch to its Heaven Branch and General
  const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  
  const getPalaceData = (earthBranch) => {
    const idx = ZHI.indexOf(earthBranch);
    if (idx === -1 || !tianPan) return { heaven: '?', general: '?' };
    
    const heaven = tianPan[idx];
    const general = tianJiang ? tianJiang[heaven] : '?';
    return { heaven, general };
  };

  const renderPalace = (earthBranch) => {
    const { heaven, general } = getPalaceData(earthBranch);
    return (
      <div style={{ 
        border: '1px solid #e5e7eb', 
        padding: 8, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: 80, 
        background: '#fff', 
        borderRadius: 4 
      }}>
        <Text type="secondary" style={{ fontSize: 12 }}>{general || '-'}</Text>
        <Text strong style={{ fontSize: 18, color: '#4338ca' }}>{heaven || '-'}</Text>
        <Text type="secondary" style={{ fontSize: 14, marginTop: 4 }}>{earthBranch}</Text>
      </div>
    );
  };

  // 渲染四课单元格
  const renderSiKeCell = (ke, label) => (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      gap: 4,
      padding: 8,
      background: '#fafafa',
      borderRadius: 8
    }}>
      <Text type="secondary" style={{ fontSize: 12 }}>{label}</Text>
      <Text style={{ fontSize: 12, color: '#7c3aed' }}>{tianJiang[ke.zhi] || '-'}</Text>
      <Text strong style={{ fontSize: 18 }}>{ke.zhi}</Text>
      <Text type="secondary" style={{ fontSize: 14 }}>{ke.gan}</Text>
    </div>
  );

  // 渲染三传单元格
  const renderSanChuanItem = (chuan, label) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
      <Text type="secondary">{label}</Text>
      <Text strong style={{ fontSize: 16 }}>
        <span style={{ color: '#666', fontSize: 14, marginRight: 4 }}>{chuan?.gan}</span>
        {chuan?.zhi}
      </Text>
      <Text type="secondary" style={{ fontSize: 12 }}>{tianJiang[chuan?.zhi]}</Text>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Info */}
      <Card size="small">
        <Descriptions column={{ xs: 2, sm: 3, md: 4 }} size="small">
          <Descriptions.Item label="日期">{dateStr}</Descriptions.Item>
          <Descriptions.Item label="四柱">{ganZhi.year} {ganZhi.month} {ganZhi.day} {ganZhi.hour}</Descriptions.Item>
          <Descriptions.Item label="月将">{yueJiang}</Descriptions.Item>
          <Descriptions.Item label="空亡">{kongWang}</Descriptions.Item>
          <Descriptions.Item label="年命">{birthYearGanZhi} ({gender})</Descriptions.Item>
          <Descriptions.Item label="行年">{xingNian || '-'}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Row gutter={24}>
        {/* Left Column: San Chuan & Si Ke */}
        <Col xs={24} md={8}>
          {/* San Chuan */}
          <Card title="三传" size="small" style={{ marginBottom: 16 }}>
            {renderSanChuanItem(sanChuan[0], '初传')}
            <Divider style={{ margin: '4px 0' }} />
            {renderSanChuanItem(sanChuan[1], '中传')}
            <Divider style={{ margin: '4px 0' }} />
            {renderSanChuanItem(sanChuan[2], '末传')}
          </Card>

          {/* Si Ke */}
          <Card title="四课" size="small">
            <Row gutter={8}>
              <Col span={6}>{renderSiKeCell(siKe.fourth, '第四课')}</Col>
              <Col span={6}>{renderSiKeCell(siKe.third, '第三课')}</Col>
              <Col span={6}>{renderSiKeCell(siKe.second, '第二课')}</Col>
              <Col span={6}>{renderSiKeCell(siKe.first, '第一课')}</Col>
            </Row>
          </Card>
        </Col>

        {/* Right Column: Tian Di Pan Grid */}
        <Col xs={24} md={16}>
          <Card title="天地盘" size="small">
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(4, 1fr)', 
              gridTemplateRows: 'repeat(4, auto)',
              gap: 8, 
              maxWidth: 480, 
              margin: '0 auto' 
            }}>
              {/* Row 1: Si Wu Wei Shen */}
              {renderPalace('巳')}
              {renderPalace('午')}
              {renderPalace('未')}
              {renderPalace('申')}
              
              {/* Row 2: Chen + Center(2x2) + You */}
              {renderPalace('辰')}
              <div style={{ 
                gridColumn: 'span 2', 
                gridRow: 'span 2',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                background: '#f0f5ff', 
                borderRadius: 4,
                padding: 16,
                textAlign: 'center',
                minHeight: 160
              }}>
                <div style={{ fontSize: 14, color: '#4338ca' }}>
                  <div>月将: {yueJiang}</div>
                  <div>占时: {ganZhi.hour}</div>
                </div>
              </div>
              {renderPalace('酉')}
              
              {/* Row 3: Mao + (center already spans) + Xu */}
              {renderPalace('卯')}
              {/* 中间的2x2区域已经从上一行跨越到这里 */}
              {renderPalace('戌')}
              
              {/* Row 4: Yin Chou Zi Hai */}
              {renderPalace('寅')}
              {renderPalace('丑')}
              {renderPalace('子')}
              {renderPalace('亥')}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Shen Sha Section */}
      <Card title="神煞" size="small">
        <div style={{ whiteSpace: 'pre-wrap', fontSize: 14, color: '#666', lineHeight: 1.8, maxHeight: 384, overflowY: 'auto' }}>
          {shenShaText}
        </div>
      </Card>

      {/* Zhi Zhi Section */}
      <Card title="大六壬直指" size="small">
        <div style={{ whiteSpace: 'pre-wrap', fontSize: 14, color: '#666', lineHeight: 1.8, maxHeight: 384, overflowY: 'auto' }}>
          {zhiZhi}
        </div>
      </Card>
    </div>
  );
};

export default DaLiuRenDisk;
