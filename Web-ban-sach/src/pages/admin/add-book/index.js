"use client"

import { memo, useState, useEffect } from "react"
import "./style.scss"
import { FaArrowLeft, FaSave, FaTimes } from "react-icons/fa"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { ROUTERS } from "utils/router"
import { bookAPI, categoryAPI } from "../../../utils/api"
import { getImageUrl } from '../../../utils/constants';

const AddBook = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const bookId = queryParams.get("id")
  const isEditMode = !!bookId

  const [bookData, setBookData] = useState({
    title: "",
    author: "",
    category: "",
    price: "",
    originalPrice: "",
    stock: "",
    description: "",
    dimensions: "",
    pages: "",
    weight: "",
    format: "Bìa mềm",
    series: "",
    image: null,
    imagePreview: null,
  })

  const [categories, setCategories] = useState([])
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryAPI.getAllCategories()
        setCategories(response.data.data)
      } catch (err) {
        console.error("Error fetching categories:", err)
        setError("Không thể tải danh sách danh mục. Vui lòng thử lại sau.")
      }
    }

    const fetchBookDetails = async () => {
      if (isEditMode) {
        try {
          const response = await bookAPI.getBookById(bookId)
          const book = response.data.data

          setBookData({
            ...book,
            price: book.price.toString(),
            originalPrice: book.originalPrice ? book.originalPrice.toString() : "",
            stock: book.stock.toString(),
            pages: book.pages ? book.pages.toString() : "",
            category: typeof book.category === "object" ? book.category._id : book.category,
            imagePreview: book.image ? getImageUrl(book.image) : null,
          })
        } catch (err) {
          console.error("Error fetching book details:", err)
          setError("Không thể tải thông tin sách. Vui lòng thử lại sau.")
        }
      }
    }

    const loadData = async () => {
      setLoading(true)
      try {
        await fetchCategories()
        await fetchBookDetails()
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [isEditMode, bookId])

  const handleChange = (e) => {
    const { name, value } = e.target
    setBookData({
      ...bookData,
      [name]: value,
    })

    // Xóa lỗi khi người dùng nhập lại
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      })
    }
  }

  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      // Kiểm tra kích thước file (giới hạn 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({
          ...errors,
          image: "Kích thước file quá lớn, giới hạn là 5MB"
        })
        return
      }
      
      // Kiểm tra định dạng file
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      if (!validTypes.includes(file.type)) {
        setErrors({
          ...errors,
          image: "Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WEBP)"
        })
        return
      }
      
      // Tạo preview cho người dùng thấy
      setBookData({
        ...bookData,
        image: file,
        imagePreview: URL.createObjectURL(file),
      })
      
      // Xóa lỗi nếu có
      if (errors.image) {
        setErrors({
          ...errors,
          image: null
        })
      }
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!bookData.title.trim()) {
      newErrors.title = "Vui lòng nhập tên sách"
    }

    if (!bookData.author.trim()) {
      newErrors.author = "Vui lòng nhập tên tác giả"
    }

    if (!bookData.category) {
      newErrors.category = "Vui lòng chọn danh mục"
    }

    if (!bookData.price.trim()) {
      newErrors.price = "Vui lòng nhập giá bán"
    } else if (isNaN(bookData.price) || Number.parseFloat(bookData.price) <= 0) {
      newErrors.price = "Giá bán phải là số dương"
    }

    if (
      bookData.originalPrice.trim() &&
      (isNaN(bookData.originalPrice) || Number.parseFloat(bookData.originalPrice) <= 0)
    ) {
      newErrors.originalPrice = "Giá gốc phải là số dương"
    }

    if (!bookData.stock.trim()) {
      newErrors.stock = "Vui lòng nhập số lượng tồn kho"
    } else if (isNaN(bookData.stock) || Number.parseInt(bookData.stock) < 0) {
      newErrors.stock = "Số lượng tồn kho phải là số không âm"
    }

    if (!bookData.description.trim()) {
      newErrors.description = "Vui lòng nhập mô tả sách"
    }

    if (!isEditMode && !bookData.image) {
      newErrors.image = "Vui lòng chọn hình ảnh sách"
    }

    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      let imageFilename = bookData.image;
      
      // Nếu có file ảnh mới, upload ảnh trước
      if (bookData.image instanceof File) {
        const formData = new FormData();
        formData.append('image', bookData.image);
        
        try {
          // Gọi API upload ảnh
          const uploadResponse = await fetch('http://localhost:5001/api/upload/image', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
          });
          
          if (!uploadResponse.ok) {
            throw new Error('Upload ảnh thất bại');
          }
          
          const uploadResult = await uploadResponse.json();
          // Lấy tên file từ kết quả upload
          imageFilename = uploadResult.data.filename;
          console.log('Upload thành công:', uploadResult);
        } catch (uploadError) {
          console.error('Lỗi khi upload ảnh:', uploadError);
          alert('Lỗi khi upload ảnh. Vui lòng thử lại.');
          return;
        }
      }
      
      // Chuẩn bị dữ liệu sách (không bao gồm file ảnh)
      const bookDataToSend = {
        ...bookData,
        image: imageFilename, // Sử dụng tên file đã upload
      };
      
      // Loại bỏ các trường không cần thiết
      delete bookDataToSend.imagePreview;
      
      // Gọi API tạo/cập nhật sách
      let response;
      if (isEditMode) {
        response = await bookAPI.updateBook(bookId, bookDataToSend);
        alert("Cập nhật sách thành công!");
      } else {
        response = await bookAPI.createBook(bookDataToSend);
        alert("Thêm sách mới thành công!");
      }

      navigate(ROUTERS.ADMIN.BOOKS);
    } catch (err) {
      console.error("Error saving book:", err);
      alert(`Có lỗi xảy ra khi lưu thông tin sách: ${err.response?.data?.message || err.message}`);
    }
  }

  if (loading) {
    return <div className="loading">Đang tải dữ liệu...</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  return (
    <div className="admin-add-book">
      <div className="admin-content">
        <div className="admin-header">
          <h1>{isEditMode ? "Chỉnh sửa sách" : "Thêm sách mới"}</h1>
          <Link to={ROUTERS.ADMIN.BOOKS} className="back-button">
            <FaArrowLeft /> Quay lại
          </Link>
        </div>

        <form className="add-book-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-left">
              <div className="form-group">
                <label htmlFor="title">
                  Tên sách <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={bookData.title}
                  onChange={handleChange}
                  placeholder="Nhập tên sách"
                  className={errors.title ? "error" : ""}
                />
                {errors.title && <div className="error-message">{errors.title}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="author">
                  Tác giả <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="author"
                  name="author"
                  value={bookData.author}
                  onChange={handleChange}
                  placeholder="Nhập tên tác giả"
                  className={errors.author ? "error" : ""}
                />
                {errors.author && <div className="error-message">{errors.author}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="category">
                  Danh mục <span className="required">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={bookData.category}
                  onChange={handleChange}
                  className={errors.category ? "error" : ""}
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category && <div className="error-message">{errors.category}</div>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="price">
                    Giá bán <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="price"
                    name="price"
                    value={bookData.price}
                    onChange={handleChange}
                    placeholder="Nhập giá bán"
                    className={errors.price ? "error" : ""}
                  />
                  {errors.price && <div className="error-message">{errors.price}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="originalPrice">Giá gốc</label>
                  <input
                    type="text"
                    id="originalPrice"
                    name="originalPrice"
                    value={bookData.originalPrice}
                    onChange={handleChange}
                    placeholder="Nhập giá gốc"
                    className={errors.originalPrice ? "error" : ""}
                  />
                  {errors.originalPrice && <div className="error-message">{errors.originalPrice}</div>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="stock">
                  Số lượng tồn kho <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="stock"
                  name="stock"
                  value={bookData.stock}
                  onChange={handleChange}
                  placeholder="Nhập số lượng tồn kho"
                  className={errors.stock ? "error" : ""}
                />
                {errors.stock && <div className="error-message">{errors.stock}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="description">
                  Mô tả <span className="required">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={bookData.description}
                  onChange={handleChange}
                  placeholder="Nhập mô tả sách"
                  rows="6"
                  className={errors.description ? "error" : ""}
                />
                {errors.description && <div className="error-message">{errors.description}</div>}
              </div>
            </div>

            <div className="form-right">
              <div className="form-group">
                <label htmlFor="image">Hình ảnh sách {!isEditMode && <span className="required">*</span>}</label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className={errors.image ? "error" : ""}
                />
                {errors.image && <div className="error-message">{errors.image}</div>}
                {bookData.imagePreview && (
                  <div className="image-preview">
                    <img src={bookData.imagePreview} alt="Preview" />
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="dimensions">Kích thước</label>
                  <input
                    type="text"
                    id="dimensions"
                    name="dimensions"
                    value={bookData.dimensions}
                    onChange={handleChange}
                    placeholder="VD: 11.3 x 17.6 cm"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="pages">Số trang</label>
                  <input
                    type="text"
                    id="pages"
                    name="pages"
                    value={bookData.pages}
                    onChange={handleChange}
                    placeholder="VD: 192"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="weight">Trọng lượng</label>
                  <input
                    type="text"
                    id="weight"
                    name="weight"
                    value={bookData.weight}
                    onChange={handleChange}
                    placeholder="VD: 140 gram"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="format">Định dạng</label>
                  <select id="format" name="format" value={bookData.format} onChange={handleChange}>
                    <option value="Bìa mềm">Bìa mềm</option>
                    <option value="Bìa cứng">Bìa cứng</option>
                    <option value="Bìa gập">Bìa gập</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="series">Bộ sách</label>
                <input
                  type="text"
                  id="series"
                  name="series"
                  value={bookData.series}
                  onChange={handleChange}
                  placeholder="VD: Chú thuật hồi chiến"
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <Link to={ROUTERS.ADMIN.BOOKS} className="cancel-button">
              <FaTimes /> Hủy
            </Link>
            <button type="submit" className="save-button">
              <FaSave /> {isEditMode ? "Cập nhật" : "Thêm sách"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default memo(AddBook)
