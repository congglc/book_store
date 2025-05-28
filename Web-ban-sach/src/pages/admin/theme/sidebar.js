"use client"

import { memo, useState } from "react"
import "./sidebar.scss"
import { Link, useLocation } from "react-router-dom"
import { ROUTERS } from "utils/router"
import {
  FaHome,
  FaBook,
  FaShoppingCart,
  FaUsers,
  FaSignOutAlt,
  FaBars,
  FaChartLine,
  FaPlus,
  FaTags,
} from "react-icons/fa"

const AdminSidebar = () => {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  const menuItems = [
    {
      name: "Thống kê",
      path: ROUTERS.ADMIN.DASHBOARD,
      icon: <FaChartLine />,
    },
    {
      name: "Quản lý sách",
      path: ROUTERS.ADMIN.BOOKS,
      icon: <FaBook />,
    },
    {
      name: "Thêm sách mới",
      path: ROUTERS.ADMIN.ADD_BOOK,
      icon: <FaPlus />,
    },
    {
      name: "Quản lý đơn hàng",
      path: ROUTERS.ADMIN.ORDERS,
      icon: <FaShoppingCart />,
    },
    {
      name: "Quản lý khách hàng",
      path: ROUTERS.ADMIN.CUSTOMERS,
      icon: <FaUsers />,
    },
    {
      name: "Quản lý danh mục",
      path: ROUTERS.ADMIN.CATEGORIES,
      icon: <FaTags />,
    },
  ]

  const toggleSidebar = () => {
    setCollapsed(!collapsed)
  }

  const handleLogout = () => {
    localStorage.removeItem("isAdmin")
    window.location.href = ROUTERS.ADMIN.LOGIN
  }

  return (
    <div className={`admin-sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">AB</div>
        <h2 className="sidebar-title">AyaBook Admin</h2>
        <button className="collapse-button" onClick={toggleSidebar}>
          <FaBars />
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item, index) => (
            <li key={index} className={location.pathname === item.path ? "active" : ""}>
              <Link to={item.path}>
                <span className="icon">{item.icon}</span>
                <span className="text">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button className="logout-button" onClick={handleLogout}>
          <span className="icon">
            <FaSignOutAlt />
          </span>
          <span className="text">Đăng xuất</span>
        </button>
      </div>
    </div>
  )
}

export default memo(AdminSidebar)

