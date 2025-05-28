const BookModel = require("../models/book.model")
const CategoryModel = require("../models/category.model")
const { ObjectId } = require("mongoose").Types

const BookService = {
  async getAllBooks(query = {}) {
    // Hỗ trợ phân trang, sort, filter qua query
    // Chuyển đổi các tham số phân trang
    const page = parseInt(query.page) || 1
    const limit = parseInt(query.limit) || 20
    const skip = (page - 1) * limit
    const sort = { createdAt: -1 }
    // Xây dựng query cho BookModel.getAll
    const filter = {}
    if (query.category) filter.category = query.category
    if (query.minPrice) filter.minPrice = query.minPrice
    if (query.maxPrice) filter.maxPrice = query.maxPrice
    if (query.name) filter.search = query.name
    return BookModel.getAll(filter, { skip, limit, sort })
  },

  async getBookById(id) {
    const book = await BookModel.findById(id)
    return book || null
  },

  async createBook(bookData) {
    // Validate category if provided
    if (bookData.category) {
      try {
        // Nếu category là một ID (string), kiểm tra bằng ID
        if (typeof bookData.category === "string" && bookData.category.length === 24) {
          const category = await CategoryModel.findById(bookData.category)
          if (!category) {
            throw new Error("Category not found with provided ID")
          }
        }
        // Nếu category là tên danh mục, kiểm tra bằng tên
        else if (typeof bookData.category === "string") {
          const category = await CategoryModel.findByName(bookData.category)
          if (!category) {
            throw new Error("Category not found with provided name")
          }
        }
      } catch (error) {
        console.error("Error validating category:", error.message)
        // Nếu không tìm thấy danh mục, tạo một danh mục mới
        console.log("Creating book without category validation")
      }
    }

    return BookModel.create(bookData)
  },

  async updateBook(id, updateData) {
    // Check if book exists
    const book = await BookModel.findById(id)
    if (!book) {
      throw new Error("Book not found")
    }

    // Validate category if provided
    if (updateData.category) {
      try {
        // Nếu category là một ID (string), kiểm tra bằng ID
        if (typeof updateData.category === "string" && updateData.category.length === 24) {
          const category = await CategoryModel.findById(updateData.category)
          if (!category) {
            throw new Error("Category not found with provided ID")
          }
        }
        // Nếu category là tên danh mục, kiểm tra bằng tên
        else if (typeof updateData.category === "string") {
          const category = await CategoryModel.findByName(updateData.category)
          if (!category) {
            throw new Error("Category not found with provided name")
          }
        }
      } catch (error) {
        console.error("Error validating category:", error.message)
        // Nếu không tìm thấy danh mục, bỏ qua validation
        console.log("Updating book without category validation")
      }
    }

    return BookModel.update(id, updateData)
  },

  async deleteBook(id) {
    // Check if book exists
    const book = await BookModel.findById(id)
    if (!book) {
      throw new Error("Book not found")
    }

    return BookModel.delete(id)
  },

  async searchBooks(params = {}) {
    return BookModel.searchBooks(params)
  },

  async getBooksByCategory(categoryId, { page = 1, limit = 10 }) {
    // Lấy sách theo category, phân trang
    const skip = (page - 1) * limit
    return BookModel.getAll({ category: categoryId }, { skip, limit, sort: { createdAt: -1 } })
  },

  async getBestsellers(limit = 8) {
    return BookModel.getBestsellers(limit)
  },

  async getNewArrivals(limit = 8) {
    return BookModel.getNewArrivals(limit)
  },

  async updateBookStock(id, quantity) {
    // Check if book exists and has enough stock
    const book = await BookModel.findById(id)
    if (!book) {
      throw new Error("Book not found")
    }

    if (book.stock < quantity) {
      throw new Error("Not enough stock")
    }

    return BookModel.updateStock(id, quantity)
  },
}

module.exports = BookService
