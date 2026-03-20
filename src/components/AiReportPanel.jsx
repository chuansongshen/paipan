import { Alert, Button, Card, Divider, Input, Space, Tag, Typography } from 'antd';

const { Paragraph, Text } = Typography;

export default function AiReportPanel({
  disabledReason,
  enabled,
  error,
  loading,
  onQuestionChange,
  onSubmit,
  question,
  reportUnlockPriceLabel,
  report
}) {
  return (
    <Card
      title="AI 解读"
      extra={<Tag color="gold">Beta</Tag>}
      style={{ width: '100%' }}
    >
      <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
        {!enabled && (
          <Alert
            showIcon
            type="warning"
            title={disabledReason || '当前排盘暂不支持 AI 解读'}
          />
        )}

        {error && (
          <Alert
            showIcon
            type="error"
            title="完整报告生成失败"
            description={error}
          />
        )}

        <Input.TextArea
          value={question}
          onChange={(event) => onQuestionChange(event.target.value)}
          autoSize={{ minRows: 3, maxRows: 6 }}
          disabled={!enabled || loading}
          placeholder="可选：输入你当前最关心的问题，例如“未来两年事业方向如何调整？”"
        />

        <Space size="middle" wrap>
          <Button type="primary" loading={loading} disabled={!enabled} onClick={onSubmit}>
            {report ? `再次支付 ${reportUnlockPriceLabel} 生成新报告` : `支付 ${reportUnlockPriceLabel} 生成完整报告`}
          </Button>
          <Text type="secondary">开发环境会自动确认 mock 支付；生产环境再切微信支付。</Text>
        </Space>

        {report && (
          <>
            <Divider style={{ margin: '8px 0' }} />
            <Space orientation="vertical" size="small" style={{ width: '100%' }}>
              <Text strong>报告摘要</Text>
              <Paragraph style={{ marginBottom: 0 }}>{report.summary}</Paragraph>
              <Space size="small" wrap>
                <Tag color="blue">剩余追问 {report.remainingCredits} 次</Tag>
                {(report.recommendationTags || []).map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </Space>
              <Text strong style={{ marginTop: 8 }}>报告正文</Text>
              <Paragraph
                copyable
                style={{
                  marginBottom: 0,
                  whiteSpace: 'pre-wrap',
                  maxHeight: 420,
                  overflow: 'auto',
                  padding: 12,
                  borderRadius: 8,
                  background: '#fafafa',
                  border: '1px solid #f0f0f0'
                }}
              >
                {report.reportMarkdown}
              </Paragraph>
            </Space>
          </>
        )}
      </Space>
    </Card>
  );
}
