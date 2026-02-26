import { Button, Layout, Menu, Space, Typography } from 'antd'
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { logout, useAuth } from './auth/auth'
import RequireAuth from './auth/RequireAuth'
import CustomerTable from './components/CustomerTable'
import ClockInPage from './pages/ClockInPage'
import ClockInAuditPage from './pages/ClockInAuditPage'
import DataSourcePage from './pages/DataSourcePage'
import LoginPage from './pages/LoginPage'
import PaymentsAuditPage from './pages/PaymentsAuditPage'
import PaymentsPage from './pages/PaymentsPage'
import './App.css'

const { Header, Content } = Layout
const { Title } = Typography

function App() {
  const location = useLocation()
  const { isLoggedIn } = useAuth()

  const selectedKey = (() => {
    if (location.pathname.startsWith('/payments/audit')) return '/payments/audit'
    if (location.pathname.startsWith('/clock-in/audit')) return '/clock-in/audit'
    if (location.pathname.startsWith('/payments')) return '/payments'
    if (location.pathname.startsWith('/clock-in')) return '/clock-in'
    if (location.pathname.startsWith('/customers')) return '/customers'
    if (location.pathname.startsWith('/data-source')) return '/data-source'
    return ''
  })()

  const loginHref = `/login?redirect=${encodeURIComponent(
    `${location.pathname}${location.search}${location.hash}`,
  )}`

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        background: '#fff', 
        padding: '0 24px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        gap: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, minWidth: 0 }}>
          <Title level={3} style={{ margin: 0, color: '#1890ff', whiteSpace: 'nowrap' }}>
            ProMax Management
          </Title>
          <Menu
            mode="horizontal"
            selectedKeys={selectedKey ? [selectedKey] : []}
            style={{ flex: 1, minWidth: 0 }}
            items={[
              { key: '/customers', label: <Link to="/customers">客户管理</Link> },
              { key: '/payments', label: <Link to="/payments">支付流水（需登录）</Link> },
              { key: '/payments/audit', label: <Link to="/payments/audit">审计-支付（只读）</Link> },
              { key: '/clock-in/audit', label: <Link to="/clock-in/audit">审计-打卡（只读）</Link> },
              { key: '/clock-in', label: <Link to="/clock-in">打卡（需登录）</Link> },
              { key: '/data-source', label: <Link to="/data-source">数据源配置</Link> },
            ]}
          />
        </div>

        <Space>
          {isLoggedIn ? (
            <Button onClick={logout}>退出登录</Button>
          ) : (
            <Button type="primary">
              <Link to={loginHref}>登录</Link>
            </Button>
          )}
        </Space>
      </Header>
      <Content style={{ padding: '24px', background: '#f0f2f5' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/customers" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/data-source"
            element={
              <RequireAuth>
                <DataSourcePage />
              </RequireAuth>
            }
          />
          <Route path="/customers" element={<CustomerTable />} />
          <Route path="/payments/audit" element={<PaymentsAuditPage />} />
          <Route path="/clock-in/audit" element={<ClockInAuditPage />} />
          <Route
            path="/payments"
            element={
              <RequireAuth>
                <PaymentsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/clock-in"
            element={
              <RequireAuth>
                <ClockInPage />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/customers" replace />} />
        </Routes>
      </Content>
    </Layout>
  )
}

export default App

