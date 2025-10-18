import React, { useState, useEffect } from 'react'
import { Table, Button, Space, Popconfirm, DatePicker, Input, Card, message } from 'antd'
import { DeleteOutlined, EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons'
import type { ColumnType } from 'antd/es/table'
import dayjs, { Dayjs } from 'dayjs'

interface Customer {
  key: string
  id: number
  name: string
  softwareType: string
  startDate: string
  endDate: string
}

const STORAGE_KEY = 'customer_data'

// Generate default data
const generateDefaultData = (): Customer[] => {
  const companies = [
    'TechCorp Solutions', 'Global Industries Inc', 'Innovation Labs', 'Digital Dynamics', 
    'Smart Systems Ltd', 'Future Tech Group', 'Advanced Solutions', 'Quantum Computing Co',
    'Cloud Services Inc', 'Data Analytics Corp', 'AI Technologies', 'Cyber Security Pro',
    'Enterprise Systems', 'Network Solutions', 'Software Innovations', 'Tech Pioneers',
    'Digital Transformation', 'Automation Systems', 'Integration Services', 'Platform Solutions',
    'Apex Technology', 'Vector Systems', 'Nexus Corporation', 'Vertex Solutions',
    'Pinnacle Tech', 'Summit Digital', 'Horizon Systems', 'Zenith Technologies',
    'Omega Solutions', 'Alpha Innovations', 'Beta Systems', 'Gamma Corp',
    'Delta Technologies', 'Epsilon Digital', 'Sigma Solutions', 'Theta Systems',
    'Lambda Corp', 'Kappa Tech', 'Omega Dynamics', 'Phoenix Solutions',
    'Aurora Systems', 'Eclipse Technologies', 'Stellar Corp', 'Cosmic Solutions',
    'Nebula Systems', 'Galaxy Tech', 'Constellation Digital', 'Orbit Solutions',
    'Quantum Leap', 'Infinite Systems', 'Precision Tech', 'Excellence Corp'
  ]

  const defaultData: Customer[] = []
  let id = 1

  // Generate 20 ProMax 6.0 entries (2022 onwards)
  for (let i = 0; i < 20; i++) {
    const randomMonths = Math.floor(Math.random() * 24) // 0-24 months from 2022
    const startDate = dayjs('2022-01-01').add(randomMonths, 'month')
      .add(Math.floor(Math.random() * 28), 'day')
      .hour(Math.floor(Math.random() * 24))
      .minute(Math.floor(Math.random() * 60))
      .second(Math.floor(Math.random() * 60))
    
    const endDate = startDate.add(1, 'year').hour(8).minute(0).second(0)

    defaultData.push({
      key: `default-${id}`,
      id: id++,
      name: companies[i],
      softwareType: 'ProMax 6.0',
      startDate: startDate.format('YYYY-MM-DD HH:mm:ss'),
      endDate: endDate.format('YYYY-MM-DD HH:mm:ss')
    })
  }

  // Generate 30 ProMax 5.0 entries (2019 onwards)
  for (let i = 0; i < 30; i++) {
    const randomMonths = Math.floor(Math.random() * 36) // 0-36 months from 2019
    const startDate = dayjs('2019-01-01').add(randomMonths, 'month')
      .add(Math.floor(Math.random() * 28), 'day')
      .hour(Math.floor(Math.random() * 24))
      .minute(Math.floor(Math.random() * 60))
      .second(Math.floor(Math.random() * 60))
    
    const endDate = startDate.add(1, 'year').hour(8).minute(0).second(0)

    defaultData.push({
      key: `default-${id}`,
      id: id++,
      name: companies[20 + i],
      softwareType: 'ProMax 5.0',
      startDate: startDate.format('YYYY-MM-DD HH:mm:ss'),
      endDate: endDate.format('YYYY-MM-DD HH:mm:ss')
    })
  }

  return defaultData
}

const CustomerTable: React.FC = () => {
  const [data, setData] = useState<Customer[]>([])
  const [editingKey, setEditingKey] = useState<string>('')
  const [editingRecord, setEditingRecord] = useState<Customer | null>(null)
  const [clickCount, setClickCount] = useState<number>(0)
  const [clickTimer, setClickTimer] = useState<number | null>(null)
  const [pageSize, setPageSize] = useState<number>(10)
  const [currentPage, setCurrentPage] = useState<number>(1)

  // Load data from localStorage or generate default data
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY)
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        setData(parsedData)
      } catch (error) {
        console.error('Failed to load data:', error)
        message.error('Failed to load data')
      }
    } else {
      // Generate and save default data if no data exists
      const defaultData = generateDefaultData()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData))
      setData(defaultData)
    }
  }, [])

  // Save data to localStorage
  const saveData = (newData: Customer[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData))
      setData(newData)
    } catch (error) {
      console.error('Failed to save data:', error)
      message.error('Failed to save data')
    }
  }

  // Check if editing
  const isEditing = (record: Customer) => record.key === editingKey

  // Start editing
  const edit = (record: Customer) => {
    setEditingKey(record.key)
    setEditingRecord({ ...record })
  }

  // Cancel editing
  const cancel = () => {
    setEditingKey('')
    setEditingRecord(null)
  }

  // Save edit
  const save = () => {
    if (!editingRecord) return

    if (!editingRecord.name.trim()) {
      message.error('Customer name cannot be empty')
      return
    }

    if (!editingRecord.startDate || !editingRecord.endDate) {
      message.error('Please select activation start and end date')
      return
    }

    const newData = [...data]
    const index = newData.findIndex((item) => editingKey === item.key)
    if (index > -1) {
      newData[index] = editingRecord
      saveData(newData)
      setEditingKey('')
      setEditingRecord(null)
      message.success('Saved successfully')
    }
  }

  // Add new row
  const handleAdd = () => {
    const newId = data.length > 0 ? Math.max(...data.map(item => item.id)) + 1 : 1
    const newData: Customer = {
      key: `${Date.now()}`,
      id: newId,
      name: '',
      softwareType: '',
      startDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      endDate: dayjs().add(1, 'year').format('YYYY-MM-DD HH:mm:ss'),
    }
    const updatedData = [...data, newData]
    saveData(updatedData)
    setEditingKey(newData.key)
    setEditingRecord(newData)
    message.success('Added successfully, please edit customer information')
  }

  // Delete row
  const handleDelete = (key: string) => {
    const newData = data.filter((item) => item.key !== key)
    // Reorder sequence numbers
    const reorderedData = newData.map((item, index) => ({
      ...item,
      id: index + 1
    }))
    saveData(reorderedData)
    message.success('Deleted successfully')
  }

  // Update editing record
  const updateEditingRecord = (field: keyof Customer, value: string) => {
    if (editingRecord) {
      setEditingRecord({
        ...editingRecord,
        [field]: value
      })
    }
  }

  // Handle title click
  const handleTitleClick = () => {
    // Clear previous timer if exists
    if (clickTimer) {
      clearTimeout(clickTimer)
    }

    const newCount = clickCount + 1

    if (newCount >= 5) {
      // Trigger add customer after 5 clicks
      handleAdd()
      setClickCount(0)
      setClickTimer(null)
    } else {
      setClickCount(newCount)
      // Reset count after 2 seconds if no more clicks
      const timer = setTimeout(() => {
        setClickCount(0)
      }, 2000)
      setClickTimer(timer)
    }
  }

  const columns: ColumnType<Customer>[] = [
    {
      title: 'No.',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      align: 'center',
      sorter: (a, b) => a.id - b.id,
      defaultSortOrder: 'ascend',
    },
    {
      title: 'Customer Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text: string, record: Customer) => {
        if (isEditing(record)) {
          return (
            <Input
              value={editingRecord?.name}
              onChange={(e) => updateEditingRecord('name', e.target.value)}
              placeholder="Enter customer name"
            />
          )
        }
        return text
      },
    },
    {
      title: 'Software Type',
      dataIndex: 'softwareType',
      key: 'softwareType',
      width: 150,
      sorter: (a, b) => a.softwareType.localeCompare(b.softwareType),
      render: (text: string, record: Customer) => {
        if (isEditing(record)) {
          return (
            <Input
              value={editingRecord?.softwareType}
              onChange={(e) => updateEditingRecord('softwareType', e.target.value)}
              placeholder="Enter software type"
            />
          )
        }
        return text
      },
    },
    {
      title: 'Activation Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 220,
      sorter: (a, b) => dayjs(a.startDate).unix() - dayjs(b.startDate).unix(),
      render: (text: string, record: Customer) => {
        if (isEditing(record)) {
          return (
            <DatePicker
              showTime
              value={editingRecord?.startDate ? dayjs(editingRecord.startDate) : null}
              onChange={(date: Dayjs | null) => {
                if (date) {
                  updateEditingRecord('startDate', date.format('YYYY-MM-DD HH:mm:ss'))
                }
              }}
              style={{ width: '100%' }}
              placeholder="Select start date"
              format="YYYY-MM-DD HH:mm:ss"
            />
          )
        }
        return text
      },
    },
    {
      title: 'Activation End Date',
      dataIndex: 'endDate',
      key: 'endDate',
      width: 220,
      sorter: (a, b) => dayjs(a.endDate).unix() - dayjs(b.endDate).unix(),
      render: (text: string, record: Customer) => {
        if (isEditing(record)) {
          return (
            <DatePicker
              showTime
              value={editingRecord?.endDate ? dayjs(editingRecord.endDate) : null}
              onChange={(date: Dayjs | null) => {
                if (date) {
                  updateEditingRecord('endDate', date.format('YYYY-MM-DD HH:mm:ss'))
                }
              }}
              style={{ width: '100%' }}
              placeholder="Select end date"
              format="YYYY-MM-DD HH:mm:ss"
            />
          )
        }
        return text
      },
    },
    {
      title: 'Action',
      key: 'action',
      width: 150,
      align: 'center',
      render: (_: unknown, record: Customer) => {
        const editable = isEditing(record)
        return editable ? (
          <Space>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={save}
              size="small"
            >
              Save
            </Button>
            <Button
              icon={<CloseOutlined />}
              onClick={cancel}
              size="small"
            >
              Cancel
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
              Edit
            </Button>
            <Popconfirm
              title="Are you sure you want to delete this record?"
              onConfirm={() => handleDelete(record.key)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
                disabled={editingKey !== ''}
                size="small"
              >
                Delete
              </Button>
            </Popconfirm>
          </Space>
        )
      },
    },
  ]

  return (
    <Card
      title={
        <div 
          onClick={handleTitleClick} 
          style={{ 
            cursor: 'pointer', 
            userSelect: 'none',
            display: 'inline-block'
          }}
        >
          Customer Activation Information {clickCount > 0 && `(${clickCount}/5)`}
        </div>
      }
      style={{ maxWidth: 1500, margin: '0 auto' }}
    >
      <Table
        columns={columns}
        dataSource={data}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} records`,
          pageSizeOptions: ['10', '20', '50', '100'],
          onChange: (page, newPageSize) => {
            setCurrentPage(page)
            if (newPageSize !== pageSize) {
              setPageSize(newPageSize)
            }
          },
        }}
        bordered
        size="middle"
      />
    </Card>
  )
}

export default CustomerTable

