import React from 'react';
import { Card, Descriptions, Typography, Row, Col, Tag, Divider } from 'antd';

const { Text, Title } = Typography;

const LiuYaoDisk = ({ data }) => {
  if (!data) return null;
  
  const { benGua, bianGua, movingYao, movingYaos = [], shenSha, ganZhi, dateStr, lunarStr, birthYear } = data;
  const movingSet = new Set((movingYaos.length > 0 ? movingYaos : [movingYao]).filter(Boolean));
  
  // Helper to render a single hexagram
  const renderHexagram = (guaData, title, isBianGua = false) => {
    if (!guaData) return null;
    
    return (
      <Card title={`${title}: ${guaData.name}`} size="small" style={{ flex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: 8 }}>
          {guaData.yaoData.map((yao, index) => {
            const isMoving = !isBianGua && movingSet.has(yao.position);
            
            return (
              <div 
                key={index} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: 8,
                  background: isMoving ? '#fffbe6' : 'transparent',
                  border: isMoving ? '2px solid #ffe58f' : 'none',
                  borderRadius: 4
                }}
              >
                <Text type="secondary" style={{ width: 40, textAlign: 'center', fontSize: 12 }}>{yao.position}爻</Text>
                <Text style={{ width: 60, textAlign: 'center', fontSize: 12 }}>{yao.stem}{yao.branch}</Text>
                <Text type="secondary" style={{ width: 32, textAlign: 'center', fontSize: 12 }}>{yao.wuxing}</Text>
                <div style={{ flex: 1, margin: '0 8px', display: 'flex', justifyContent: 'center' }}>
                  {yao.yinYang === 1 ? (
                    <div style={{ height: 16, background: '#4338ca', width: '100%', borderRadius: 2 }} />
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: 16 }}>
                      <div style={{ height: 16, background: '#4338ca', width: '45%', borderRadius: 2 }} />
                      <div style={{ height: 16, background: '#4338ca', width: '45%', borderRadius: 2 }} />
                    </div>
                  )}
                </div>
                {isMoving && <Tag color="red">动</Tag>}
              </div>
            );
          })}
        </div>
      </Card>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1000, width: '100%' }}>
      {/* Header Info */}
      <Card size="small">
        <Descriptions column={{ xs: 2, sm: 3, md: 4 }} size="small">
          <Descriptions.Item label="公历">{dateStr}</Descriptions.Item>
          <Descriptions.Item label="农历">{lunarStr}</Descriptions.Item>
          <Descriptions.Item label="干支">{ganZhi.year} {ganZhi.month} {ganZhi.day} {ganZhi.hour}</Descriptions.Item>
          <Descriptions.Item label="求测年命">{data.benMing} ({birthYear})</Descriptions.Item>
          <Descriptions.Item label="行年">{data.xingNian}</Descriptions.Item>
          <Descriptions.Item label="空亡">{data.dayXunKong} (日) / {data.hourXunKong} (时)</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Hexagrams Display */}
      <Row gutter={16}>
        <Col xs={24} md={12}>
          {renderHexagram(benGua, "本卦")}
        </Col>
        {bianGua && (
          <Col xs={24} md={12}>
            {renderHexagram(bianGua, "变卦", true)}
          </Col>
        )}
      </Row>

      {/* Shen Sha Display */}
      <Card title="神煞" size="small">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          {Object.entries(shenSha).map(([key, value]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Text type="secondary">{key}:</Text>
              <Tag>{value || '-'}</Tag>
            </div>
          ))}
        </div>
      </Card>

      {/* Yao Ci Display */}
      <Card title="爻辞" size="small">
        <Row gutter={24}>
          {/* Ben Gua Yao Ci */}
          <Col xs={24} md={bianGua ? 12 : 24}>
            <Title level={5} style={{ marginBottom: 12 }}>本卦：{benGua.name}</Title>
            {benGua.yaoCi && benGua.yaoCi.slice().reverse().map((ci, idx) => (
              <div key={idx} style={{ marginBottom: 8, fontSize: 14 }}>
                <Text strong style={{ color: '#4338ca' }}>{benGua.yaoData[5-idx].position}爻：</Text>
                <Text>{ci}</Text>
              </div>
            ))}
          </Col>
          {/* Bian Gua Yao Ci */}
          {bianGua && bianGua.yaoCi && (
            <Col xs={24} md={12}>
              <Title level={5} style={{ marginBottom: 12 }}>变卦：{bianGua.name}</Title>
              {bianGua.yaoCi.slice().reverse().map((ci, idx) => (
                <div key={idx} style={{ marginBottom: 8, fontSize: 14 }}>
                  <Text strong style={{ color: '#4338ca' }}>{bianGua.yaoData[5-idx].position}爻：</Text>
                  <Text>{ci}</Text>
                </div>
              ))}
            </Col>
          )}
        </Row>
      </Card>
    </div>
  );
};

export default LiuYaoDisk;
