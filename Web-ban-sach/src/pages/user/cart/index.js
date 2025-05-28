"use client"

import { memo, useEffect, useState } from "react"
import "./style.scss"
import { Link, useNavigate } from "react-router-dom"
import { FaTrash, FaArrowLeft } from "react-icons/fa"
import { formatPrice } from "utils/formatter"
import { ROUTERS } from "utils/router"

const Cart = () => {
  const [cartItems, setCartItems] = useState([])
  const [totalPrice, setTotalPrice] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo(0, 0)
    loadCartItems()
  }, [])

  const loadCartItems = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]")
    setCartItems(cart)

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    setTotalPrice(total)
  }

  const handleQuantityChange = (id, change) => {
    const updatedCart = cartItems.map((item) => {
      if (item.id === id) {
        const newQuantity = item.quantity + change
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item
      }
      return item
    })

    localStorage.setItem("cart", JSON.stringify(updatedCart))
    setCartItems(updatedCart)

    const total = updatedCart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    setTotalPrice(total)
  }

  const handleRemoveItem = (id) => {
    const updatedCart = cartItems.filter((item) => item.id !== id)
    localStorage.setItem("cart", JSON.stringify(updatedCart))
    setCartItems(updatedCart)

    const total = updatedCart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    setTotalPrice(total)
  }

  const handleClearCart = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi giỏ hàng?")) {
      localStorage.setItem("cart", JSON.stringify([]))
      setCartItems([])
      setTotalPrice(0)
    }
  }

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert("Giỏ hàng của bạn đang trống. Vui lòng thêm sản phẩm vào giỏ hàng.")
      return
    }

    navigate(ROUTERS.USER.CHECKOUT)
  }

  return (
    <div className="cart-page">
      <div className="container">
        <div className="cart-header">
          <h1>Giỏ hàng của bạn</h1>
          <p>{cartItems.length} sản phẩm</p>
        </div>

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <h2>Giỏ hàng trống</h2>
            <p>Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
            <Link to={ROUTERS.USER.SHOP} className="continue-shopping-btn">
              <FaArrowLeft /> Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items">
              <table className="cart-table">
                <thead>
                  <tr>
                    <th className="product-col">Sản phẩm</th>
                    <th className="price-col">Đơn giá</th>
                    <th className="quantity-col">Số lượng</th>
                    <th className="total-col">Thành tiền</th>
                    <th className="action-col">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item.id} className="cart-item">
                      <td className="product-col">
                        <div className="product-info">
                          <Link to={`/sach/${item.id}`}>
                            <img src={item.image || "/placeholder.svg"} alt={item.title} className="product-image" />
                          </Link>
                          <div className="product-details">
                            <Link to={`/sach/${item.id}`} className="product-title">
                              {item.title}
                            </Link>
                          </div>
                        </div>
                      </td>
                      <td className="price-col">{formatPrice(item.price)}</td>
                      <td className="quantity-col">
                        <div className="quantity-control">
                          <button
                            className="quantity-btn"
                            onClick={() => handleQuantityChange(item.id, -1)}
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <span className="quantity">{item.quantity}</span>
                          <button className="quantity-btn" onClick={() => handleQuantityChange(item.id, 1)}>
                            +
                          </button>
                        </div>
                      </td>
                      <td className="total-col">{formatPrice(item.price * item.quantity)}</td>
                      <td className="action-col">
                        <button className="remove-btn" onClick={() => handleRemoveItem(item.id)} title="Xóa sản phẩm">
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="cart-actions">
                <Link to={ROUTERS.USER.SHOP} className="continue-shopping-btn">
                  <FaArrowLeft /> Tiếp tục mua sắm
                </Link>
                <button className="clear-cart-btn" onClick={handleClearCart}>
                  <FaTrash /> Xóa giỏ hàng
                </button>
              </div>
            </div>

            <div className="cart-summary">
              <h2>Thông tin đơn hàng</h2>
              <div className="summary-row">
                <span>Tạm tính:</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="summary-row">
                <span>Giảm giá:</span>
                <span>0đ</span>
              </div>
              <div className="summary-row total">
                <span>Thành tiền:</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <button className="checkout-btn" onClick={handleCheckout}>
                Tiến hành thanh toán
              </button>
              <div className="cart-note">
                <p>
                  Bằng việc nhấn thanh toán, bạn đồng ý với <Link to="/dieu-khoan">Điều khoản dịch vụ</Link> của AyaBook
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default memo(Cart)

