import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Dropdown, Menu, Avatar } from 'antd'
import { UserOutlined, ShoppingOutlined, LogoutOutlined } from '@ant-design/icons'
import { authAPI } from '../utils/api'

const UserDropdown = ({ user }) => {
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await authAPI.logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const menu = (
    <Menu>
      <Menu.Item key="profile">
        <Link to="/profile">Thông tin cá nhân</Link>
      </Menu.Item>
      <Menu.Item key="orders">
        <Link to="/orders">Đơn hàng đã mua</Link>
      </Menu.Item>
      {/* Xóa mục "Quản lý địa chỉ" */}
      <Menu.Divider />
      <Menu.Item key="logout" onClick={handleLogout}>
        <LogoutOutlined /> Đăng xuất
      </Menu.Item>
    </Menu>
  )

  return (
    <Dropdown overlay={menu} trigger={['click']}>
      <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
        <Avatar icon={<UserOutlined />} /> {user?.name || 'Tài khoản'}
      </a>
    </Dropdown>
  )
}

export default UserDropdown