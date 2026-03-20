import { Alert, Button, Card, Empty, Input, Space, Timeline, Typography } from 'antd';

const { Paragraph, Text } = Typography;

export default function AiFollowUpPanel({
  error,
  followUpInput,
  followUps,
  loading,
  onChange,
  onSubmit,
  report
}) {
  const remainingCredits = report?.remainingCredits || 0;
  const disabled = !report?.reportId || remainingCredits <= 0;

  return (
    <Card title="继续追问" style={{ width: '100%' }}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {error && (
          <Alert
            showIcon
            type="error"
            message="追问失败"
            description={error}
          />
        )}

        <Input.TextArea
          value={followUpInput}
          onChange={(event) => onChange(event.target.value)}
          autoSize={{ minRows: 2, maxRows: 5 }}
          disabled={disabled || loading}
          placeholder={report?.reportId ? '继续围绕当前报告提问，例如“今年换工作要避开什么风险？”' : '请先生成完整报告'}
        />

        <Space size="middle" wrap>
          <Button type="primary" ghost loading={loading} disabled={disabled} onClick={onSubmit}>
            提交追问
          </Button>
          <Text type={remainingCredits > 0 ? 'secondary' : 'danger'}>
            {report?.reportId ? `剩余 ${remainingCredits} 次追问` : '当前还没有可追问的报告'}
          </Text>
        </Space>

        {followUps.length ? (
          <Timeline
            items={followUps.map((item) => ({
              children: (
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Text strong>{item.question}</Text>
                  <Paragraph
                    style={{
                      marginBottom: 0,
                      whiteSpace: 'pre-wrap',
                      padding: 12,
                      borderRadius: 8,
                      background: '#fafafa',
                      border: '1px solid #f0f0f0'
                    }}
                  >
                    {item.answer}
                  </Paragraph>
                </Space>
              )
            }))}
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="完整报告生成后，可继续围绕当前主题追问。"
          />
        )}
      </Space>
    </Card>
  );
}
