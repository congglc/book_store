"use client"

import { memo, useState, useEffect } from "react"
import "./style.scss"
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaUser, FaBuilding, FaRegBuilding } from "react-icons/fa"
import { MdOutlineDisabledByDefault } from "react-icons/md"
import { useNavigate } from "react-router-dom"
import { formatPrice } from "utils/formatter"
import { ROUTERS } from "utils/router"
import { orderAPI } from "../../../utils/api"

const Checkout = () => {
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([])
  const [subtotal, setSubtotal] = useState(0)
  const [shippingFee, setShippingFee] = useState(20000)
  const [discount, setDiscount] = useState(0)
  const [total, setTotal] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState("cod")
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    province: "",
    district: "",
    ward: "",
    address: "",
    notes: "",
  })
  const [formErrors, setFormErrors] = useState({})
  const [confirmed, setConfirmed] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)

    // Lấy dữ liệu giỏ hàng từ localStorage
    const cart = JSON.parse(localStorage.getItem("cart") || "[]")
    if (cart.length === 0) {
      navigate(ROUTERS.USER.CART)
      return
    }

    setCartItems(cart)

    // Tính tổng tiền
    const subTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    setSubtotal(subTotal)
    setTotal(subTotal + shippingFee - discount)

    // Lấy thông tin người dùng từ localStorage nếu có
    const savedUserInfo = JSON.parse(localStorage.getItem("userInfo") || "null")
    if (savedUserInfo) {
      setFormData((prevData) => ({
        ...prevData,
        ...savedUserInfo,
      }))
    }
  }, [navigate])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    // Xóa lỗi khi người dùng nhập lại
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null,
      })
    }
  }

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method)
  }

  const handleCheckboxChange = (e) => {
    setConfirmed(e.target.checked)
  }

  const validateForm = () => {
    const errors = {}

    if (!formData.fullName.trim()) {
      errors.fullName = "Vui lòng nhập họ tên"
    }

    if (!formData.phone.trim()) {
      errors.phone = "Vui lòng nhập số điện thoại"
    } else if (!/^[0-9]{10}$/.test(formData.phone.trim())) {
      errors.phone = "Số điện thoại không hợp lệ"
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email không hợp lệ"
    }

    if (!formData.province.trim()) {
      errors.province = "Vui lòng chọn tỉnh/thành phố"
    }

    if (!formData.district.trim()) {
      errors.district = "Vui lòng chọn quận/huyện"
    }

    if (!formData.ward.trim()) {
      errors.ward = "Vui lòng chọn phường/xã"
    }

    if (!formData.address.trim()) {
      errors.address = "Vui lòng nhập địa chỉ cụ thể"
    }

    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    if (!confirmed) {
      alert("Vui lòng xác nhận thông tin đơn hàng")
      return
    }

    // Lưu thông tin người dùng vào localStorage
    localStorage.setItem(
      "userInfo",
      JSON.stringify({
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        province: formData.province,
        district: formData.district,
        ward: formData.ward,
        address: formData.address,
      }),
    )

    // Xóa userId nếu có trong formData (để backend tự gán)
    const { userId, ...customerInfo } = formData
    const order = {
      items: cartItems.map(item => ({
        ...item,
        id: item.id || item._id
      })),
      subtotal: subtotal,
      shippingFee: shippingFee,
      discount: discount,
      total: total,
      paymentMethod: paymentMethod,
      customerInfo,
      status: "pending",
      orderDate: new Date().toISOString(),
    }

    try {
      const res = await orderAPI.createOrder(order)
      // Xóa giỏ hàng
      localStorage.setItem("cart", JSON.stringify([]))
      // Chuyển hướng đến trang đặt hàng thành công
      navigate(ROUTERS.USER.ORDER_SUCCESS, {
        state: {
          orderId: res.data.data?._id || res.data.data?.id || res.data.data?.orderId || Date.now(),
          total: total,
        },
      })
    } catch (err) {
      alert("Có lỗi khi đặt hàng. Vui lòng thử lại!")
    }
  }

  const handleExitClick = () => {
    navigate(ROUTERS.USER.CART)
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <button className="exit-button" onClick={handleExitClick}>
          <MdOutlineDisabledByDefault />
        </button>

        <div className="checkout-content">
          <div className="checkout-form-container">
            <div className="section-title">
              <h2>THÔNG TIN NGƯỜI NHẬN</h2>
            </div>

            <form onSubmit={handleSubmit} className="checkout-form">
              <div className="form-group">
                <label htmlFor="fullName">Họ và tên</label>
                <div className="input-with-icon">
                  <FaUser className="input-icon" />
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Bùi Thế Mạnh"
                    className={formErrors.fullName ? "error" : ""}
                  />
                </div>
                {formErrors.fullName && <div className="error-message">{formErrors.fullName}</div>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Số điện thoại</label>
                  <div className="input-with-icon">
                    <FaPhone className="input-icon" />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="0862934398"
                      className={formErrors.phone ? "error" : ""}
                    />
                  </div>
                  {formErrors.phone && <div className="error-message">{formErrors.phone}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <div className="input-with-icon">
                    <FaEnvelope className="input-icon" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Manh@gmail.com"
                      className={formErrors.email ? "error" : ""}
                    />
                  </div>
                  {formErrors.email && <div className="error-message">{formErrors.email}</div>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="province">Chọn Tỉnh/TP</label>
                  <div className="input-with-icon">
                    <FaBuilding className="input-icon" />
                    <input
                      type="text"
                      id="province"
                      name="province"
                      value={formData.province}
                      onChange={handleInputChange}
                      placeholder="Hà Nội"
                      className={formErrors.province ? "error" : ""}
                    />
                  </div>
                  {formErrors.province && <div className="error-message">{formErrors.province}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="district">Chọn Quận/Huyện</label>
                  <div className="input-with-icon">
                    <FaRegBuilding className="input-icon" />
                    <input
                      type="text"
                      id="district"
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      placeholder="Quận Hà Đông"
                      className={formErrors.district ? "error" : ""}
                    />
                  </div>
                  {formErrors.district && <div className="error-message">{formErrors.district}</div>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="ward">Chọn Phường/Xã</label>
                <div className="input-with-icon">
                  <FaRegBuilding className="input-icon" />
                  <input
                    type="text"
                    id="ward"
                    name="ward"
                    value={formData.ward}
                    onChange={handleInputChange}
                    placeholder="Chọn Phường/Xã"
                    className={formErrors.ward ? "error" : ""}
                  />
                </div>
                {formErrors.ward && <div className="error-message">{formErrors.ward}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="address">Địa chỉ</label>
                <div className="input-with-icon">
                  <FaMapMarkerAlt className="input-icon" />
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Chọn Phường/Xã"
                    className={formErrors.address ? "error" : ""}
                  />
                </div>
                {formErrors.address && <div className="error-message">{formErrors.address}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="notes">Ghi chú</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Nhập nội dung"
                  rows="4"
                />
              </div>

              <div className="section-title payment-title">
                <h2>CHỌN PHƯƠNG THỨC THANH TOÁN</h2>
              </div>

              <div className="payment-methods">
                <div
                  className={`payment-method ${paymentMethod === "bank" ? "active" : ""}`}
                  onClick={() => handlePaymentMethodChange("bank")}
                >
                  <input
                    type="radio"
                    id="bank"
                    name="paymentMethod"
                    checked={paymentMethod === "bank"}
                    onChange={() => handlePaymentMethodChange("bank")}
                  />
                  <label htmlFor="bank">Tài khoản ngân hàng</label>
                  <span className="checkmark"></span>
                </div>

                <div
                  className={`payment-method ${paymentMethod === "cod" ? "active" : ""}`}
                  onClick={() => handlePaymentMethodChange("cod")}
                >
                  <input
                    type="radio"
                    id="cod"
                    name="paymentMethod"
                    checked={paymentMethod === "cod"}
                    onChange={() => handlePaymentMethodChange("cod")}
                  />
                  <label htmlFor="cod">Thanh toán tiền mặt</label>
                  <span className="checkmark"></span>
                </div>
              </div>

              <div className="confirm-checkbox">
                <input type="checkbox" id="confirm" checked={confirmed} onChange={handleCheckboxChange} />
                <label htmlFor="confirm">Xác nhận đúng thông tin</label>
              </div>

              <button type="submit" className="checkout-button" disabled={!confirmed}>
                Đặt hàng
              </button>
            </form>
          </div>

          <div className="order-summary">
            <div className="section-title">
              <h2>THÔNG TIN ĐƠN HÀNG</h2>
            </div>

            <div className="summary-content">
              <div className="summary-row">
                <span>Tạm tính:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              <div className="summary-row">
                <span>Giảm giá:</span>
                <span>{formatPrice(discount)}</span>
              </div>

              <div className="summary-row">
                <span>Phí ship:</span>
                <span>{formatPrice(shippingFee)}</span>
              </div>

              <div className="shipping-note">Phí ship tính theo đơn và không giới hạn số lượng sách</div>

              <div className="summary-row total">
                <span>Thành tiền:</span>
                <span>{formatPrice(total)}</span>
              </div>

              <div className="terms-agreement">
                <p>
                  Bằng việc nhấn thanh toán, bạng đồng ý với
                  <a href="/dieu-khoan"> Các điều khoản khách hàng </a>
                  của nhà xuất bản Aya Book
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(Checkout)

