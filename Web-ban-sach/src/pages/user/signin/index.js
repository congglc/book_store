"use client"

import { memo, useState } from "react"
import "./style.scss"
import { ROUTERS } from "utils/router"
import { Link, useNavigate } from "react-router-dom"
import { authAPI } from "../../../utils/api"

const Signin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })

    // Xóa lỗi khi người dùng nhập lại
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ"
    }

    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu"
    }

    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      const response = await authAPI.login({
        email: formData.email,
        password: formData.password,
      })
      const { user, token } = response.data.data
      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(user))
      navigate(ROUTERS.USER.HOME)
    } catch (err) {
      setErrors({ ...errors, password: "Email hoặc mật khẩu không đúng!" })
    }
  }

  const handleCloseClick = () => {
    navigate(ROUTERS.USER.HOME)
  }

  return (
    <div className="signin-page">
      <div className="signin-container">
        <h1 className="signin-title">CHÀO MỪNG BẠN ĐẾN VỚI AYA BOOK</h1>

        <div className="signin-form-container">
          <button className="close-button" onClick={handleCloseClick}>
            <span className="close-icon">✕</span>
          </button>

          <h2 className="form-title">Đăng nhập</h2>

          <form onSubmit={handleSubmit} className="signin-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-container">
                <span className="input-icon">✉</span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? "error" : ""}
                />
              </div>
              {errors.email && <div className="error-message">{errors.email}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Mật khẩu</label>
              <div className="input-container">
                <span className="input-icon">🔒</span>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={errors.password ? "error" : ""}
                />
              </div>
              {errors.password && <div className="error-message">{errors.password}</div>}
            </div>

            <div className="form-options">
              <div className="remember-me">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                />
                <label htmlFor="rememberMe">Nhớ mật khẩu</label>
              </div>

              <a href="/quen-mat-khau" className="forgot-password">
                Quên mật khẩu
              </a>
            </div>

            <button type="submit" className="signin-button">
              Đăng nhập
            </button>
          </form>

          <div className="register-link">
            <p>
              Không nhớ tài khoản?{" "}
              <Link to={ROUTERS.USER.SIGNUP} className="signup-link">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(Signin)

