"use client"

import { memo, useState, useEffect } from "react"
import "./style.scss"
import { FaEdit, FaTrash, FaPlus, FaSearch } from "react-icons/fa"
import { Link } from "react-router-dom"
import { ROUTERS } from "utils/router"
import { categoryAPI } from "../../../utils/api"

const Categories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredCategories, setFilteredCategories] = useState([])

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = categories.filter(cat => 
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredCategories(filtered)
    } else {
      setFilteredCategories(categories)
    }
  }, [searchTerm, categories])

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const response = await categoryAPI.getAllCategories()
      console.log("Categories response:", response.data)
      
      // Kiểm tra cấu trúc dữ liệu trả về
      const data = response.data.data || response.data || []
      
      if (Array.isArray(data)) {
        // Loại bỏ các danh mục trùng lặp theo tên
        const uniqueCategories = removeDuplicatesByName(data)
        setCategories(uniqueCategories)
        setFilteredCategories(uniqueCategories)
      } else {
        console.error("Unexpected data structure:", data)
        setCategories([])
        setFilteredCategories([])
      }
    } catch (err) {
      console.error("Error fetching categories:", err)
      setError("Có lỗi xảy ra khi tải danh sách danh mục. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  // Hàm loại bỏ các danh mục trùng lặp theo tên
  const removeDuplicatesByName = (categories) => {
    const nameMap = new Map()
    
    return categories.filter(cat => {
      if (!cat.name) return true
      
      if (!nameMap.has(cat.name)) {
        nameMap.set(cat.name, true)
        return true
      }
      return false
    })
  }

  const handleDeleteCategory = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
      try {
        await categoryAPI.deleteCategory(id)
        // Cập nhật lại danh sách danh mục sau khi xóa
        const updatedCategories = categories.filter((cat) => cat._id !== id)
        setCategories(updatedCategories)
        setFilteredCategories(updatedCategories)
        alert("Xóa danh mục thành công!")
      } catch (err) {
        console.error("Error deleting category:", err)
        alert("Có lỗi xảy ra khi xóa danh mục. Vui lòng thử lại sau.")
      }
    }
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  if (loading && categories.length === 0) {
    return <div className="loading-container">Đang tải dữ liệu...</div>
  }

  if (error) {
    return <div className="error-container">{error}</div>
  }

  return (
    <div className="admin-categories">
      <div className="admin-content">
        <div className="admin-header">
          <h1>Quản lý danh mục</h1>
          <Link to={`${ROUTERS.ADMIN.ADD_CATEGORY}`} className="add-category-btn">
            <FaPlus /> Thêm danh mục mới
          </Link>
        </div>

        <div className="search-filter-container">
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm danh mục..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>
        </div>

        <div className="categories-table-container">
          <table className="categories-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên danh mục</th>
                <th>Số lượng sách</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan="4" className="no-data">
                    Không tìm thấy danh mục nào
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <tr key={category._id || category.id}>
                    <td>{category._id || category.id}</td>
                    <td>{category.name}</td>
                    <td>{category.bookCount || 0}</td>
                    <td className="action-buttons">
                      <Link to={`${ROUTERS.ADMIN.ADD_CATEGORY}?id=${category._id || category.id}`} className="edit-button" title="Chỉnh sửa">
                        <FaEdit />
                      </Link>
                      <button className="delete-button" onClick={() => handleDeleteCategory(category._id || category.id)} title="Xóa">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default memo(Categories)


