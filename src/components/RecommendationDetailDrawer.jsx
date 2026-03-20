import { Alert, Button, Descriptions, Divider, Drawer, Space, Tag, Typography, message } from 'antd';

const { Paragraph, Text } = Typography;

function renderList(items = []) {
  if (!items.length) {
    return null;
  }

  return (
    <Space orientation="vertical" size="small" style={{ width: '100%' }}>
      {items.map((item) => (
        <div key={item} style={{ color: '#475569' }}>
          {item}
        </div>
      ))}
    </Space>
  );
}

export default function RecommendationDetailDrawer({ item, onClose, open }) {
  if (!item) {
    return null;
  }

  const isAdvisor = item.category === 'advisor';

  const handlePrimaryAction = () => {
    try {
      if (/^https?:\/\//.test(item.targetUrl || '')) {
        window.open(item.targetUrl, '_blank', 'noopener,noreferrer');
        return;
      }

      message.info('当前为站内承接演示位，后续可替换成企业微信、抖店或咨询表单链接。');
    } catch (error) {
      // 保留前端日志，便于定位真实承接链接接入后的异常。
      console.error('[RecommendationDetailDrawer] 打开承接链接失败', error);
      message.error('打开承接链接失败，请稍后重试。');
    }
  };

  return (
    <Drawer
      title={item.title}
      size={420}
      open={open}
      onClose={onClose}
      destroyOnClose
    >
      <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
        <Paragraph style={{ marginBottom: 0, color: '#475569' }}>
          {item.description}
        </Paragraph>

        <Space size="small" wrap>
          <Tag color="blue">{item.priceLabel}</Tag>
          <Tag color={isAdvisor ? 'gold' : 'green'}>
            {isAdvisor ? '咨询承接' : '商品承接'}
          </Tag>
        </Space>

        <Descriptions
          column={1}
          size="small"
          bordered
          items={isAdvisor ? [
            {
              key: 'deliveryType',
              label: '交付方式',
              children: item.deliveryType || '图文咨询'
            },
            {
              key: 'targetUrl',
              label: '承接位',
              children: item.targetUrl || '待接入'
            }
          ] : [
            {
              key: 'materialLabel',
              label: '类型',
              children: item.materialLabel || '文创礼赠'
            },
            {
              key: 'sceneLabel',
              label: '适用场景',
              children: item.sceneLabel || '情绪陪伴'
            }
          ]}
        />

        <div>
          <Text strong>亮点说明</Text>
          <div style={{ marginTop: 12 }}>
            {renderList(item.highlights)}
          </div>
        </div>

        {isAdvisor && item.serviceSteps?.length ? (
          <div>
            <Text strong>服务流程</Text>
            <div style={{ marginTop: 12 }}>
              {renderList(item.serviceSteps)}
            </div>
          </div>
        ) : null}

        <Divider style={{ margin: '8px 0' }} />

        <Alert
          showIcon
          type="info"
          title={item.complianceNote || '当前承接内容仅作演示，后续可切换成真实渠道链接。'}
        />

        <Button type="primary" block onClick={handlePrimaryAction}>
          {item.ctaLabel || '继续查看'}
        </Button>
      </Space>
    </Drawer>
  );
}
