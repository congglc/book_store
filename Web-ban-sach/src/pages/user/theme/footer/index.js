import { memo } from "react"
import "./style.scss"
import { Link } from "react-router-dom"
import { FaFacebook, FaInstagram, FaYoutube, FaTwitter } from "react-icons/fa"

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__content">
          <div className="footer__brand">
            <h2 className="footer__title">AyaBook</h2>
            <ul className="footer__social">
              <li>
                <a href="#" aria-label="Facebook">
                  <FaFacebook />
                </a>
              </li>
              <li>
                <a href="#" aria-label="Instagram">
                  <FaInstagram />
                </a>
              </li>
              <li>
                <a href="#" aria-label="YouTube">
                  <FaYoutube />
                </a>
              </li>
              <li>
                <a href="#" aria-label="Twitter">
                  <FaTwitter />
                </a>
              </li>
            </ul>
            <p className="footer__slogan">Đọc sách mở mang tri thức</p>
            <p className="footer__description">Cung cấp sách hay với giá tốt nhất</p>
          </div>
          <div className="footer__links">
            <h3 className="footer__subtitle">Dịch vụ</h3>
            <ul>
              <li>
                <Link to="/dieu-khoan-su-dung">Điều khoản sử dụng</Link>
              </li>
              <li>
                <Link to="/chinh-sach-bao-mat">Chính sách bảo mật</Link>
              </li>
              <li>
                <Link to="/lien-he">Liên hệ</Link>
              </li>
              <li>
                <Link to="/he-thong-nha-sach">Hệ thống nhà sách</Link>
              </li>
              <li>
                <Link to="/tra-cuu-don-hang">Tra cứu đơn hàng</Link>
              </li>
            </ul>
          </div>
          <div className="footer__support">
            <h3 className="footer__subtitle">Hỗ trợ</h3>
            <ul>
              <li>
                <Link to="/huong-dan-dat-hang">Hướng dẫn đặt hàng</Link>
              </li>
              <li>
                <Link to="/chinh-sach-doi-tra">Chính sách đổi trả - hoàn tiền</Link>
              </li>
              <li>
                <Link to="/chinh-sach-van-chuyen">Chính sách vận chuyển</Link>
              </li>
              <li>
                <Link to="/phuong-thuc-thanh-toan">Phương thức thanh toán</Link>
              </li>
              <li>
                <Link to="/chinh-sach-khach-hang">Chính sách khách hàng</Link>
              </li>
            </ul>
          </div>
          <div className="footer__contact">
            <h3 className="footer__subtitle">Liên Hệ</h3>
            <ul className="footer__info">
              <li>Địa Chỉ: 123 Nguyễn Trãi, Hà Nội</li>
              <li>SĐT: 1900 1348</li>
              <li>Email: info@ayabook.com</li>
              <li>Website: ayabook.com</li>
            </ul>
          </div>
        </div>
        <div className="footer__bottom">
          <p>© 2023 AyaBook. Tất cả các quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  )
}

export default memo(Footer)

