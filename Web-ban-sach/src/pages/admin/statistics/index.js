"use client"

import { memo, useState, useEffect } from "react"
import "./style.scss"
import { FaShoppingCart, FaMoneyBillWave } from "react-icons/fa"
import { Line } from "react-chartjs-2"
import { Chart, registerables } from "chart.js"
import { statsAPI, orderAPI } from "../../../utils/api"
import { formatPrice } from "../../../utils/formatter"

// Đăng ký các thành phần cần thiết cho Chart.js
Chart.register(...registerables)

const Statistics = () => {
  const [revenueStats, setRevenueStats] = useState({
    totalRevenue: 0,
    dailyRevenue: 0,
    weeklyRevenue: 0,
    monthlyRevenue: 0
  })
  const [revenueTimeline, setRevenueTimeline] = useState([])
  const [orderStats, setOrderStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    cancelled: 0
  })
  const [timelineType, setTimelineType] = useState("monthly")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchStatisticsData()
  }, [])

  useEffect(() => {
    fetchRevenueTimeline()
  }, [timelineType])

  const fetchStatisticsData = async () => {
    setLoading(true)
    try {
      // Lấy thống kê doanh thu
      try {
        const revenueResponse = await statsAPI.getRevenueStats()
        const revenueData = revenueResponse.data.data || revenueResponse.data || {}
        
        // Lấy doanh thu theo ngày, tuần, tháng
        const dailyResponse = await statsAPI.getRevenueStats(getDateRange('day'))
        const dailyData = dailyResponse.data.data || dailyResponse.data || {}
        
        const weeklyResponse = await statsAPI.getRevenueStats(getDateRange('week'))
        const weeklyData = weeklyResponse.data.data || weeklyResponse.data || {}
        
        const monthlyResponse = await statsAPI.getRevenueStats(getDateRange('month'))
        const monthlyData = monthlyResponse.data.data || monthlyData.data || {}
        
        setRevenueStats({
          totalRevenue: revenueData.totalRevenue || 0,
          dailyRevenue: dailyData.totalRevenue || 0,
          weeklyRevenue: weeklyData.totalRevenue || 0,
          monthlyRevenue: monthlyData.totalRevenue || 0
        })
      } catch (err) {
        console.error("Error fetching revenue stats:", err)
        setRevenueStats({
          totalRevenue: 0,
          dailyRevenue: 0,
          weeklyRevenue: 0,
          monthlyRevenue: 0
        })
      }

      // Lấy thống kê đơn hàng
      try {
        const orderStatsResponse = await orderAPI.getOrderStats()
        setOrderStats(orderStatsResponse.data.data || orderStatsResponse.data || {
          total: 0,
          pending: 0,
          processing: 0,
          completed: 0,
          cancelled: 0
        })
      } catch (err) {
        console.error("Error fetching order stats:", err)
        setOrderStats({
          total: 0,
          pending: 0,
          processing: 0,
          completed: 0,
          cancelled: 0
        })
      }

      await fetchRevenueTimeline()
    } catch (err) {
      console.error("Error fetching statistics data:", err)
      setError("Có lỗi xảy ra khi tải dữ liệu thống kê. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  const fetchRevenueTimeline = async () => {
    try {
      const timelineResponse = await statsAPI.getRevenueTimeline(timelineType)
      const timelineData = timelineResponse.data.data || timelineResponse.data
      
      // Kiểm tra dữ liệu trước khi gọi map
      if (Array.isArray(timelineData?.data)) {
        setRevenueTimeline(timelineData.data)
      } else if (Array.isArray(timelineData)) {
        setRevenueTimeline(timelineData)
      } else {
        console.error("Invalid timeline data format:", timelineData)
        setRevenueTimeline(generateMockTimelineData(timelineType))
      }
    } catch (err) {
      console.error("Error fetching revenue timeline:", err)
      setRevenueTimeline(generateMockTimelineData(timelineType))
    }
  }

  // Hàm tạo dữ liệu mẫu cho timeline
  const generateMockTimelineData = (type) => {
    if (type === "daily") {
      return Array.from({ length: 30 }, (_, i) => ({
        period: i + 1,
        revenue: Math.floor(Math.random() * 5000000),
        orderCount: Math.floor(Math.random() * 10)
      }))
    } else if (type === "weekly") {
      return Array.from({ length: 52 }, (_, i) => ({
        period: i + 1,
        revenue: Math.floor(Math.random() * 10000000),
        orderCount: Math.floor(Math.random() * 50)
      }))
    } else {
      return Array.from({ length: 12 }, (_, i) => ({
        period: i + 1,
        revenue: Math.floor(Math.random() * 50000000),
        orderCount: Math.floor(Math.random() * 200)
      }))
    }
  }

  // Hàm lấy khoảng thời gian
  const getDateRange = (range) => {
    const today = new Date()
    let startDate = new Date()
    
    if (range === 'day') {
      startDate.setHours(0, 0, 0, 0)
    } else if (range === 'week') {
      startDate.setDate(today.getDate() - 7)
    } else if (range === 'month') {
      startDate.setMonth(today.getMonth() - 1)
    }
    
    return {
      startDate: startDate.toISOString(),
      endDate: today.toISOString()
    }
  }

  // Chuẩn bị dữ liệu cho biểu đồ
  const getChartData = () => {
    let labels = []
    let periodLabel = ""
    
    if (timelineType === "daily") {
      labels = revenueTimeline.map(item => `Ngày ${item.period}`)
      periodLabel = "Ngày"
    } else if (timelineType === "weekly") {
      labels = revenueTimeline.map(item => `Tuần ${item.period}`)
      periodLabel = "Tuần"
    } else {
      const monthNames = [
        "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
        "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
      ]
      labels = revenueTimeline.map(item => monthNames[item.period - 1])
      periodLabel = "Tháng"
    }
    
    return {
      labels,
      datasets: [
        {
          label: "Doanh thu",
          data: revenueTimeline.map(item => item.revenue),
          borderColor: "#36A2EB",
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }
      ]
    }
  }

  const handleTimelineTypeChange = (type) => {
    setTimelineType(type)
  }

  if (loading) {
    return <div className="loading-container">Đang tải dữ liệu...</div>
  }

  if (error) {
    return <div className="error-container">{error}</div>
  }

  return (
    <div className="statistics-page">
      <div className="admin-content">
        <div className="admin-header">
          <h1>Thống kê</h1>
        </div>

        {/* Thống kê tổng quan */}
        <div className="stats-overview">
          <div className="stat-card">
            <div className="stat-icon">
              <FaShoppingCart />
            </div>
            <div className="stat-content">
              <h3>Đơn hàng</h3>
              <p>{orderStats.total || 0}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <FaMoneyBillWave />
            </div>
            <div className="stat-content">
              <h3>Doanh thu</h3>
              <p>{formatPrice(revenueStats.totalRevenue)}</p>
            </div>
          </div>
        </div>

        {/* Thống kê doanh thu */}
        <div className="revenue-stats-container">
          <div className="section-header">
            <h2>Doanh thu</h2>
          </div>
          
          <div className="revenue-stats">
            <div className="revenue-stat-item">
              <h3>Hôm nay:</h3>
              <p>{formatPrice(revenueStats.dailyRevenue)}</p>
            </div>
            <div className="revenue-stat-item">
              <h3>Tuần này:</h3>
              <p>{formatPrice(revenueStats.weeklyRevenue)}</p>
            </div>
            <div className="revenue-stat-item">
              <h3>Tháng này:</h3>
              <p>{formatPrice(revenueStats.monthlyRevenue)}</p>
            </div>
            <div className="revenue-stat-item total">
              <h3>Tổng doanh thu:</h3>
              <p>{formatPrice(revenueStats.totalRevenue)}</p>
            </div>
          </div>
        </div>

        {/* Biểu đồ doanh thu */}
        <div className="revenue-chart-container">
          <div className="section-header">
            <h2>Biểu đồ doanh thu</h2>
            <div className="timeline-controls">
              <button 
                className={`timeline-button ${timelineType === "daily" ? "active" : ""}`}
                onClick={() => handleTimelineTypeChange("daily")}
              >
                Ngày
              </button>
              <button 
                className={`timeline-button ${timelineType === "weekly" ? "active" : ""}`}
                onClick={() => handleTimelineTypeChange("weekly")}
              >
                Tuần
              </button>
              <button 
                className={`timeline-button ${timelineType === "monthly" ? "active" : ""}`}
                onClick={() => handleTimelineTypeChange("monthly")}
              >
                Tháng
              </button>
            </div>
          </div>
          
          <div className="chart-container">
            <Line 
              data={getChartData()} 
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return `Doanh thu: ${formatPrice(context.raw)}`
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        if (value >= 1000000) {
                          return (value / 1000000) + 'tr'
                        }
                        return value
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(Statistics)


