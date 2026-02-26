import { Button, Card, DatePicker, Input, InputNumber, Popconfirm, Select, Space, Spin, Table, Typography, message } from 'antd'
import type { ColumnType } from 'antd/es/table'
import dayjs, { Dayjs } from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
import { DeleteOutlined, EditOutlined, PlusOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons'
import { readPayments, writePayments } from '../data/githubStore'
import { isLoggedIn } from '../auth/auth'

export type PaymentStatus = '已支付' | '未支付'

export interface PaymentRecord {
  key: string
  id: number
  name: string
  amount: number
  createdAt: string // ISO string
  paidAt?: string
  status: PaymentStatus
}

const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss'

export default function PaymentTable({
  title = '支付流水',
  readOnly = false,
}: {
  title?: string
  readOnly?: boolean
}) {
  const [data, setData] = useState<PaymentRecord[]>([])
  const [editingKey, setEditingKey] = useState<string>('')
  const [editingRecord, setEditingRecord] = useState<PaymentRecord | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      try {
        const res = await readPayments<Array<Omit<PaymentRecord, 'key'>>>()
        if (!res.ok) throw new Error(res.error)
        setData(res.data.map((r) => ({ ...r, key: String(r.id) })))
      } catch (e) {
        console.error(e)
        message.error('加载支付流水失败')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  const reload = async () => {
    setLoading(true)
    try {
      const res = await readPayments<Array<Omit<PaymentRecord, 'key'>>>()
      if (!res.ok) throw new Error(res.error)
      setData(res.data.map((r) => ({ ...r, key: String(r.id) })))
    } finally {
      setLoading(false)
    }
  }

  const isEditing = (record: PaymentRecord) => record.key === editingKey

  const edit = (record: PaymentRecord) => {
    setEditingKey(record.key)
    setEditingRecord({ ...record })
  }

  const cancel = () => {
    if (editingKey) {
      const current = data.find((r) => r.key === editingKey)
      const shouldDropEmptyNewRow =
        !!current && current.id === 0 && !current.name.trim() && current.amount === 0 && !current.paidAt
      if (shouldDropEmptyNewRow) {
        setData((prev) => prev.filter((r) => r.key !== editingKey))
      }
    }
    setEditingKey('')
    setEditingRecord(null)
  }

  const updateEditingRecord = <K extends keyof PaymentRecord>(field: K, value: PaymentRecord[K]) => {
    setEditingRecord((prev) => (prev ? { ...prev, [field]: value } : prev))
  }

  const save = async () => {
    if (!editingRecord) return
    if (!editingRecord.name.trim()) {
      message.error('姓名不能为空')
      return
    }
    if (!Number.isFinite(editingRecord.amount) || editingRecord.amount < 0) {
      message.error('金额必须大于等于 0')
      return
    }

    setLoading(true)
    try {
      if (!isLoggedIn()) {
        message.error('请先登录（填写 GitHub Token）')
        return
      }

      const latest = await readPayments<Array<Omit<PaymentRecord, 'key'>>>()
      if (!latest.ok) throw new Error(latest.error)
      const items = latest.data

      const nowIso = new Date().toISOString()
      const fixedPaidAt =
        editingRecord.status === '已支付'
          ? editingRecord.paidAt || nowIso
          : editingRecord.paidAt || undefined

      if (editingRecord.id === 0) {
        const nextId = items.length ? Math.max(...items.map((r) => r.id)) + 1 : 1
        items.push({
          id: nextId,
          name: editingRecord.name.trim(),
          amount: editingRecord.amount,
          createdAt: nowIso,
          paidAt: fixedPaidAt,
          status: editingRecord.status,
        })
        await writePayments(items, `payments: add #${nextId}`)
      } else {
        const idx = items.findIndex((r) => r.id === editingRecord.id)
        if (idx === -1) throw new Error('not_found')
        items[idx] = {
          ...items[idx],
          name: editingRecord.name.trim(),
          amount: editingRecord.amount,
          paidAt: fixedPaidAt,
          status: editingRecord.status,
        }
        await writePayments(items, `payments: update #${editingRecord.id}`)
      }

      cancel()
      await reload()
      message.success('已保存')
    } catch (e) {
      console.error(e)
      message.error('保存失败（请确认数据源配置正确 + Token 有写入权限）')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    const record: PaymentRecord = {
      key: `new-${Date.now()}`,
      id: 0,
      name: '',
      amount: 0,
      createdAt: new Date().toISOString(),
      paidAt: undefined,
      status: '未支付',
    }
    setData((prev) => [record, ...prev])
    setEditingKey(record.key)
    setEditingRecord(record)
    message.success('已新增一条，请填写信息')
  }

  const handleDelete = async (record: PaymentRecord) => {
    if (record.id === 0) {
      setData((prev) => prev.filter((r) => r.key !== record.key))
      message.success('已删除')
      return
    }

    setLoading(true)
    try {
      if (!isLoggedIn()) {
        message.error('请先登录（填写 GitHub Token）')
        return
      }

      const latest = await readPayments<Array<Omit<PaymentRecord, 'key'>>>()
      if (!latest.ok) throw new Error(latest.error)
      const next = latest.data.filter((r) => r.id !== record.id)
      await writePayments(next, `payments: delete #${record.id}`)
      await reload()
      message.success('已删除')
    } catch (e) {
      console.error(e)
      message.error('删除失败（请确认数据源配置正确 + Token 有写入权限）')
    } finally {
      setLoading(false)
    }
  }

  const columns: ColumnType<PaymentRecord>[] = useMemo(() => {
    const base: ColumnType<PaymentRecord>[] = [
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
        width: 80,
        align: 'center',
        sorter: (a, b) => a.id - b.id,
        defaultSortOrder: 'ascend',
      },
      {
        title: '姓名',
        dataIndex: 'name',
        key: 'name',
        width: 200,
        render: (text: string, record: PaymentRecord) => {
          if (readOnly) return text
          if (isEditing(record)) {
            return (
              <Input
                value={editingRecord?.name}
                onChange={(e) => updateEditingRecord('name', e.target.value)}
                placeholder="输入姓名"
              />
            )
          }
          return text
        },
      },
      {
        title: '金额',
        dataIndex: 'amount',
        key: 'amount',
        width: 140,
        align: 'right',
        sorter: (a, b) => a.amount - b.amount,
        render: (value: number, record: PaymentRecord) => {
          if (readOnly) return value?.toFixed?.(2) ?? String(value)
          if (isEditing(record)) {
            return (
              <InputNumber
                value={editingRecord?.amount}
                onChange={(v) => updateEditingRecord('amount', Number(v ?? 0))}
                min={0}
                style={{ width: '100%' }}
                placeholder="金额"
              />
            )
          }
          return value?.toFixed?.(2) ?? String(value)
        },
      },
      {
        title: '创建时间',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 200,
        sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
        render: (text: string) => dayjs(text).format(DATETIME_FORMAT),
      },
      {
        title: '支付时间',
        dataIndex: 'paidAt',
        key: 'paidAt',
        width: 220,
        sorter: (a, b) => dayjs(a.paidAt || 0).unix() - dayjs(b.paidAt || 0).unix(),
        render: (text: string | undefined, record: PaymentRecord) => {
          if (readOnly) return text ? dayjs(text).format(DATETIME_FORMAT) : '-'
          if (isEditing(record)) {
            return (
              <DatePicker
                showTime
                value={editingRecord?.paidAt ? dayjs(editingRecord.paidAt) : null}
                onChange={(d: Dayjs | null) =>
                  updateEditingRecord('paidAt', d ? d.toISOString() : undefined)
                }
                style={{ width: '100%' }}
                placeholder="选择支付时间"
                format={DATETIME_FORMAT}
              />
            )
          }
          return text ? dayjs(text).format(DATETIME_FORMAT) : '-'
        },
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 140,
        filters: [
          { text: '已支付', value: '已支付' },
          { text: '未支付', value: '未支付' },
        ],
        onFilter: (value, record) => record.status === String(value),
        render: (text: PaymentStatus, record: PaymentRecord) => {
          if (readOnly) return text
          if (isEditing(record)) {
            return (
              <Select<PaymentStatus>
                value={editingRecord?.status}
                onChange={(v) => updateEditingRecord('status', v)}
                style={{ width: '100%' }}
                options={[
                  { value: '已支付', label: '已支付' },
                  { value: '未支付', label: '未支付' },
                ]}
              />
            )
          }
          return text
        },
      },
    ]

    if (readOnly) return base

    base.push({
      title: '操作',
      key: 'action',
      width: 160,
      align: 'center',
      render: (_: unknown, record: PaymentRecord) => {
        const editable = isEditing(record)
        return editable ? (
          <Space>
            <Button type="primary" icon={<SaveOutlined />} onClick={save} size="small">
              保存
            </Button>
            <Button icon={<CloseOutlined />} onClick={cancel} size="small">
              取消
            </Button>
          </Space>
        ) : (
          <Space>
            <Button
              type="link"
              icon={<EditOutlined />}
              disabled={editingKey !== ''}
              onClick={() => edit(record)}
              size="small"
            >
              编辑
            </Button>
            <Popconfirm
              title="确认删除这条记录？"
              onConfirm={() => handleDelete(record)}
              okText="删除"
              cancelText="取消"
            >
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
                disabled={editingKey !== ''}
                size="small"
              >
                删除
              </Button>
            </Popconfirm>
          </Space>
        )
      },
    })

    return base
  }, [data, editingKey, editingRecord, readOnly])

  return (
    <Card
      title={<Typography.Text strong>{title}</Typography.Text>}
      extra={
        readOnly ? null : (
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} disabled={editingKey !== ''}>
            新增
          </Button>
        )
      }
      style={{ maxWidth: 1500, margin: '0 auto' }}
    >
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={data}
          bordered
          size="middle"
          pagination={{ pageSize: 20, showSizeChanger: true }}
        />
      </Spin>
    </Card>
  )
}

