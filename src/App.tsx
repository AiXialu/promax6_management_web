import { Layout, Typography } from 'antd'
import CustomerTable from './components/CustomerTable'
import './App.css'

const { Header, Content } = Layout
const { Title } = Typography

function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        background: '#fff', 
        padding: '0 24px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center'
      }}>
        <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
          Customer Management Platform
        </Title>
      </Header>
      <Content style={{ padding: '24px', background: '#f0f2f5' }}>
        <CustomerTable />
      </Content>
    </Layout>
  )
}

export default App

