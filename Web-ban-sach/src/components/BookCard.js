import React from 'react'
import { Card, Rate } from 'antd'
import { Link } from 'react-router-dom'
import { getImageUrl } from '../utils/constants'

const { Meta } = Card

const BookCard = ({ book }) => {
  // Sử dụng hàm getImageUrl để xử lý ảnh
  const imageUrl = getImageUrl(book.image || book.coverImage);

  return (
    <Link to={`/sach/${book._id}`} className="book-card-link">
      <Card
        hoverable
        cover={
          <img
            alt={book.title}
            src={imageUrl}
            className="h-48 object-cover"
          />
        }
      >
        <Meta
          title={book.title}
          description={
            <div>
              <p className="text-gray-500 text-sm mb-2">{book.author}</p>
              <div className="flex items-center justify-between">
                <Rate disabled defaultValue={book.rating || 0} />
                <span className="text-red-500 font-bold">
                  {book.price?.toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>
          }
        />
      </Card>
    </Link>
  )
}

export default BookCard 
