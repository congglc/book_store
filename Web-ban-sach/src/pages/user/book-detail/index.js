import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Card, Typography, Button, message, InputNumber, Spin } from 'antd'
import { bookAPI } from '../../../utils/api'
import { getImageUrl, formatPrice } from '../../../utils/constants'
import './style.scss'

const { Title, Paragraph } = Typography

const BookDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [book, setBook] = useState(null)
  const [relatedBooks, setRelatedBooks] = useState([])
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isInCart, setIsInCart] = useState(false)

  // Kiểm tra xem sách đã có trong giỏ hàng chưa
  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]")
    setIsInCart(cart.some((item) => item._id === id))
  }, [id])

  // Lấy thông tin sách
  useEffect(() => {
    const fetchBookDetails = async () => {
      if (!id) {
        setError("ID sách không hợp lệ")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        console.log("Fetching book with ID:", id)
        const response = await bookAPI.getBookById(id)
        
        if (!response || !response.data || !response.data.data) {
          console.error("Invalid response structure:", response)
          setError("Không tìm thấy thông tin sách")
          setLoading(false)
          return
        }
        
        const bookData = response.data.data
        console.log("Book data:", bookData)
        
        if (!bookData) {
          setError("Không tìm thấy thông tin sách")
          setLoading(false)
          return
        }
        
        setBook(bookData)
        
        // Fetch related books
        if (bookData.category) {
          try {
            const categoryId = typeof bookData.category === 'object' ? bookData.category._id : bookData.category
            
            if (categoryId) {
              console.log("Fetching related books for category:", categoryId)
              const relatedResponse = await bookAPI.getBooksByCategory(categoryId, { limit: 4 })
              console.log("Related books response:", relatedResponse.data)
              
              if (relatedResponse.data && relatedResponse.data.data && relatedResponse.data.data.books) {
                // Lọc bỏ sách hiện tại khỏi danh sách liên quan
                const filteredBooks = relatedResponse.data.data.books.filter(b => b._id !== id)
                setRelatedBooks(filteredBooks)
              } else {
                setRelatedBooks([])
              }
            }
          } catch (relatedError) {
            console.error("Error fetching related books:", relatedError)
            // Không hiển thị lỗi cho người dùng khi không lấy được sách liên quan
            setRelatedBooks([])
          }
        }
        
        setLoading(false)
      } catch (error) {
        console.error("Error fetching book details:", error)
        
        if (error.response) {
          // Lỗi từ server
          if (error.response.status === 404) {
            setError("Không tìm thấy sách với ID này")
          } else {
            setError(`Lỗi ${error.response.status}: ${error.response.data?.message || 'Không thể tải thông tin sách'}`)
          }
        } else if (error.request) {
          // Không nhận được phản hồi từ server
          setError("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.")
        } else {
          // Lỗi khác
          setError("Có lỗi xảy ra khi tải thông tin sách. Vui lòng thử lại sau.")
        }
        
        setLoading(false)
      }
    }

    fetchBookDetails()
  }, [id])

  const addToCart = () => {
    if (!book) return

    const cart = JSON.parse(localStorage.getItem("cart") || "[]")
    const existingItemIndex = cart.findIndex((item) => item._id === book._id)

    if (existingItemIndex >= 0) {
      cart[existingItemIndex].quantity += quantity
    } else {
      cart.push({
        _id: book._id,
        title: book.title,
        price: book.price,
        image: book.image,
        quantity: quantity,
      })
    }

    localStorage.setItem("cart", JSON.stringify(cart))
    setIsInCart(true)
    message.success("Đã thêm sách vào giỏ hàng!")
  }

  const handleQuantityChange = (value) => {
    setQuantity(value)
  }

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
        <p>Đang tải thông tin sách...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Có lỗi xảy ra</h2>
        <p>{error}</p>
        <Button type="primary" onClick={() => navigate('/danh-muc')}>
          Quay lại danh mục sách
        </Button>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="error-container">
        <h2>Không tìm thấy sách</h2>
        <p>Sách bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
        <Button type="primary" onClick={() => navigate('/danh-muc')}>
          Quay lại danh mục sách
        </Button>
      </div>
    )
  }

  return (
    <div className="book-detail-page">
      <div className="container">
        <Card className="book-detail-card">
          <div className="book-detail-content">
            <div className="book-image-container">
              <img 
                src={getImageUrl(book.image)} 
                alt={book.title} 
                className="book-image" 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/placeholder.svg?height=300&width=200";
                }}
              />
            </div>
            <div className="book-info-container">
              <Title level={2} className="book-title">{book.title}</Title>
              <Paragraph className="book-author">Tác giả: {book.author}</Paragraph>
              <Paragraph className="book-price">Giá: <span className="price-value">{formatPrice(book.price)}</span></Paragraph>
              {book.originalPrice > book.price && (
                <Paragraph className="book-original-price">
                  Giá gốc: <span className="original-price-value">{formatPrice(book.originalPrice)}</span>
                  <span className="discount-value">
                    (Tiết kiệm {Math.round((1 - book.price / book.originalPrice) * 100)}%)
                  </span>
                </Paragraph>
              )}
              <Paragraph className="book-description">Mô tả: {book.description}</Paragraph>
              {book.dimensions && <Paragraph className="book-dimensions">Kích thước: {book.dimensions}</Paragraph>}
              {book.pages && <Paragraph className="book-pages">Số trang: {book.pages}</Paragraph>}
              {book.format && <Paragraph className="book-format">Định dạng: {book.format}</Paragraph>}
              
              <div className="quantity-selector">
                <span className="quantity-label">Số lượng:</span>
                <InputNumber 
                  min={1} 
                  max={book.stock || 10} 
                  defaultValue={1} 
                  onChange={handleQuantityChange} 
                  className="quantity-input"
                />
                <span className="stock-info">{book.stock ? `Còn ${book.stock} sản phẩm` : ''}</span>
              </div>
              
              <div className="book-actions">
                <Button 
                  type="primary" 
                  size="large" 
                  className="buy-now-btn"
                  onClick={() => {
                    addToCart()
                    navigate('/thanh-toan')
                  }}
                >
                  Mua ngay
                </Button>
                <Button 
                  size="large" 
                  className="add-to-cart-btn"
                  onClick={addToCart} 
                  disabled={isInCart}
                >
                  {isInCart ? 'Đã trong giỏ hàng' : 'Thêm vào giỏ hàng'}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {relatedBooks.length > 0 && (
          <div className="related-books-section">
            <h2 className="section-title">SÁCH CÙNG THỂ LOẠI</h2>
            <div className="related-books-grid">
              {relatedBooks.map((relatedBook) => (
                <div className="related-book-card" key={relatedBook._id}>
                  <Link to={`/sach/${relatedBook._id}`} className="related-book-link">
                    <div className="related-book-image-container">
                      <img
                        src={getImageUrl(relatedBook.image)}
                        alt={relatedBook.title}
                        className="related-book-image"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/placeholder.svg?height=300&width=200";
                        }}
                      />
                    </div>
                    <div className="related-book-info">
                      <h3 className="related-book-title">{relatedBook.title}</h3>
                      <p className="related-book-price">{formatPrice(relatedBook.price)}</p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BookDetail
