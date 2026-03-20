import { Card, Empty, Space, Tag, Typography } from 'antd';

const { Link, Paragraph, Text } = Typography;

function renderSlotCard(item) {
  return (
    <Card
      key={item.id}
      size="small"
      style={{ height: '100%' }}
      bodyStyle={{ display: 'flex', flexDirection: 'column', gap: 8 }}
    >
      <Text strong>{item.title}</Text>
      <Paragraph style={{ marginBottom: 0, color: '#475569' }}>
        {item.description}
      </Paragraph>
      <Space size="small" wrap>
        <Tag color="blue">{item.priceLabel}</Tag>
        <Link href={item.targetUrl} target="_blank">
          查看详情
        </Link>
      </Space>
    </Card>
  );
}

export default function RecommendationPanel({ loading, recommendations }) {
  const advisors = recommendations?.advisors || [];
  const products = recommendations?.products || [];
  const hasContent = advisors.length || products.length;

  return (
    <Card title="延伸推荐" loading={loading} style={{ width: '100%' }}>
      {!hasContent ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="当前没有匹配的咨询或商品推荐。"
        />
      ) : (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Text strong>一对一咨询</Text>
            <div
              style={{
                display: 'grid',
                gap: 12,
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                marginTop: 12
              }}
            >
              {advisors.map(renderSlotCard)}
            </div>
          </div>
          <div>
            <Text strong>相关礼赠</Text>
            <div
              style={{
                display: 'grid',
                gap: 12,
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                marginTop: 12
              }}
            >
              {products.map(renderSlotCard)}
            </div>
          </div>
        </Space>
      )}
    </Card>
  );
}
