import { useLocation } from "react-router-dom"
import { ROUTERS } from "utils/router"
import AdminSidebar from "../sidebar"

const MasterAdminLayout = ({ children, ...props }) => {
  const location = useLocation()
  const isLoginPage = location.pathname === ROUTERS.ADMIN.LOGIN

  return (
    <div className="admin-layout-container" {...props}>
      {!isLoginPage && <AdminSidebar />}
      <main className={`admin-main-content ${isLoginPage ? "login-page" : ""}`}>{children}</main>
    </div>
  )
}

export default MasterAdminLayout

