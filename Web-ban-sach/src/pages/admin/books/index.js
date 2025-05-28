"use client"

import { memo, useState, useEffect } from "react"
import "./style.scss"
import { FaEdit, FaTrash, FaPlus, FaSearch, FaFilter } from "react-icons/fa"
import { Link } from "react-router-dom"
import { ROUTERS } from "utils/router"
import { formatPrice } from "utils/formatter"
import { bookAPI, categoryAPI } from "../../../utils/api"
import { getImageUrl } from '../../../utils/constants';

const Books = () => {
  const [books, setBooks] = useState([])
  const [filteredBooks, setFilteredBooks] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [categories, setCategories] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [booksPerPage] = useState(10)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [totalBooks, setTotalBooks] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryAPI.getAllCategories()
        setCategories(response.data.data)
      } catch (err) {
        console.error("Error fetching categories:", err)
      }
    }

    const fetchBooks = async () => {
      setLoading(true)
      try {
        const response = await bookAPI.getAllBooks({
          page: currentPage,
          limit: booksPerPage,
        })

        const { books, total, totalPages } = response.data.data
        setBooks(books)
        setFilteredBooks(books)
        setTotalBooks(total)
        setTotalPages(totalPages)
      } catch (err) {
        console.error("Error fetching books:", err)
        setError("Có lỗi xảy ra khi tải danh sách sách. Vui lòng thử lại sau.")
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
    fetchBooks()
  }, [currentPage, booksPerPage])

  useEffect(() => {
    const fetchFilteredBooks = async () => {
      setLoading(true)
      try {
        const params = {
          page: 1, // Reset về trang đầu tiên khi lọc
          limit: booksPerPage,
        }

        if (searchTerm) {
          params.name = searchTerm
        }

        if (selectedCategory !== "all") {
          params.category = selectedCategory
        }

        const response = await bookAPI.searchBooks(params)
        const { books, total, totalPages } = response.data.data

        setFilteredBooks(books)
        setTotalBooks(total)
        setTotalPages(totalPages)
        setCurrentPage(1) // Reset về trang đầu tiên khi lọc
      } catch (err) {
        console.error("Error filtering books:", err)
        setError("Có lỗi xảy ra khi lọc sách. Vui lòng thử lại sau.")
      } finally {
        setLoading(false)
      }
    }

    // Chỉ gọi API khi có thay đổi về tìm kiếm hoặc danh mục
    if (searchTerm || selectedCategory !== "all") {
      fetchFilteredBooks()
    } else if (books.length > 0) {
      // Nếu không có bộ lọc, sử dụng lại dữ liệu đã có
      setFilteredBooks(books)
    }
  }, [searchTerm, selectedCategory, books, booksPerPage])

  // Thay đổi trang
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  const handleDeleteBook = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sách này?")) {
      try {
        await bookAPI.deleteBook(id)
        // Cập nhật lại danh sách sách sau khi xóa
        const updatedBooks = books.filter((book) => book._id !== id)
        setBooks(updatedBooks)
        setFilteredBooks(updatedBooks)
        alert("Xóa sách thành công!")
      } catch (err) {
        console.error("Error deleting book:", err)
        alert("Có lỗi xảy ra khi xóa sách. Vui lòng thử lại sau.")
      }
    }
  }

  if (loading && books.length === 0) {
    return <div className="loading-container">Đang tải dữ liệu...</div>
  }

  if (error) {
    return <div className="error-container">{error}</div>
  }

  return (
    <div className="admin-books">
      <div className="admin-content">
        <div className="admin-header">
          <h1>Quản lý sách</h1>
          <Link to={ROUTERS.ADMIN.ADD_BOOK} className="add-book-btn">
            <FaPlus /> Thêm sách mới
          </Link>
        </div>

        <div className="filter-section">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên sách hoặc tác giả..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="category-filter">
            <FaFilter className="filter-icon" />
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="all">Tất cả danh mục</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="books-table-container">
          <table className="books-table">
            <thead>
              <tr>
                <th>Sách</th>
                <th>Tác giả</th>
                <th>Danh mục</th>
                <th>Giá</th>
                <th>Tồn kho</th>
                <th>Đã bán</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data">
                    Không tìm thấy sách nào
                  </td>
                </tr>
              ) : (
                filteredBooks.map((book) => (
                  <tr key={book._id}>
                    <td>
                      <div className="book-info">
                        <img
                          src={getImageUrl(book.image)}
                          alt={book.title}
                          className="book-thumbnail"
                        />
                        <span className="book-title">{book.title}</span>
                      </div>
                    </td>
                    <td>{book.author}</td>
                    <td>{book.category?.name || "Chưa phân loại"}</td>
                    <td>{formatPrice(book.price)}</td>
                    <td>{book.stock}</td>
                    <td>{book.soldCount || 0}</td>
                    <td className="action-buttons">
                      <Link to={`${ROUTERS.ADMIN.ADD_BOOK}?id=${book._id}`} className="edit-button" title="Chỉnh sửa">
                        <FaEdit />
                      </Link>
                      <button className="delete-button" onClick={() => handleDeleteBook(book._id)} title="Xóa">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="pagination">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={`page-button ${currentPage === i + 1 ? "active" : ""}`}
                onClick={() => paginate(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default memo(Books)
