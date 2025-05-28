"use client"

import { memo, useEffect, useRef, useState } from "react"
import { FaHeart, FaShoppingCart, FaUserCircle } from "react-icons/fa"
import { Link, useLocation } from "react-router-dom"
import { ROUTERS } from "utils/router"
import "./style.scss"

const Header = () => {
  const location = useLocation()
  const [menu] = useState([
    { name: "Trang Chủ", path: ROUTERS.USER.HOME },
    { name: "Sách theo danh mục", path: "/categories" },
    { name: "Liên hệ với chúng tôi", path: ROUTERS.USER.CONTACT },
  ])
  const [isOpen, setIsOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [user, setUser] = useState(null)
  const headerRef = useRef(null)
  const [showDropdown, setShowDropdown] = useState(false)

  // Lấy số lượng sản phẩm trong giỏ hàng từ localStorage
  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]")
    setCartCount(cart.length)
  }, [location])

  useEffect(() => {
    // Lấy user từ localStorage
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    } else {
      setUser(null)
    }
  }, [location])

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target) && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    window.location.reload()
  }

  return (
    <>
      <button className="menu-toggle" onClick={toggleMenu} aria-label="Mở menu">
        ☰
      </button>
      <header className={`header ${isOpen ? "open" : ""}`} ref={headerRef}>
        <div className="container">
          <div className="row">
            <div className="header_logo">
              <Link to={ROUTERS.USER.HOME}>
                <h1>AyaBook</h1>
              </Link>
            </div>
            <nav className="header_menu">
              <ul>
                {menu?.map((menuItem, menuKey) => {
                  return (
                    <li key={menuKey} className={location.pathname === menuItem.path ? "active" : ""}>
                      <Link to={menuItem?.path}>{menuItem?.name}</Link>
                    </li>
                  )
                })}
              </ul>
            </nav>
            <div className="header_actions">
              <Link to={ROUTERS.USER.CART} className="cart-icon">
                <FaShoppingCart />
                {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
              </Link>
              <div className="header_login">
                {user ? (
                  <div
                    className="user-info"
                    style={{ display: "flex", alignItems: "center", gap: 8, position: "relative", cursor: "pointer" }}
                    onClick={() => setShowDropdown((prev) => !prev)}
                  >
                    <FaUserCircle size={22} style={{ marginRight: 4 }} />
                    <span style={{ fontWeight: 600 }}>{user.name || user.fullName || user.email}</span>
                    <span style={{ marginLeft: 4, fontSize: 12 }}>▼</span>
                    {showDropdown && (
                      <div style={{
                        position: "absolute",
                        top: "100%",
                        right: 0,
                        background: "#fff",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.13)",
                        borderRadius: 8,
                        minWidth: 180,
                        zIndex: 1000,
                        padding: "8px 0"
                      }}>
                        <Link
                          to={ROUTERS.USER.PROFILE}
                          style={{ display: "block", padding: "10px 20px", cursor: "pointer", whiteSpace: "nowrap", color: "#222", textDecoration: "none" }}
                          onClick={() => setShowDropdown(false)}
                        >Thông tin cá nhân</Link>
                        <Link
                          to={ROUTERS.USER.ORDER_HISTORY}
                          style={{ display: "block", padding: "10px 20px", cursor: "pointer", whiteSpace: "nowrap", color: "#222", textDecoration: "none" }}
                          onClick={() => setShowDropdown(false)}
                        >Đơn hàng đã mua</Link>
                        <div
                          style={{ display: "block", padding: "10px 20px", cursor: "pointer", whiteSpace: "nowrap", color: "#222", borderTop: "1px solid #eee", marginTop: 5 }}
                          onClick={() => {
                            handleLogout()
                            setShowDropdown(false)
                          }}
                        >Đăng xuất</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link to={ROUTERS.USER.LOGIN} className="login-button">
                    Đăng nhập
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
export default memo(Header)

