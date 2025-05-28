import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Carousel, Card, Row, Col, Button } from 'antd'
import { bookAPI } from '../../../utils/api'
import { getImageUrl, formatPrice } from '../../../utils/constants'
import RenderWithBooks from '../../../components/RenderWithBooks'
import './style.scss'

const Home = () => {
  const [newArrivals, setNewArrivals] = useState([])
  const [bestsellers, setBestsellers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true)
        
        // Fetch new arrivals
        const newArrivalsResponse = await bookAPI.getNewArrivals(8)
        console.log("New arrivals response:", newArrivalsResponse.data)
        
        // Fetch bestsellers
        const bestsellersResponse = await bookAPI.getBestsellers(8)
        console.log("Bestsellers response:", bestsellersResponse.data)
        
        // Kiểm tra và xử lý dữ liệu trả về
        if (newArrivalsResponse.data && newArrivalsResponse.data.data) {
          const newArrivalsData = newArrivalsResponse.data.data;
          // Kiểm tra cấu trúc dữ liệu
          if (Array.isArray(newArrivalsData)) {
            setNewArrivals(newArrivalsData);
          } else if (newArrivalsData.books && Array.isArray(newArrivalsData.books)) {
            setNewArrivals(newArrivalsData.books);
          } else {
            console.error("Unexpected new arrivals data structure:", newArrivalsData);
            setNewArrivals([]);
          }
        }
        
        if (bestsellersResponse.data && bestsellersResponse.data.data) {
          const bestsellersData = bestsellersResponse.data.data;
          // Kiểm tra cấu trúc dữ liệu
          if (Array.isArray(bestsellersData)) {
            setBestsellers(bestsellersData);
          } else if (bestsellersData.books && Array.isArray(bestsellersData.books)) {
            setBestsellers(bestsellersData.books);
          } else {
            console.error("Unexpected bestsellers data structure:", bestsellersData);
            setBestsellers([]);
          }
        }
        
        setLoading(false)
      } catch (err) {
        console.error("Error fetching books:", err)
        setError("Không thể tải danh sách sách. Vui lòng thử lại sau.")
        setLoading(false)
      }
    }

    fetchBooks()
  }, [])

  // Carousel settings
  const carouselSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
  }

  return (
    <div className="home-page">
      {/* Banner Carousel */}
      <Carousel {...carouselSettings} className="banner-carousel">
        <div className="carousel-item">
          <img src="/banners/banner1.jpg" alt="Banner 1" />
          <div className="carousel-content">
            <h2>Khám phá thế giới sách</h2>
            <p>Tìm kiếm những cuốn sách hay nhất với giá tốt nhất</p>
            <Link to="/danh-muc">
              <Button type="primary" size="large">Khám phá ngay</Button>
            </Link>
          </div>
        </div>
        <div className="carousel-item">
          <img src="/banners/banner2.jpg" alt="Banner 2" />
          <div className="carousel-content">
            <h2>Sách mới ra mắt</h2>
            <p>Cập nhật những đầu sách mới nhất</p>
            <Link to="/danh-muc">
              <Button type="primary" size="large">Xem ngay</Button>
            </Link>
          </div>
        </div>
      </Carousel>

      {/* New Arrivals Section */}
      <section className="section">
        <div className="container">
          <RenderWithBooks
            books={newArrivals}
            title="SÁCH MỚI PHÁT HÀNH"
            loading={loading}
            error={error}
          />
          {newArrivals.length > 0 && (
            <div className="view-all">
              <Link to="/danh-muc">
                <Button type="primary">Xem tất cả</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Bestsellers Section */}
      <section className="section">
        <div className="container">
          <RenderWithBooks
            books={bestsellers}
            title="SÁCH BÁN CHẠY"
            loading={loading}
            error={error}
          />
          {bestsellers.length > 0 && (
            <div className="view-all">
              <Link to="/danh-muc">
                <Button type="primary">Xem tất cả</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="section categories-section">
        <div className="container">
          <h2 className="section-title">DANH MỤC SÁCH</h2>
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={8} md={6}>
              <Link to="/danh-muc/văn-học">
                <Card className="category-card" cover={<img alt="Văn học" src="/categories/literature.jpg" />}>
                  <Card.Meta title="Văn học" />
                </Card>
              </Link>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <Link to="/danh-muc/kinh-tế">
                <Card className="category-card" cover={<img alt="Kinh tế" src="/categories/business.jpg" />}>
                  <Card.Meta title="Kinh tế" />
                </Card>
              </Link>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <Link to="/danh-muc/tâm-lý">
                <Card className="category-card" cover={<img alt="Tâm lý" src="/categories/psychology.jpg" />}>
                  <Card.Meta title="Tâm lý" />
                </Card>
              </Link>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <Link to="/danh-muc/thiếu-nhi">
                <Card className="category-card" cover={<img alt="Thiếu nhi" src="/categories/children.jpg" />}>
                  <Card.Meta title="Thiếu nhi" />
                </Card>
              </Link>
            </Col>
          </Row>
          <div className="view-all">
            <Link to="/danh-muc">
              <Button type="primary">Xem tất cả danh mục</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home