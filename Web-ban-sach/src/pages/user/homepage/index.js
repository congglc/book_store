"use client"

import React, { useState, useEffect } from 'react'
import { Link } from "react-router-dom"
import { formatPrice } from "utils/formatter"
import banner1 from "../../../assets/user/img/banner.png"
import "./style.scss"
import { bookAPI, categoryAPI } from "../../../utils/api"
import { FaSearch } from "react-icons/fa"
import { Row, Col, Pagination } from 'antd'
import BookCard from '../../../components/BookCard'
import { Typography } from 'antd'
import { API_URL } from '../../../utils/constants'

const { Title } = Typography

const HomePage = () => {
  const [newBooks, setNewBooks] = useState([])
  const [bestSellers, setBestSellers] = useState([])
  const [selfHelpBooks, setSelfHelpBooks] = useState([])
  const [featuredBook, setFeaturedBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [categories, setCategories] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [allBooks, setAllBooks] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    window.scrollTo(0, 0)

    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        console.log("Fetching homepage data...")
        
        // Log URL API
        console.log("API_URL:", API_URL)
        
        // Lấy danh sách danh mục
        const categoriesResponse = await categoryAPI.getAllCategories()
        console.log("Categories response:", categoriesResponse)
        setCategories(categoriesResponse?.data?.data || [])
        
        // Lấy sách mới
        const newBooksResponse = await bookAPI.getNewArrivals(4)
        setNewBooks(newBooksResponse?.data?.data?.books || [])

        // Lấy sách bán chạy
        const bestSellersResponse = await bookAPI.getBestsellers(4)
        setBestSellers(bestSellersResponse?.data?.data?.books || [])

        // Lấy sách kỹ năng sống
        const selfHelpResponse = await bookAPI.searchBooks({
          category: "Kỹ năng sống",
          limit: 4,
        })
        setSelfHelpBooks(selfHelpResponse?.data?.data?.books || [])

        // Lấy sách nổi bật (sách đầu tiên trong bestsellers)
        if (bestSellersResponse?.data?.data?.books?.length > 0) {
          const featuredBookResponse = await bookAPI.getBookById(bestSellersResponse.data.data.books[0]._id)
          setFeaturedBook(featuredBookResponse?.data?.data || null)
        }
      } catch (err) {
        console.error("Error fetching data:", err)
        if (err.response) {
          setError(`Lỗi ${err.response.status}: ${err.response.data?.message || 'Không thể tải dữ liệu'}`)
          console.error("Response data:", err.response.data)
        } else if (err.request) {
          setError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.')
          console.error("Request:", err.request)
        } else {
          setError('Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.')
          console.error("Error message:", err.message)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Lấy sách cho từng category (trừ Kỹ năng sống)
  const [categoryBooks, setCategoryBooks] = useState({})
  useEffect(() => {
    const fetchBooksForCategories = async () => {
      const result = {}
      for (const cat of categories) {
        try {
          // Sửa tên hàm từ getBookByCategory thành getBooksByCategory
          const res = await bookAPI.getBooksByCategory(cat._id, { limit: 4 })
          result[cat._id] = res?.data?.data?.books || []
        } catch (error) {
          console.error("Error fetching books for category:", error)
          result[cat._id] = []
        }
      }
      setCategoryBooks(result)
    }
    if (categories.length > 0) fetchBooksForCategories()
  }, [categories])

  // Hàm xử lý tìm kiếm sách
  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchTerm.trim()) return
    setSearching(true)
    setError(null)
    try {
      const res = await bookAPI.searchBooks({ name: searchTerm, limit: 20 })
      setSearchResults(res?.data?.data?.books || [])
    } catch (err) {
      setError("Có lỗi xảy ra khi tìm kiếm sách.")
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  // Hàm kiểm tra URL hợp lệ
  const isValidUrl = (url) => typeof url === "string" && url.startsWith("http")

  const fetchAllBooks = async (page = 1) => {
    setLoading(true)
    try {
      const response = await bookAPI.getAllBooks({ page, limit: 8 })
      setAllBooks(response.data.data.books || [])
      setTotalPages(response.data.data.totalPages || 1)
      setCurrentPage(response.data.data.currentPage || 1)
    } catch (error) {
      setAllBooks([])
    }
    setLoading(false)
  }

  const handlePageChange = (page) => {
    fetchAllBooks(page)
  }

  if (loading) {
    return <div className="loading-container">Đang tải dữ liệu...</div>
  }

  if (error) {
    return <div className="error-container">{error}</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Thanh tìm kiếm */}
      <form className="search-bar" onSubmit={handleSearch} style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Tìm kiếm sách theo tên, tác giả..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ flex: 1, padding: 8, borderRadius: 4, border: "1px solid #ccc", marginRight: 8 }}
        />
        <button type="submit" style={{ padding: 8, borderRadius: 4, background: "#0099cc", color: "#fff", border: "none" }}>
          <FaSearch />
        </button>
      </form>

      {/* Kết quả tìm kiếm */}
      {searching && <div>Đang tìm kiếm...</div>}
      {searchTerm && !searching && (
        <section className="book-section">
          <div className="container">
            <h2 className="section-title">KẾT QUẢ TÌM KIẾM</h2>
            <div className="book-grid">
              {searchResults.length === 0 ? (
                <div style={{ width: "100%", textAlign: "center", color: "#888" }}>Không tìm thấy sách nào phù hợp.</div>
              ) : (
                searchResults.map((book) => (
                  <div className="book-card" key={book._id}>
                    <Link to={`/sach/${book._id}`}>
                      <div className="book-image">
                        <img
                          src={
                            typeof book.image === "string" && book.image
                              ? `http://localhost:5001/uploads/${book.image}`
                              : isValidUrl(book.coverImage)
                                ? book.coverImage
                                : "/placeholder.svg?height=300&width=200"
                          }
                          alt={book.title}
                        />
                      </div>
                      <div className="book-info">
                        <h3 className="book-title">{book.title}</h3>
                        <p className="book-price">{formatPrice(book.price)}</p>
                      </div>
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      )}

      {featuredBook && (
        <section className="featured-book">
          <div className="container">
            <div className="featured-content">
              <div className="featured-images">
                <img
                  src={featuredBook.image ? `http://localhost:5001/uploads/${featuredBook.image}` : banner1}
                  alt={featuredBook.title}
                  className="featured-image"
                />
                <img
                  src={featuredBook.image ? `http://localhost:5001/uploads/${featuredBook.image}` : banner1}
                  alt={featuredBook.title}
                  className="featured-image-shadow"
                />
              </div>
              <div className="featured-text">
                <h2>"{featuredBook.title}"</h2>
                <p>{featuredBook.description || "Sách nổi bật của cửa hàng"}</p>
                <div className="featured-info">
                  <div className="price">
                    <span>Niêm yết giá:</span>
                    <strong>{formatPrice(featuredBook.price)}</strong>
                  </div>
                  <div className="year">
                    <span>Năm xuất bản:</span>
                    <strong>{featuredBook.publishYear || new Date().getFullYear()}</strong>
                  </div>
                </div>
                <Link to={`/sach/${featuredBook._id}`} className="cta-button">
                  Mua ngay
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Sách bán chạy */}
      <section className="mb-12">
        <Title level={2} className="mb-6">Sách Bán Chạy</Title>
        <Row gutter={[24, 24]}>
          {bestSellers.map((book) => (
            <Col xs={24} sm={12} md={8} lg={6} key={book._id}>
              <BookCard book={book} />
            </Col>
          ))}
        </Row>
      </section>

      {/* Sách mới */}
      <section className="mb-12">
        <Title level={2} className="mb-6">Sách Mới</Title>
        <Row gutter={[24, 24]}>
          {newBooks.map((book) => (
            <Col xs={24} sm={12} md={8} lg={6} key={book._id}>
              <BookCard book={book} />
            </Col>
          ))}
        </Row>
      </section>

      {/* Tất cả sách */}
      <section>
        <Title level={2} className="mb-6">Tất Cả Sách</Title>
        <Row gutter={[24, 24]}>
          {allBooks.map((book) => (
            <Col xs={24} sm={12} md={8} lg={6} key={book._id}>
              <BookCard book={book} />
            </Col>
          ))}
        </Row>
        <div className="flex justify-center mt-8">
          <Pagination
            current={currentPage}
            total={totalPages * 8}
            pageSize={8}
            onChange={handlePageChange}
            showSizeChanger={false}
          />
        </div>
      </section>

      {/* Render sách theo từng category (trừ Kỹ năng sống) */}
      {categories.map((cat) => (
        <section className="book-section" key={cat._id}>
          <div className="container">
            <h2 className="section-title">{cat.name.toUpperCase()}</h2>
            <div className="book-grid">
              {(categoryBooks[cat._id] || []).map((book) => (
                <div className="book-card" key={book._id}>
                  <Link to={`/sach/${book._id}`}>
                    <div className="book-image">
                      <img
                        src={
                          typeof book.image === "string" && book.image
                            ? `http://localhost:5001/uploads/${book.image}`
                            : isValidUrl(book.coverImage)
                              ? book.coverImage
                              : "/placeholder.svg?height=300&width=200"
                        }
                        alt={book.title}
                      />
                    </div>
                    <div className="book-info">
                      <h3 className="book-title">{book.title}</h3>
                      <p className="book-price">{formatPrice(book.price)}</p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      <section className="book-section self-help-section">
        <div className="container">
          <h2 className="section-title">SÁCH VỀ KỸ NĂNG SỐNG CHO GIỚI TRẺ</h2>
          <div className="book-grid">
            {selfHelpBooks.map((book) => (
              <div className="book-card" key={book._id}>
                <Link to={`/sach/${book._id}`}>
                  <div className="book-image">
                    <img
                      src={
                        typeof book.image === "string" && book.image
                          ? `http://localhost:5001/uploads/${book.image}`
                          : isValidUrl(book.coverImage)
                            ? book.coverImage
                            : "/placeholder.svg?height=300&width=200"
                      }
                      alt={book.title}
                    />
                  </div>
                  <div className="book-info">
                    <h3 className="book-title">{book.title}</h3>
                    <p className="book-price">{formatPrice(book.price)}</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage




