import React from 'react';
import { Card, Descriptions, Typography, Row, Col, Tag, Table, Divider } from 'antd';

const { Text, Title } = Typography;

const BaZiDisk = ({ data }) => {
  if (!data) return <div style={{ color: '#999' }}>暂无数据</div>;
  if (data.error) return <div style={{ color: '#ff4d4f' }}>错误: {data.error}</div>;

  const { 性别, 阳历, 农历, 八字, 生肖, 日主, 年柱, 月柱, 日柱, 时柱, 胎元, 命宫, 身宫, 大运 } = data;

  const renderPillar = (pillar, title) => (
    <Card size="small" style={{ height: '100%' }}>
      <div style={{ textAlign: 'center' }}>
        <Text type="secondary" strong style={{ fontSize: 12 }}>{title}</Text>
        <Divider style={{ margin: '8px 0' }} />
        
        {/* 天干 */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 28, fontWeight: 'bold', color: '#333' }}>{pillar.天干.天干}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>{pillar.天干.五行} {pillar.天干.阴阳}</Text>
          {pillar.天干.十神 && (
            <div><Tag color="purple" style={{ marginTop: 4 }}>{pillar.天干.十神}</Tag></div>
          )}
        </div>
        
        <Divider style={{ margin: '8px 0' }} />
        
        {/* 地支 */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 28, fontWeight: 'bold', color: '#333' }}>{pillar.地支.地支}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>{pillar.地支.五行} {pillar.地支.阴阳}</Text>
        </div>
        
        {/* 藏干 */}
        {pillar.地支.藏干 && (
          <>
            <Divider style={{ margin: '8px 0' }} />
            <div style={{ textAlign: 'left', fontSize: 12 }}>
              <Text type="secondary" strong>藏干:</Text>
              {Object.entries(pillar.地支.藏干).map(([type, info]) => (
                <div key={type} style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span>{type}: {info.天干}</span>
                  <Tag color="purple" size="small">{info.十神}</Tag>
                </div>
              ))}
            </div>
          </>
        )}
        
        {/* 纳音 */}
        <Divider style={{ margin: '8px 0' }} />
        <Text type="secondary" style={{ fontSize: 12 }}>纳音: {pillar.纳音}</Text>
        
        {/* 神煞 */}
        {pillar.神煞 && pillar.神煞.length > 0 && (
          <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 4 }}>
            {pillar.神煞.map((ss, idx) => (
              <Tag key={idx} color="gold" style={{ fontSize: 10 }}>{ss}</Tag>
            ))}
          </div>
        )}
      </div>
    </Card>
  );

  // 大运表格列配置
  const daYunColumns = [
    { title: '干支', dataIndex: '干支', key: '干支', render: (text) => <Text strong style={{ color: '#4338ca' }}>{text}</Text> },
    { title: '年份', key: 'year', render: (_, record) => `${record.开始年份}-${record.结束年份}` },
    { title: '年龄', key: 'age', render: (_, record) => `${record.开始年龄}-${record.结束年龄}岁` },
    { title: '天干十神', dataIndex: '天干十神', key: '天干十神', render: (text) => <Tag color="purple">{text}</Tag> },
    { 
      title: '地支藏干', 
      key: 'hidden', 
      render: (_, record) => (
        <span>
          {record.地支藏干.map((gan, i) => (
            <span key={i} style={{ marginRight: 8 }}>
              {gan}<Text type="secondary" style={{ fontSize: 12 }}>({record.地支十神[i]})</Text>
            </span>
          ))}
        </span>
      )
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Info */}
      <Card size="small">
        <Descriptions column={{ xs: 2, sm: 4 }} size="small">
          <Descriptions.Item label="性别">{性别}</Descriptions.Item>
          <Descriptions.Item label="阳历">{阳历}</Descriptions.Item>
          <Descriptions.Item label="农历">{农历}</Descriptions.Item>
          <Descriptions.Item label="生肖">{生肖}</Descriptions.Item>
        </Descriptions>
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Text type="secondary">八字</Text>
          <Title level={3} style={{ margin: '4px 0', color: '#4338ca', letterSpacing: 8 }}>{八字}</Title>
          <Text type="secondary">日主: <Text strong style={{ color: '#4338ca' }}>{日主}</Text></Text>
        </div>
      </Card>

      {/* Four Pillars */}
      <Card title="四柱" size="small">
        <Row gutter={16}>
          <Col xs={12} md={6}>{renderPillar(年柱, '年柱')}</Col>
          <Col xs={12} md={6}>{renderPillar(月柱, '月柱')}</Col>
          <Col xs={12} md={6}>{renderPillar(日柱, '日柱')}</Col>
          <Col xs={12} md={6}>{renderPillar(时柱, '时柱')}</Col>
        </Row>
      </Card>

      {/* Interactions & Additional Info */}
      <Row gutter={24}>
        {/* Interactions */}
        <Col xs={24} md={12}>
          <Card title="刑冲合会" size="small" style={{ height: '100%' }}>
            {data.刑冲合会 && data.刑冲合会.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {data.刑冲合会.map((interaction, idx) => (
                  <Tag key={idx} color="red">{interaction}</Tag>
                ))}
              </div>
            ) : (
              <Text type="secondary" italic>无明显刑冲合会</Text>
            )}
          </Card>
        </Col>

        {/* Additional Info */}
        <Col xs={24} md={12}>
          <Card title="其他信息" size="small" style={{ height: '100%' }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="胎元">{胎元}</Descriptions.Item>
              <Descriptions.Item label="命宫">{命宫}</Descriptions.Item>
              <Descriptions.Item label="身宫">{身宫}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      {/* Da Yun (Big Luck) */}
      {大运 && (
        <Card title={`大运 (起运年龄: ${大运.起运年龄}岁)`} size="small">
          <Table 
            dataSource={大运.大运.map((item, idx) => ({ ...item, key: idx }))}
            columns={daYunColumns}
            pagination={false}
            size="small"
            scroll={{ x: 'max-content' }}
          />
        </Card>
      )}
    </div>
  );
};

export default BaZiDisk;
