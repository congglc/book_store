"use client"

import { memo, useState, useEffect } from "react"
import "./style.scss"
import { FaArrowLeft, FaSave } from "react-icons/fa"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { ROUTERS } from "utils/router"
import { categoryAPI } from "../../../utils/api"

const AddCategory = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const categoryId = queryParams.get("id")
  const isEditMode = !!categoryId

  const [categoryData, setCategoryData] = useState({
    name: "",
    description: ""
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isEditMode) {
      fetchCategoryData()
    }
  }, [categoryId])

  const fetchCategoryData = async () => {
    setLoading(true)
    try {
      const response = await categoryAPI.getCategoryById(categoryId)
      console.log("Category data response:", response.data)
      
      // Kiểm tra cấu trúc dữ liệu trả về
      const category = response.data.data || response.data
      
      setCategoryData({
        name: category.name || "",
        description: category.description || ""
      })
    } catch (err) {
      console.error("Error fetching category:", err)
      setError("Không thể tải thông tin danh mục. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setCategoryData({
      ...categoryData,
      [name]: value
    })
    // Xóa lỗi khi người dùng bắt đầu nhập
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!categoryData.name.trim()) {
      newErrors.name = "Tên danh mục không được để trống"
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
      if (isEditMode) {
        await categoryAPI.updateCategory(categoryId, categoryData)
        alert("Cập nhật danh mục thành công!")
      } else {
        await categoryAPI.createCategory(categoryData)
        alert("Thêm danh mục mới thành công!")
      }

      navigate(ROUTERS.ADMIN.CATEGORIES)
    } catch (err) {
      console.error("Error saving category:", err)
      alert(`Có lỗi xảy ra khi lưu thông tin danh mục: ${err.response?.data?.message || err.message}`)
    }
  }

  if (loading) {
    return <div className="loading">Đang tải dữ liệu...</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  return (
    <div className="admin-add-category">
      <div className="admin-content">
        <div className="admin-header">
          <h1>{isEditMode ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}</h1>
          <Link to={ROUTERS.ADMIN.CATEGORIES} className="back-button">
            <FaArrowLeft /> Quay lại
          </Link>
        </div>

        <form className="add-category-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">
              Tên danh mục <span className="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={categoryData.name}
              onChange={handleChange}
              placeholder="Nhập tên danh mục"
              className={errors.name ? "error" : ""}
            />
            {errors.name && <div className="error-message">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Mô tả</label>
            <textarea
              id="description"
              name="description"
              value={categoryData.description}
              onChange={handleChange}
              placeholder="Nhập mô tả danh mục (không bắt buộc)"
              rows="4"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="save-button">
              <FaSave /> {isEditMode ? "Cập nhật" : "Lưu"}
            </button>
            <Link to={ROUTERS.ADMIN.CATEGORIES} className="cancel-button">
              Hủy
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default memo(AddCategory)
