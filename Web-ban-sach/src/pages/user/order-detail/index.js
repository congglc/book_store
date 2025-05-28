import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card, Typography, Descriptions, Table, Tag, Spin } from 'antd'
import { orderAPI } from '../../../utils/api'

const { Title } = Typography

const OrderDetail = () => {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchOrder()
  }, [orderId])

  const fetchOrder = async () => {
    setLoading(true)
    try {
      const response = await orderAPI.getOrderById(orderId)
      setOrder(response.data.data || response.data)
    } catch (error) {
      setOrder(null)
    }
    setLoading(false)
  }

  const columns = [
    {
      title: 'Sách',
      dataIndex: 'book',
      key: 'book',
      render: (book) => book?.title || '---'
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity'
    },
    {
      title: 'Đơn giá',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `${price?.toLocaleString('vi-VN')}đ`
    },
    {
      title: 'Thành tiền',
      key: 'total',
      render: (_, record) => `${(record.price * record.quantity).toLocaleString('vi-VN')}đ`
    }
  ]

  if (loading) {
    return <div className="flex justify-center items-center h-40"><Spin size="large" /></div>
  }

  if (!order) {
    return <div className="text-center text-gray-500">Không tìm thấy đơn hàng</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Title level={2} className="mb-6">Chi Tiết Đơn Hàng #{order._id || order.id}</Title>
      <Card className="mb-6">
        <Descriptions column={1}>
          <Descriptions.Item label="Ngày đặt">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color={order.status === 'delivered' ? 'green' : order.status === 'cancelled' ? 'red' : 'blue'}>
              {order.status?.toUpperCase()}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Tổng tiền">{order.total?.toLocaleString('vi-VN')}đ</Descriptions.Item>
          <Descriptions.Item label="Người nhận">{order.customerInfo?.fullName}</Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">{order.customerInfo?.phone}</Descriptions.Item>
          <Descriptions.Item label="Địa chỉ">{order.customerInfo?.address}</Descriptions.Item>
        </Descriptions>
      </Card>
      <Card title="Chi Tiết Sản Phẩm">
        <Table columns={columns} dataSource={order.items} rowKey="book" pagination={false} />
      </Card>
    </div>
  )
}

export default OrderDetail 