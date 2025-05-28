import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { FaEye, FaShoppingCart } from "react-icons/fa"
import { orderAPI } from "../../../utils/api"
import { ROUTERS } from "../../../utils/router"
import "./style.scss"

const OrderHistory = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      try {
        const res = await orderAPI.getUserOrders()
        setOrders(res?.data?.data || [])
      } catch (err) {
        setError("Không thể tải danh sách đơn hàng.")
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    } catch (error) {
      return dateString
    }
  }

  const formatPrice = (price) => {
    return price?.toLocaleString("vi-VN") + "đ" || "0đ"
  }

  const getStatusText = (status) => {
    switch (status) {
      case "pending": return "Chờ xác nhận"
      case "processing": return "Đang xử lý"
      case "completed": return "Hoàn thành"
      case "cancelled": return "Đã hủy"
      default: return status
    }
  }

  const getStatusClass = (status) => {
    switch (status) {
      case "pending": return "pending"
      case "processing": return "processing"
      case "completed": return "completed"
      case "cancelled": return "cancelled"
      default: return ""
    }
  }

  const handleViewOrder = (order) => {
    setSelectedOrder(order)
  }

  const handleCloseDetail = () => {
    setSelectedOrder(null)
  }

  if (loading) {
    return <div className="order-history-page">
      <div className="container">
        <div className="loading-container">Đang tải đơn hàng...</div>
      </div>
    </div>
  }

  if (error) {
    return <div className="order-history-page">
      <div className="container">
        <div className="error-container">{error}</div>
      </div>
    </div>
  }

  return (
    <div className="order-history-page">
      <div className="container">
        <div className="order-history-header">
          <h1>Lịch sử đơn hàng</h1>
          <p>Xem thông tin và trạng thái các đơn hàng của bạn</p>
        </div>

        <div className="order-history-content">
          {orders.length === 0 ? (
            <div className="empty-orders">
              <div className="empty-icon">🛒</div>
              <h2>Bạn chưa có đơn hàng nào</h2>
              <p>Hãy mua sắm và quay lại đây để xem lịch sử đơn hàng của bạn</p>
              <Link to={ROUTERS.USER.SHOP} className="shop-now-btn">
                <FaShoppingCart /> Mua sắm ngay
              </Link>
            </div>
          ) : (
            <div className="orders-table-container">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Ngày đặt</th>
                    <th>Tổng tiền</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td>#{order._id?.substring(0, 8)}</td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td>{formatPrice(order.total)}</td>
                      <td>
                        <span className={`status-badge ${getStatusClass(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td className="action-buttons">
                        <button className="view-button" onClick={() => handleViewOrder(order)} title="Xem chi tiết">
                          <FaEye />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal chi tiết đơn hàng */}
        {selectedOrder && (
          <div className="order-detail-modal">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Chi tiết đơn hàng #{selectedOrder._id?.substring(0, 8)}</h2>
                <button className="close-button" onClick={handleCloseDetail}>
                  ×
                </button>
              </div>

              <div className="order-detail">
                <div className="detail-section">
                  <h3>Thông tin đơn hàng</h3>
                  <div className="order-details">
                    <p>
                      <strong>Mã đơn hàng:</strong> {selectedOrder._id}
                    </p>
                    <p>
                      <strong>Ngày đặt:</strong> {formatDate(selectedOrder.createdAt)}
                    </p>
                    <p>
                      <strong>Trạng thái:</strong>{" "}
                      <span className={`status-badge ${getStatusClass(selectedOrder.status)}`}>
                        {getStatusText(selectedOrder.status)}
                      </span>
                    </p>
                    <p>
                      <strong>Phương thức:</strong> {selectedOrder.paymentMethod === "cod" ? "Thanh toán khi nhận hàng" : "Chuyển khoản"}
                    </p>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Thông tin khách hàng</h3>
                  <div className="customer-details">
                    <p>
                      <strong>Họ tên:</strong> {selectedOrder.customerInfo?.fullName}
                    </p>
                    <p>
                      <strong>Số điện thoại:</strong> {selectedOrder.customerInfo?.phone}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedOrder.customerInfo?.email}
                    </p>
                    <p>
                      <strong>Địa chỉ:</strong> {selectedOrder.customerInfo?.address}
                    </p>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Sản phẩm đã mua</h3>
                  <div className="product-list">
                    {selectedOrder.items?.map((item, index) => (
                      <div className="product-item" key={index}>
                        {/* Xóa phần ảnh */}
                        <div className="product-info">
                          <div className="product-name">{item.title}</div>
                          <div className="product-price">{formatPrice(item.price)}</div>
                        </div>
                        <div className="product-quantity">x{item.quantity}</div>
                        <div className="product-total">{formatPrice(item.price * item.quantity)}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: "20px", textAlign: "right", fontWeight: "bold" }}>
                    Tổng tiền: <span style={{ color: "#0099cc", fontSize: "1.1rem" }}>{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>
                
                {/* Nút đóng ở cuối modal */}
                <div className="detail-section action-buttons">
                  <button className="close-detail-button" onClick={handleCloseDetail}>
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderHistory 
