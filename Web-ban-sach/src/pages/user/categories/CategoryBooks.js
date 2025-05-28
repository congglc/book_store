import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Row, Col, Pagination, Typography, Spin } from 'antd'
import BookCard from '../../../components/BookCard'
import { bookAPI, categoryAPI } from '../../../utils/api'

const { Title } = Typography

const CategoryBooks = () => {
  const { categoryId } = useParams()
  const [books, setBooks] = useState([])
  const [category, setCategory] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchCategory()
    fetchBooks()
  }, [categoryId])

  const fetchCategory = async () => {
    try {
      const response = await categoryAPI.getCategoryById(categoryId)
      setCategory(response.data.data || response.data)
    } catch (error) {
      setCategory(null)
    }
  }

  const fetchBooks = async (page = 1) => {
    setLoading(true)
    try {
      // Đảm bảo sử dụng đúng tên hàm getBooksByCategory
      const response = await bookAPI.getBooksByCategory(categoryId, { page, limit: 8 })
      setBooks(response.data.data.books || [])
      setTotalPages(response.data.data.totalPages || 1)
      setCurrentPage(response.data.data.currentPage || 1)
    } catch (error) {
      console.error("Error fetching books for category:", error)
      setBooks([])
    }
    setLoading(false)
  }

  const handlePageChange = (page) => {
    fetchBooks(page)
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
      <Title level={2} className="mb-6">
        {category ? category.name : 'Danh Mục Sách'}
      </Title>
      <Row gutter={[24, 24]}>
        {books.map((book) => (
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
    </div>
  )
}

export default CategoryBooks 
