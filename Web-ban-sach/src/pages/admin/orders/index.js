"use client"

import { memo, useState, useEffect } from "react"
import "./style.scss"
import { FaEye, FaSearch, FaFilter } from "react-icons/fa"
import { formatPrice } from "utils/formatter"
import { orderAPI } from "../../../utils/api"

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [ordersPerPage] = useState(10)
  const [selectedOrder, setSelectedOrder] = useState(null)

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getAllOrders({
        page: currentPage,
        limit: ordersPerPage,
        status: selectedStatus !== "all" ? selectedStatus : undefined,
        search: searchTerm || undefined,
      })
      
      console.log("Orders API response:", response.data)
      
      // Chuẩn hóa cấu trúc dữ liệu trả về
      const data = response.data.data || response.data || []
      
      if (Array.isArray(data)) {
        setOrders(data)
        setFilteredOrders(data)
      } else {
        console.error("Unexpected data structure:", data)
        setOrders([])
        setFilteredOrders([])
      }
    } catch (err) {
      console.error("Error fetching orders:", err)
      setOrders([])
      setFilteredOrders([])
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [currentPage, ordersPerPage, selectedStatus, searchTerm])

  useEffect(() => {
    // Lọc đơn hàng dựa trên từ khóa tìm kiếm và trạng thái
    let results = orders

    if (searchTerm) {
      results = results.filter(
        (order) =>
          order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customer.phone.includes(searchTerm) ||
          order.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.id.toString().includes(searchTerm),
      )
    }

    if (selectedStatus !== "all") {
      results = results.filter((order) => order.status === selectedStatus)
    }

    setFilteredOrders(results)
    setCurrentPage(1) // Reset về trang đầu tiên khi lọc
  }, [searchTerm, selectedStatus, orders])

  // Tính toán đơn hàng hiển thị trên trang hiện tại
  const indexOfLastOrder = currentPage * ordersPerPage
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage
  const currentOrders = (filteredOrders || []).slice(indexOfFirstOrder, indexOfLastOrder)

  // Thay đổi trang
  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  const handleViewOrder = (order) => {
    console.log("Original order data:", order);
    
    // Chuẩn hóa dữ liệu đơn hàng để phù hợp với cấu trúc hiển thị
    const normalizedOrder = {
      id: order._id,
      customer: {
        name: order.customerInfo?.fullName,
        phone: order.customerInfo?.phone,
        email: order.customerInfo?.email,
        address: `${order.customerInfo?.address}, ${order.customerInfo?.ward}, ${order.customerInfo?.district}, ${order.customerInfo?.province}`
      },
      orderDate: order.createdAt || order.orderDate,
      paymentMethod: order.paymentMethod,
      status: order.status,
      items: order.items || [],
      total: order.subtotal || 0,
      shippingFee: order.shippingFee || 0,
      discount: order.discount || 0,
      finalTotal: order.total || 0,
      notes: order.customerInfo?.notes || ""
    };
    
    console.log("Normalized order data:", normalizedOrder);
    setSelectedOrder(normalizedOrder);
  };

  const handleCloseDetail = () => {
    setSelectedOrder(null)
  }

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      if (!orderId) {
        console.error("Missing order ID");
        alert("Không thể cập nhật: ID đơn hàng không hợp lệ");
        return;
      }
      
      console.log("Updating order status for ID:", orderId, "New status:", newStatus);
      
      // Gọi API cập nhật trạng thái
      const response = await orderAPI.updateOrderStatus(orderId, { status: newStatus });
      console.log("Update status response:", response);
      
      // Cập nhật UI sau khi API thành công
      const updatedOrders = orders.map((order) => {
        if (order._id === orderId) {
          return { ...order, status: newStatus };
        }
        return order;
      });

      setOrders(updatedOrders);
      setFilteredOrders(updatedOrders);

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }

      alert(`Đã cập nhật trạng thái đơn hàng thành ${getStatusText(newStatus)}`);
      
      // Tải lại danh sách đơn hàng
      fetchOrders();
      
    } catch (err) {
      console.error("Error updating order status:", err);
      alert(`Lỗi cập nhật trạng thái: ${err.message || "Vui lòng thử lại sau"}`);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "completed":
        return "status-completed"
      case "pending":
        return "status-pending"
      case "processing":
        return "status-processing"
      case "cancelled":
        return "status-cancelled"
      default:
        return ""
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return "Hoàn thành"
      case "pending":
        return "Chờ xác nhận"
      case "processing":
        return "Đang xử lý"
      case "cancelled":
        return "Đã hủy"
      default:
        return status
    }
  }

  const getPaymentMethodText = (method) => {
    switch (method) {
      case "cod":
        return "Thanh toán khi nhận hàng"
      case "bank":
        return "Chuyển khoản ngân hàng"
      default:
        return method
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="admin-orders">
      <div className="admin-content">
        <div className="admin-header">
          <h1>Quản lý đơn hàng</h1>
        </div>

        <div className="filter-section">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, số điện thoại, email hoặc mã đơn hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="status-filter">
            <FaFilter className="filter-icon" />
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="processing">Đang xử lý</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
        </div>

        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Ngày đặt</th>
                <th>Tổng tiền</th>
                <th>Phương thức</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {(currentOrders || []).length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data">
                    Không tìm thấy đơn hàng nào
                  </td>
                </tr>
              ) : (
                (currentOrders || []).map((order) => (
                  <tr key={order._id}>
                    <td>#{order._id}</td>
                    <td>
                      <div className="customer-info">
                        <div className="customer-name">{order.customerInfo?.fullName}</div>
                        <div className="customer-phone">{order.customerInfo?.phone}</div>
                      </div>
                    </td>
                    <td>{formatDate(order.createdAt || order.orderDate)}</td>
                    <td>{formatPrice(order.total)}</td>
                    <td>{order.paymentMethod === "cod" ? "COD" : "Chuyển khoản"}</td>
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
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Phân trang */}
        {(filteredOrders || []).length > ordersPerPage && (
          <div className="pagination">
            {Array.from({ length: Math.ceil((filteredOrders || []).length / ordersPerPage) }, (_, i) => (
              <button
                key={i}
                className={`page-button ${currentPage === i + 1 ? "active" : ""}`}
                onClick={() => paginate(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}

        {/* Modal chi tiết đơn hàng */}
        {selectedOrder && (
          <div className="order-detail-modal">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Chi tiết đơn hàng #{selectedOrder.id}</h2>
                <button className="close-button" onClick={handleCloseDetail}>
                  ×
                </button>
              </div>

              <div className="order-detail">
                <div className="detail-section">
                  <h3>Thông tin khách hàng</h3>
                  <div className="customer-details">
                    <p>
                      <strong>Họ tên:</strong> {selectedOrder.customer.name}
                    </p>
                    <p>
                      <strong>Số điện thoại:</strong> {selectedOrder.customer.phone}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedOrder.customer.email}
                    </p>
                    <p>
                      <strong>Địa chỉ:</strong> {selectedOrder.customer.address}
                    </p>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Thông tin đơn hàng</h3>
                  <div className="order-info">
                    <p>
                      <strong>Ngày đặt hàng:</strong> {formatDate(selectedOrder.orderDate)}
                    </p>
                    <p>
                      <strong>Phương thức thanh toán:</strong> {getPaymentMethodText(selectedOrder.paymentMethod)}
                    </p>
                    <p>
                      <strong>Trạng thái:</strong>{" "}
                      <span className={`status-badge ${getStatusClass(selectedOrder.status)}`}>
                        {getStatusText(selectedOrder.status)}
                      </span>
                    </p>
                    {selectedOrder.notes && (
                      <p>
                        <strong>Ghi chú:</strong> {selectedOrder.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Sản phẩm</h3>
                  <table className="order-items-table">
                    <thead>
                      <tr>
                        <th>Sản phẩm</th>
                        <th>Giá</th>
                        <th>Số lượng</th>
                        <th>Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedOrder?.items || []).map((item, index) => (
                        <tr key={index}>
                          <td>{item.title}</td>
                          <td>{formatPrice(item.price)}</td>
                          <td>{item.quantity}</td>
                          <td>{formatPrice(item.price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="detail-section">
                  <h3>Tổng cộng</h3>
                  <div className="order-summary">
                    <div className="summary-row">
                      <span>Tạm tính:</span>
                      <span>{formatPrice(selectedOrder.total)}</span>
                    </div>
                    <div className="summary-row">
                      <span>Phí vận chuyển:</span>
                      <span>{formatPrice(selectedOrder.shippingFee)}</span>
                    </div>
                    {selectedOrder.discount > 0 && (
                      <div className="summary-row">
                        <span>Giảm giá:</span>
                        <span>-{formatPrice(selectedOrder.discount)}</span>
                      </div>
                    )}
                    <div className="summary-row total">
                      <span>Thành tiền:</span>
                      <span>{formatPrice(selectedOrder.finalTotal)}</span>
                    </div>
                  </div>
                </div>

                {selectedOrder.status !== "completed" && selectedOrder.status !== "cancelled" && (
                  <div className="detail-section">
                    <h3>Cập nhật trạng thái</h3>
                    <div className="status-actions">
                      {selectedOrder.status === "pending" && (
                        <button
                          className="status-button processing"
                          onClick={() => handleUpdateStatus(selectedOrder.id, "processing")}
                        >
                          Xác nhận đơn hàng
                        </button>
                      )}
                      {selectedOrder.status === "processing" && (
                        <button
                          className="status-button completed"
                          onClick={() => handleUpdateStatus(selectedOrder.id, "completed")}
                        >
                          Hoàn thành đơn hàng
                        </button>
                      )}
                      <button
                        className="status-button cancelled"
                        onClick={() => handleUpdateStatus(selectedOrder.id, "cancelled")}
                      >
                        Hủy đơn hàng
                      </button>
                    </div>
                  </div>
                )}
                
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

export default memo(Orders)

