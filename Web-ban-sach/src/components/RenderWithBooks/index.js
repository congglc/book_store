import React from 'react'
import BookCard from '../BookCard'
import './style.scss'

const RenderWithBooks = ({ books, title, loading, error }) => {
  // Kiểm tra và xử lý các trường hợp đặc biệt
  if (loading) {
    return <div className="loading">Đang tải...</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  // Đảm bảo books là một mảng
  const safeBooks = Array.isArray(books) ? books : [];

  if (safeBooks.length === 0) {
    return <div className="no-books">Không có sách nào</div>
  }

  return (
    <div className="books-section">
      {title && <h2 className="section-title">{title}</h2>}
      <div className="book-grid">
        {safeBooks.map((book) => (
          <BookCard key={book._id} book={book} />
        ))}
      </div>
    </div>
  )
}

export default RenderWithBooks