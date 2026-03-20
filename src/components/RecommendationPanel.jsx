import { useState } from 'react';
import { Button, Card, Empty, Space, Tag, Typography } from 'antd';
import RecommendationDetailDrawer from './RecommendationDetailDrawer';

const { Paragraph, Text } = Typography;

function renderSlotCard(item, onOpen) {
  return (
    <Card
      key={item.id}
      size="small"
      style={{ height: '100%' }}
      styles={{
        body: {
          display: 'flex',
          flexDirection: 'column',
          gap: 8
        }
      }}
    >
      <Text strong>{item.title}</Text>
      <Paragraph style={{ marginBottom: 0, color: '#475569' }}>
        {item.description}
      </Paragraph>
      <Space size="small" wrap>
        <Tag color="blue">{item.priceLabel}</Tag>
        <Button type="link" style={{ padding: 0 }} onClick={() => onOpen(item)}>
          查看详情
        </Button>
      </Space>
    </Card>
  );
}

export default function RecommendationPanel({ loading, recommendations }) {
  const [activeItem, setActiveItem] = useState(null);
  const advisors = recommendations?.advisors || [];
  const products = recommendations?.products || [];
  const hasContent = advisors.length || products.length;

  const openItem = (item, category) => {
    setActiveItem({
      ...item,
      category
    });
  };

  return (
    <>
      <Card title="延伸推荐" loading={loading} style={{ width: '100%' }}>
        {!hasContent ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="当前没有匹配的咨询或商品推荐。"
          />
        ) : (
          <Space orientation="vertical" size="large" style={{ width: '100%' }}>
            {advisors.length ? (
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
                  {advisors.map((item) => renderSlotCard(item, (selectedItem) => openItem(selectedItem, 'advisor')))}
                </div>
              </div>
            ) : null}
            {products.length ? (
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
                  {products.map((item) => renderSlotCard(item, (selectedItem) => openItem(selectedItem, 'product')))}
                </div>
              </div>
            ) : null}
          </Space>
        )}
      </Card>
      <RecommendationDetailDrawer
        item={activeItem}
        open={Boolean(activeItem)}
        onClose={() => setActiveItem(null)}
      />
    </>
  );
}
