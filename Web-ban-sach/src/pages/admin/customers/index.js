"use client"

import { memo, useState, useEffect } from "react"
import "./style.scss"
import { FaSearch, FaEnvelope, FaPhone, FaUserFriends } from "react-icons/fa"
import { authAPI } from "../../../utils/api"

const Customers = () => {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredCustomers, setFilteredCustomers] = useState([])
  const [totalUsers, setTotalUsers] = useState(0)

  useEffect(() => {
    fetchCustomers()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = customers.filter(customer => 
        (customer.name || customer.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.phone || "").includes(searchTerm)
      )
      setFilteredCustomers(filtered)
    } else {
      setFilteredCustomers(customers)
    }
  }, [searchTerm, customers])

  const fetchCustomers = async () => {
    setLoading(true)
    try {
      // Sử dụng API để lấy danh sách khách hàng
      const response = await authAPI.getAllUsers()
      console.log("Customers response:", response.data)
      
      // Kiểm tra cấu trúc dữ liệu trả về
      const data = response.data.data || response.data || []
      
      if (Array.isArray(data)) {
        // Loại bỏ các bản ghi trùng lặp dựa trên email
        const uniqueCustomers = removeDuplicatesByEmail(data)
        setCustomers(uniqueCustomers)
        setFilteredCustomers(uniqueCustomers)
        setTotalUsers(uniqueCustomers.length)
        console.log("Processed customers data:", uniqueCustomers)
      } else {
        console.error("Unexpected data structure:", data)
        setCustomers([])
        setFilteredCustomers([])
        setTotalUsers(0)
      }
    } catch (err) {
      console.error("Error fetching customers:", err)
      setError("Có lỗi xảy ra khi tải danh sách khách hàng. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  // Hàm loại bỏ các bản ghi trùng lặp dựa trên email
  const removeDuplicatesByEmail = (array) => {
    const emailMap = new Map()
    
    return array.filter(item => {
      const email = item.email
      if (!email) return true
      
      if (!emailMap.has(email)) {
        emailMap.set(email, true)
        return true
      }
      return false
    })
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString("vi-VN")
    } catch (error) {
      return "N/A"
    }
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  if (loading && customers.length === 0) {
    return <div className="loading-container">Đang tải dữ liệu...</div>
  }

  if (error) {
    return <div className="error-container">{error}</div>
  }

  return (
    <div className="admin-customers">
      <div className="admin-content">
        <div className="admin-header">
          <h1>Quản lý khách hàng</h1>
        </div>

        {/* Thống kê khách hàng - chỉ hiển thị tổng số */}
        <div className="customer-stats">
          <div className="stat-card">
            <div className="stat-icon">
              <FaUserFriends />
            </div>
            <div className="stat-content">
              <h3>Tổng số khách hàng</h3>
              <p>{totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="search-filter-container">
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm khách hàng..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>
        </div>

        <div className="customers-table-container">
          <table className="customers-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Ngày đăng ký</th>
                <th>Vai trò</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">
                    Không tìm thấy khách hàng nào
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer._id || customer.id}>
                    <td>{customer._id || customer.id}</td>
                    <td>{customer.name || customer.fullName || "N/A"}</td>
                    <td>
                      <div className="email-container">
                        <FaEnvelope className="icon" />
                        <span>{customer.email || "N/A"}</span>
                      </div>
                    </td>
                    <td>
                      <div className="phone-container">
                        <FaPhone className="icon" />
                        <span>{customer.phone || "N/A"}</span>
                      </div>
                    </td>
                    <td>{formatDate(customer.createdAt)}</td>
                    <td>{customer.role || "user"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default memo(Customers)





