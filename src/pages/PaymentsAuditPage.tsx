import { Alert, Button, Card, Col, Row, Space, Spin, Statistic, Table, Tag, Typography, message } from 'antd'
import type { ColumnType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
import { readPayments } from '../data/githubStore'
import { getEffectiveConfig } from '../data/config'
import { Link } from 'react-router-dom'

export default function PaymentsAuditPage() {
  const [data, setData] = useState<
    Array<{
      key: string
      id: number
      name: string
      amount: number
      createdAt: string
      paidAt?: string
      status: '已支付' | '未支付'
    }>
  >([])
  const [loading, setLoading] = useState<boolean>(false)
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>('')
  const cfg = getEffectiveConfig()

  useEffect(() => {
    void refresh()
  }, [])

  const refresh = async () => {
    setLoading(true)
    try {
      const paymentsRes = await readPayments<
        Array<{
          id: number
          name: string
          amount: number
          createdAt: string
          paidAt?: string
          status: '已支付' | '未支付'
        }>
      >()
      if (!paymentsRes.ok) throw new Error(paymentsRes.error)
      setData(paymentsRes.data.map((r) => ({ ...r, key: String(r.id) })))
      setLastRefreshedAt(new Date().toISOString())
    } catch (e) {
      console.error(e)
      message.error('加载支付审计数据失败')
    } finally {
      setLoading(false)
    }
  }

  const stats = useMemo(() => {
    const totalAmount = data.reduce((sum, r) => sum + (Number(r.amount) || 0), 0)
    const paid = data.filter((r) => r.status === '已支付')
    const unpaid = data.filter((r) => r.status === '未支付')
    const paidAmount = paid.reduce((sum, r) => sum + (Number(r.amount) || 0), 0)
    const unpaidAmount = unpaid.reduce((sum, r) => sum + (Number(r.amount) || 0), 0)
    return {
      totalCount: data.length,
      totalAmount,
      paidCount: paid.length,
      paidAmount,
      unpaidCount: unpaid.length,
      unpaidAmount,
    }
  }, [data])

  const columns: ColumnType<(typeof data)[number]>[] = useMemo(
    () => [
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
        width: 90,
        align: 'center',
        sorter: (a, b) => a.id - b.id,
        defaultSortOrder: 'ascend',
      },
      {
        title: '姓名',
        dataIndex: 'name',
        key: 'name',
        width: 220,
        sorter: (a, b) => a.name.localeCompare(b.name),
      },
      {
        title: '金额',
        dataIndex: 'amount',
        key: 'amount',
        width: 150,
        align: 'right',
        sorter: (a, b) => a.amount - b.amount,
        render: (v: number) => <Typography.Text>{Number(v || 0).toFixed(2)}</Typography.Text>,
      },
      {
        title: '创建时间',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 220,
        sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
        render: (t: string) => dayjs(t).format('YYYY-MM-DD HH:mm:ss'),
      },
      {
        title: '支付时间',
        dataIndex: 'paidAt',
        key: 'paidAt',
        width: 220,
        sorter: (a, b) => dayjs(a.paidAt || 0).unix() - dayjs(b.paidAt || 0).unix(),
        render: (t?: string) => (t ? dayjs(t).format('YYYY-MM-DD HH:mm:ss') : '-'),
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 130,
        filters: [
          { text: '已支付', value: '已支付' },
          { text: '未支付', value: '未支付' },
        ],
        onFilter: (value, record) => record.status === String(value),
        render: (s: '已支付' | '未支付') =>
          s === '已支付' ? <Tag color="green">已支付</Tag> : <Tag color="orange">未支付</Tag>,
      },
    ],
    [],
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card>
        <Space style={{ width: '100%', justifyContent: 'space-between' }} align="start">
          <div>
            <Typography.Title level={4} style={{ marginTop: 0, marginBottom: 4 }}>
              审计 - 支付流水（只读）
            </Typography.Title>
            {cfg ? (
              <Typography.Text type="secondary">
                数据源：<Typography.Text code>{cfg.owner}/{cfg.repo}</Typography.Text>（{cfg.branch}） ·{' '}
                <Typography.Text code>{cfg.paymentsPath}</Typography.Text>
                {lastRefreshedAt ? (
                  <>
                    {' '}· 更新时间：{dayjs(lastRefreshedAt).format('YYYY-MM-DD HH:mm:ss')}
                  </>
                ) : null}
              </Typography.Text>
            ) : (
              <Alert
                style={{ marginTop: 8 }}
                type="warning"
                message={
                  <>
                    尚未配置数据源。请先到 <Link to="/data-source">数据源配置</Link> 填写 Public Repo 信息。
                  </>
                }
              />
            )}
          </div>
          <Button onClick={() => void refresh()} disabled={loading}>
            刷新
          </Button>
        </Space>
      </Card>

      <Card>
        <Spin spinning={loading}>
          <Row gutter={[16, 16]}>
            <Col xs={12} md={6}>
              <Statistic title="总记录数" value={stats.totalCount} suffix="条" />
            </Col>
            <Col xs={12} md={6}>
              <Statistic title="总金额" value={stats.totalAmount} precision={2} valueStyle={{ color: '#1677ff' }} />
            </Col>
            <Col xs={12} md={6}>
              <Statistic title="已支付" value={stats.paidCount} suffix="条" valueStyle={{ color: '#389e0d' }} />
            </Col>
            <Col xs={12} md={6}>
              <Statistic title="已支付金额" value={stats.paidAmount} precision={2} valueStyle={{ color: '#389e0d' }} />
            </Col>
            <Col xs={12} md={6}>
              <Statistic title="未支付" value={stats.unpaidCount} suffix="条" valueStyle={{ color: '#d46b08' }} />
            </Col>
            <Col xs={12} md={6}>
              <Statistic title="未支付金额" value={stats.unpaidAmount} precision={2} valueStyle={{ color: '#d46b08' }} />
            </Col>
          </Row>
        </Spin>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          bordered
          size="middle"
          pagination={{ pageSize: 20, showSizeChanger: true }}
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={2}>
                  <Typography.Text strong>合计</Typography.Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} align="right">
                  <Typography.Text strong>{stats.totalAmount.toFixed(2)}</Typography.Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3} colSpan={3} />
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </Card>
    </div>
  )
}

