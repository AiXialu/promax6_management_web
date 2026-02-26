import { Button, Card, Form, Input, Typography, message } from 'antd'
import { getEffectiveConfig, getPublicConfig, setPublicConfig } from '../data/config'

const { Title, Paragraph, Text } = Typography

type FormValues = {
  owner: string
  repo: string
  branch: string
  paymentsPath: string
  clockinsPath: string
}

export default function DataSourcePage() {
  const saved = getPublicConfig()
  const effective = getEffectiveConfig()

  return (
    <div style={{ maxWidth: 720, margin: '24px auto' }}>
      <Card>
        <Title level={3} style={{ marginTop: 0 }}>
          数据源配置（GitHub Public Repo）
        </Title>
        <Paragraph type="secondary" style={{ marginTop: 8 }}>
          审计只读页会从 Public Repo 的 JSON 文件读取数据；会计端写入需要在登录页填写 GitHub Token。
        </Paragraph>
        <Paragraph type="secondary">
          你也可以通过环境变量预置：<Text code>VITE_DATA_REPO_OWNER</Text> / <Text code>VITE_DATA_REPO_NAME</Text> 等。
        </Paragraph>

        <Form<FormValues>
          layout="vertical"
          initialValues={{
            owner: saved?.owner || effective?.owner || '',
            repo: saved?.repo || effective?.repo || '',
            branch: saved?.branch || effective?.branch || 'main',
            paymentsPath: saved?.paymentsPath || effective?.paymentsPath || 'data/payments.json',
            clockinsPath: saved?.clockinsPath || effective?.clockinsPath || 'data/clockins.json',
          }}
          onFinish={(values) => {
            setPublicConfig({
              owner: values.owner.trim(),
              repo: values.repo.trim(),
              branch: values.branch.trim() || 'main',
              paymentsPath: values.paymentsPath.trim() || 'data/payments.json',
              clockinsPath: values.clockinsPath.trim() || 'data/clockins.json',
            })
            message.success('已保存数据源配置（本机浏览器）')
          }}
        >
          <Form.Item name="owner" label="Owner" rules={[{ required: true, message: '请输入 owner' }]}>
            <Input placeholder="例如：your-org" />
          </Form.Item>
          <Form.Item name="repo" label="Repo" rules={[{ required: true, message: '请输入 repo' }]}>
            <Input placeholder="例如：promax-data" />
          </Form.Item>
          <Form.Item name="branch" label="Branch">
            <Input placeholder="main" />
          </Form.Item>
          <Form.Item name="paymentsPath" label="支付流水文件路径">
            <Input placeholder="data/payments.json" />
          </Form.Item>
          <Form.Item name="clockinsPath" label="打卡文件路径">
            <Input placeholder="data/clockins.json" />
          </Form.Item>

          <Button type="primary" htmlType="submit">
            保存
          </Button>
        </Form>
      </Card>
    </div>
  )
}

