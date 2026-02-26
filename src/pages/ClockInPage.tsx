import { Button, Card, Form, Input, Popconfirm, Select, Space, Table, Typography, message } from 'antd'
import type { ColumnType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
import { DeleteOutlined } from '@ant-design/icons'
import { readClockins, writeClockins } from '../data/githubStore'
import { isLoggedIn } from '../auth/auth'

type ClockInStatus = '正常' | '迟到' | '补卡'

interface ClockInRecord {
  key: string
  id: number
  name: string
  clockInAt: string // ISO string
  status: ClockInStatus
}

const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'

export default function ClockInPage() {
  const [data, setData] = useState<ClockInRecord[]>([])
  const [form] = Form.useForm<{ name: string; status: ClockInStatus }>()
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      try {
        const res = await readClockins<Array<Omit<ClockInRecord, 'key'>>>()
        if (!res.ok) throw new Error(res.error)
        setData(res.data.map((r) => ({ ...r, key: String(r.id) })))
      } catch (e) {
        console.error(e)
        message.error('加载打卡记录失败')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  const reload = async () => {
    setLoading(true)
    try {
      const res = await readClockins<Array<Omit<ClockInRecord, 'key'>>>()
      if (!res.ok) throw new Error(res.error)
      setData(res.data.map((r) => ({ ...r, key: String(r.id) })))
    } finally {
      setLoading(false)
    }
  }

  const handleClockIn = async (values: { name: string; status: ClockInStatus }) => {
    const name = values.name.trim()
    if (!name) {
      message.error('姓名不能为空')
      return
    }

    setLoading(true)
    try {
      if (!isLoggedIn()) {
        message.error('请先登录（填写 GitHub Token）')
        return
      }

      const latest = await readClockins<Array<Omit<ClockInRecord, 'key'>>>()
      if (!latest.ok) throw new Error(latest.error)
      const items = latest.data
      const nextId = items.length ? Math.max(...items.map((r) => r.id)) + 1 : 1
      const newRecord = {
        id: nextId,
        name,
        clockInAt: new Date().toISOString(),
        status: values.status,
      }
      items.unshift(newRecord)
      await writeClockins(items, `clockins: add #${nextId}`)

      // Optimistic UI update: show immediately, then refresh from GitHub.
      setData((prev) => [{ ...newRecord, key: String(newRecord.id) }, ...prev])
      // GitHub raw may be eventually consistent; refresh a bit later to ensure newest view.
      setTimeout(() => {
        reload().catch(() => {})
      }, 1200)

      message.success('打卡成功')
      form.setFieldsValue({ name: '' })
    } catch (e) {
      console.error(e)
      message.error('打卡失败（请确认数据源配置正确 + Token 有写入权限）')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    setLoading(true)
    try {
      if (!isLoggedIn()) {
        message.error('请先登录（填写 GitHub Token）')
        return
      }

      const latest = await readClockins<Array<Omit<ClockInRecord, 'key'>>>()
      if (!latest.ok) throw new Error(latest.error)
      const next = latest.data.filter((r) => r.id !== id)
      await writeClockins(next, `clockins: delete #${id}`)
      await reload()
      message.success('已删除')
    } catch (e) {
      console.error(e)
      message.error('删除失败（请确认数据源配置正确 + Token 有写入权限）')
    } finally {
      setLoading(false)
    }
  }

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
      {
        title: '操作',
        key: 'action',
        width: 120,
        align: 'center',
        render: (_: unknown, record: ClockInRecord) => (
          <Space>
            <Popconfirm title="确认删除？" okText="删除" cancelText="取消" onConfirm={() => handleDelete(record.id)}>
              <Button type="link" danger icon={<DeleteOutlined />} size="small">
                删除
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [data],
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card>
        <Typography.Title level={4} style={{ marginTop: 0 }}>
          打卡系统（登录后使用）
        </Typography.Title>
        <Form
          form={form}
          layout="inline"
          initialValues={{ name: '', status: '正常' as ClockInStatus }}
          onFinish={handleClockIn}
        >
          <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input placeholder="输入姓名" style={{ width: 240 }} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select<ClockInStatus>
              style={{ width: 140 }}
              options={[
                { value: '正常', label: '正常' },
                { value: '迟到', label: '迟到' },
                { value: '补卡', label: '补卡' },
              ]}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              打卡
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          bordered
          size="middle"
          pagination={{ pageSize: 20, showSizeChanger: true }}
        />
      </Card>
    </div>
  )
}

