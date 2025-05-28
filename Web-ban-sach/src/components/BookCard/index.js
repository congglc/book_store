import React from 'react'
import { Link } from 'react-router-dom'
import { getImageUrl, formatPrice } from '../../utils/constants'
import './style.scss'

const BookCard = ({ book }) => {
  // Đảm bảo book không null
  if (!book) return null;

  return (
    <div className="book-card">
      <Link to={`/sach/${book._id}`}>
        <div className="book-image">
          <img
            src={getImageUrl(book.image)}
            alt={book.title}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/placeholder.svg?height=300&width=200";
            }}
          />
        </div>
        <div className="book-info">
          <h3 className="book-title">{book.title}</h3>
          <p className="book-price">{formatPrice(book.price)}</p>
        </div>
      </Link>
    </div>
  )
}

export default BookCard
