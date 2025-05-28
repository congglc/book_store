import { useLocation } from "react-router-dom"
import Footer from "../footer"
import Header from "../header"

const MasterUserLayout = ({ children, ...props }) => {
  const location = useLocation()
  const isSignInPage = location.pathname === "/dang-nhap"
  const isSignUpPage = location.pathname === "/dang-ky-tai-khoan"
  const isCheckoutPage = location.pathname === "/thanh-toan"
  const isProfilePage = location.pathname === "/thong-tin-ca-nhan"
  const isOrderSuccessPage = location.pathname === "/dat-hang-thanh-cong"

  const hideHeaderFooter = isSignInPage || isSignUpPage

  return (
    <div {...props}>
      {!hideHeaderFooter && <Header />}
      <main
        className={`main-content ${hideHeaderFooter ? "auth-page" : ""} ${isCheckoutPage || isProfilePage || isOrderSuccessPage ? "form-page" : ""}`}
      >
        {children}
      </main>
      {!hideHeaderFooter && <Footer />}
    </div>
  )
}
export default MasterUserLayout

