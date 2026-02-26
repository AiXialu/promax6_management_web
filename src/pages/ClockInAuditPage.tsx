import { Card, Col, Row, Statistic, Table, Typography, message } from 'antd'
import type { ColumnType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getEffectiveConfig } from '../data/config'
import { readClockins } from '../data/githubStore'

type ClockInStatus = '正常' | '迟到' | '补卡'

interface ClockInRecord {
  key: string
  id: number
  name: string
  clockInAt: string // ISO string
  status: ClockInStatus
}

const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'

export default function ClockInAuditPage() {
  const [clockins, setClockins] = useState<ClockInRecord[]>([])
  const cfg = getEffectiveConfig()

  useEffect(() => {
    const refresh = async () => {
      try {
        const res = await readClockins<Array<Omit<ClockInRecord, 'key'>>>()
        if (!res.ok) throw new Error(res.error)
        setClockins(res.data.map((r) => ({ ...r, key: String(r.id) })))
      } catch (e) {
        console.error(e)
        message.error('加载打卡审计数据失败')
      }
    }
    refresh()
  }, [])

  const stats = useMemo(() => {
    const normal = clockins.filter((r) => r.status === '正常').length
    const late = clockins.filter((r) => r.status === '迟到').length
    const patch = clockins.filter((r) => r.status === '补卡').length
    return { total: clockins.length, normal, late, patch }
  }, [clockins])

  const columns: ColumnType<ClockInRecord>[] = useMemo(
    () => [
      { title: 'ID', dataIndex: 'id', key: 'id', width: 80, align: 'center', sorter: (a, b) => a.id - b.id },
      { title: '姓名', dataIndex: 'name', key: 'name', width: 200 },
      {
        title: '打卡时间',
        dataIndex: 'clockInAt',
        key: 'clockInAt',
        width: 220,
        sorter: (a, b) => dayjs(a.clockInAt).unix() - dayjs(b.clockInAt).unix(),
        render: (text: string) => dayjs(text).format(DATETIME_FORMAT),
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 140,
        filters: [
          { text: '正常', value: '正常' },
          { text: '迟到', value: '迟到' },
          { text: '补卡', value: '补卡' },
        ],
        onFilter: (value, record) => record.status === String(value),
      },
    ],
    [],
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card>
        <Typography.Title level={4} style={{ marginTop: 0 }}>
          打卡统计（审计只读）
        </Typography.Title>
        {!cfg ? (
          <Typography.Paragraph type="warning" style={{ marginTop: 8 }}>
            尚未配置数据源。请先到 <Link to="/data-source">数据源配置</Link> 填写 Public Repo 信息。
          </Typography.Paragraph>
        ) : null}
        <Row gutter={[16, 16]}>
          <Col xs={12} md={6}>
            <Statistic title="总记录数" value={stats.total} />
          </Col>
          <Col xs={12} md={6}>
            <Statistic title="正常" value={stats.normal} />
          </Col>
          <Col xs={12} md={6}>
            <Statistic title="迟到" value={stats.late} />
          </Col>
          <Col xs={12} md={6}>
            <Statistic title="补卡" value={stats.patch} />
          </Col>
        </Row>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={clockins}
          bordered
          size="middle"
          pagination={{ pageSize: 20, showSizeChanger: true }}
        />
      </Card>
    </div>
  )
}

