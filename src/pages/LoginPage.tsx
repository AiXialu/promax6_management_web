import { Button, Card, Form, Input, Typography, message } from 'antd'
import { useMemo } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { login } from '../auth/auth'
import { getEffectiveConfig } from '../data/config'

const { Title, Paragraph, Text } = Typography

function useRedirectTarget() {
  const location = useLocation()
  return useMemo(() => {
    const params = new URLSearchParams(location.search)
    return params.get('redirect') || '/'
  }, [location.search])
}

export default function LoginPage() {
  const navigate = useNavigate()
  const redirectTo = useRedirectTarget()
  const cfg = getEffectiveConfig()

  return (
    <div style={{ maxWidth: 420, margin: '48px auto' }}>
      <Card>
        <Title level={3} style={{ marginTop: 0 }}>
          登录
        </Title>
        <Paragraph type="secondary" style={{ marginTop: 8 }}>
          支付流水录入、打卡系统需要登录后才能操作。
        </Paragraph>
        <Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 24 }}>
          这里的“登录”是填写会计的 GitHub Token（PAT），用于写入 Public 数据仓库。
        </Paragraph>
        {!cfg ? (
          <Paragraph type="warning" style={{ marginTop: 0 }}>
            还未配置数据源。请先到 <Link to="/data-source">数据源配置</Link> 填写 Public Repo 信息。
          </Paragraph>
        ) : (
          <Paragraph type="secondary" style={{ marginTop: 0 }}>
            当前数据源：<Text code>{cfg.owner}/{cfg.repo}</Text>（{cfg.branch}）
          </Paragraph>
        )}

        <Form
          layout="vertical"
          onFinish={(values: { token: string }) => {
            const ok = login(values.token)
            if (!ok) {
              message.error('Token 不能为空')
              return
            }
            message.success('登录成功')
            navigate(redirectTo, { replace: true })
          }}
        >
          <Form.Item
            name="token"
            label="GitHub Token（Fine-grained PAT）"
            rules={[{ required: true, message: '请输入 GitHub Token' }]}
          >
            <Input.Password placeholder="粘贴 GitHub Token" autoFocus />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            登录
          </Button>
        </Form>
      </Card>
    </div>
  )
}

