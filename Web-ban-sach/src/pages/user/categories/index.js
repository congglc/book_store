import React, { useEffect, useState } from 'react'
import { Typography, Spin, Row, Col, Card } from 'antd'
import { Link } from 'react-router-dom'
import { categoryAPI, bookAPI } from '../../../utils/api'
import BookCard from '../../../components/BookCard'

const { Title } = Typography

const Categories = () => {
  const [categories, setCategories] = useState([])
  const [categoryBooks, setCategoryBooks] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const response = await categoryAPI.getAllCategories()
      const cats = response.data.data || response.data
      setCategories(cats)
      // Lấy sách cho từng danh mục
      const booksByCat = {}
      await Promise.all(
        cats.map(async (cat) => {
          try {
            // Đảm bảo sử dụng đúng tên hàm getBooksByCategory
            const res = await bookAPI.getBooksByCategory(cat._id, { limit: 8 })
            booksByCat[cat._id] = res.data.data.books || []
          } catch (error) {
            console.error("Error fetching books for category:", error)
            booksByCat[cat._id] = []
          }
        })
      )
      setCategoryBooks(booksByCat)
    } catch (error) {
      setCategories([])
      setCategoryBooks({})
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Title level={2} className="mb-8">Danh Mục Sách</Title>
      {categories.map((cat) => (
        <div key={cat._id} className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <Title level={3} className="mb-0">{cat.name}</Title>
            <Link to={`/category/${cat._id}`} className="text-blue-500 hover:underline">Xem tất cả</Link>
          </div>
          <Row gutter={[24, 24]}>
            {(categoryBooks[cat._id] || []).map((book) => (
              <Col xs={24} sm={12} md={8} lg={6} key={book._id}>
                <BookCard book={book} />
              </Col>
            ))}
            {(categoryBooks[cat._id] || []).length === 0 && (
              <Col span={24}><Card>Không có sách nào trong danh mục này.</Card></Col>
            )}
          </Row>
        </div>
      ))}
    </div>
  )
}

export default Categories 
