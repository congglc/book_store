import React from "react"
import { Link } from "react-router-dom"
import { ROUTERS } from "utils/router"
import "./style.scss"

const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1>404</h1>
        <h2>Trang không tồn tại</h2>
        <p>Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.</p>
        <div className="not-found-actions">
          <Link to={ROUTERS.USER.HOME} className="back-home-btn">
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound
