import { Alert, Typography } from 'antd';

const { Text } = Typography;

export default function ComplianceNotice() {
  return (
    <Alert
      showIcon
      type="info"
      title="使用说明"
      description={(
        <Text style={{ color: '#334155' }}>
          AI 解读仅供传统文化研究与娱乐参考，不提供改命、转运、治病等功效承诺。开发联调阶段默认由后端直连 AI Studio API，生产环境再切换为 Vertex AI。
        </Text>
      )}
    />
  );
}
