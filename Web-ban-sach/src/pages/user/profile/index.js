import { useEffect, useState } from "react"
import "./style.scss"

const Profile = () => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) setUser(JSON.parse(storedUser))
  }, [])

  if (!user) return <div className="profile-page">Bạn chưa đăng nhập.</div>

  return (
    <div className="profile-page">
      <h1>Thông tin cá nhân</h1>
      <div className="profile-info">
        <div><b>Họ tên:</b> {user.name || user.fullName}</div>
        <div><b>Email:</b> {user.email}</div>
        <div><b>Số điện thoại:</b> {user.phone || "Chưa cập nhật"}</div>
        <div><b>Địa chỉ:</b> {user.address || "Chưa cập nhật"}</div>
        <div><b>Vai trò:</b> {user.role || "user"}</div>
      </div>
    </div>
  )
}

export default Profile 