"use client"

import { memo, useState, useEffect } from "react"
import "./style.scss"
import { FaShoppingCart, FaMoneyBillWave } from "react-icons/fa"
import { Link } from "react-router-dom"
import { ROUTERS } from "utils/router"
import { formatPrice } from "utils/formatter"
import { statsAPI, orderAPI } from "../../../utils/api"

const Dashboard = () => {
  const [stats, setStats] = useState({
    pendingOrders: 0,
    totalRevenue: 0,
  })

  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      try {
        // Lấy thống kê tổng quan
        try {
          // Lấy dữ liệu doanh thu
          const revenueResponse = await statsAPI.getRevenueStats()
          const revenueData = revenueResponse?.data?.data || revenueResponse?.data || { totalRevenue: 0 }
          
          // Lấy dữ liệu đơn hàng
          const ordersResponse = await orderAPI.getOrderStats()
          const ordersData = ordersResponse?.data?.data || ordersResponse?.data || { pending: 0 }
          
          console.log("API responses:", {
            revenue: revenueData,
            orders: ordersData
          })
          
          setStats({
            pendingOrders: ordersData?.pending || 0,
            totalRevenue: revenueData?.totalRevenue || 0,
          })
        } catch (err) {
          console.error("Error fetching dashboard stats:", err)
          // Fallback nếu API lỗi - giữ nguyên giá trị mặc định
        }

        // Lấy đơn hàng gần đây
        try {
          const recentOrdersResponse = await orderAPI.getRecentOrders(5)
          const ordersData = recentOrdersResponse.data.data || recentOrdersResponse.data || []
          
          // Chuyển đổi dữ liệu từ API sang định dạng hiển thị
          const formattedOrders = ordersData.map(order => ({
            id: order._id,
            customer: order.customerInfo?.fullName || "Khách hàng",
            date: new Date(order.createdAt).toLocaleDateString('vi-VN'),
            total: order.total,
            status: order.status
          }))
          
          setRecentOrders(formattedOrders)
        } catch (err) {
          console.error("Error fetching recent orders:", err)
          // Fallback nếu API lỗi
          setRecentOrders([
            {
              id: 1,
              customer: "Nguyễn Văn A",
              date: "15/03/2023",
              total: 270000,
              status: "completed",
            },
            {
              id: 2,
              customer: "Trần Thị B",
              date: "15/03/2023",
              total: 540000,
              status: "pending",
            },
            {
              id: 3,
              customer: "Lê Văn C",
              date: "16/03/2023",
              total: 180000,
              status: "processing",
            },
            {
              id: 4,
              customer: "Phạm Thị D",
              date: "16/03/2023",
              total: 320000,
              status: "cancelled",
            },
            {
              id: 5,
              customer: "Hoàng Văn E",
              date: "17/03/2023",
              total: 450000,
              status: "pending",
            },
          ])
        }

      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError("Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Hàm chuyển đổi trạng thái đơn hàng sang tiếng Việt
  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Chờ xác nhận"
      case "processing":
        return "Đang xử lý"
      case "completed":
        return "Hoàn thành"
      case "cancelled":
        return "Đã hủy"
      default:
        return "Không xác định"
    }
  }

  // Hàm lấy class CSS cho trạng thái đơn hàng
  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "pending"
      case "processing":
        return "processing"
      case "completed":
        return "completed"
      case "cancelled":
        return "cancelled"
      default:
        return ""
    }
  }

  if (loading) {
    return <div className="loading-container">Đang tải dữ liệu...</div>
  }

  if (error) {
    return <div className="error-container">{error}</div>
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-content">
        <div className="admin-header">
          <h1>Dashboard</h1>
        </div>

        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-icon">
              <FaShoppingCart />
            </div>
            <div className="stat-content">
              <h3>Đơn hàng chờ xử lý</h3>
              <p>{stats.pendingOrders}</p>
            </div>
            <Link to={ROUTERS.ADMIN.ORDERS} className="stat-link">
              Xem
            </Link>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <FaMoneyBillWave />
            </div>
            <div className="stat-content">
              <h3>Doanh thu</h3>
              <p>{formatPrice(stats.totalRevenue)}</p>
            </div>
            <Link to={ROUTERS.ADMIN.STATISTICS} className="stat-link">
              Chi tiết
            </Link>
          </div>
        </div>

        <div className="dashboard-sections">
          <div className="recent-orders">
            <div className="section-header">
              <h2>Đơn hàng gần đây</h2>
              <Link to={ROUTERS.ADMIN.ORDERS} className="view-all">
                Xem tất cả
              </Link>
            </div>

            <div className="orders-table-container">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Khách hàng</th>
                    <th>Ngày</th>
                    <th>Tổng tiền</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{order.customer}</td>
                      <td>{order.date}</td>
                      <td>{formatPrice(order.total)}</td>
                      <td>
                        <span className={`status-badge ${getStatusClass(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default memo(Dashboard)

