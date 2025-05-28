const BookService = require("../services/book.service")
const Book = require("../models/book.model")
const Order = require("../models/order.model")

const BookController = {
  async getAllBooks(req, res, next) {
    try {
      const result = await BookService.getAllBooks(req.query)

      res.status(200).json({
        success: true,
        message: "Books retrieved successfully",
        data: result,
      })
    } catch (error) {
      next(error)
    }
  },

  async getBookById(req, res, next) {
    try {
      const { id } = req.params;
      const book = await BookService.getBookById(req.params.id)
      if (!book) {
        return res.status(200).json({
          success: true,
          message: "Book not found",
          data: null,
        })
      }
      res.status(200).json({
        success: true,
        message: "Book retrieved successfully",
        data: book,
      })
    } catch (error) {
      next(error)
    }
  },

  async createBook(req, res, next) {
    try {
      // Xử lý dữ liệu từ form
      const bookData = { ...req.body }
      
      // Chuyển đổi các trường số
      if (bookData.price) bookData.price = Number(bookData.price)
      if (bookData.originalPrice) bookData.originalPrice = Number(bookData.originalPrice)
      if (bookData.stock) bookData.stock = Number(bookData.stock)
      if (bookData.pages) bookData.pages = Number(bookData.pages)
      
      // Đảm bảo image là string
      if (bookData.image && typeof bookData.image === 'object') {
        console.warn('Image is an object, converting to string:', bookData.image);
        bookData.image = bookData.image.toString();
      }
      
      const book = await BookService.createBook(bookData)
      
      res.status(201).json({
        success: true,
        message: "Tạo sách mới thành công",
        data: book,
      })
    } catch (error) {
      next(error)
    }
  },

  async updateBook(req, res, next) {
    try {
      const { id } = req.params
      const updateData = { ...req.body }
      
      // Chuyển đổi các trường số
      if (updateData.price) updateData.price = Number(updateData.price)
      if (updateData.originalPrice) updateData.originalPrice = Number(updateData.originalPrice)
      if (updateData.stock) updateData.stock = Number(updateData.stock)
      if (updateData.pages) updateData.pages = Number(updateData.pages)
      
      // Đảm bảo image là string
      if (updateData.image && typeof updateData.image === 'object') {
        console.warn('Image is an object, converting to string:', updateData.image);
        updateData.image = updateData.image.toString();
      }
      
      const book = await BookService.updateBook(id, updateData)
      
      res.status(200).json({
        success: true,
        message: "Cập nhật sách thành công",
        data: book,
      })
    } catch (error) {
      next(error)
    }
  },

  async deleteBook(req, res, next) {
    try {
      await BookService.deleteBook(req.params.id)

      res.status(200).json({
        success: true,
        message: "Book deleted successfully",
      })
    } catch (error) {
      next(error)
    }
  },

  // Sách bán chạy: lấy sách có nhiều đơn hàng nhất (dựa vào Order)
  async getBestsellers(req, res, next) {
    try {
      const { limit = 8 } = req.query
      const result = await BookService.getBestsellers(limit)
      res.status(200).json({
        success: true,
        message: "Bestsellers retrieved successfully",
        data: result
      })
    } catch (error) {
      next(error)
    }
  },

  // Sách mới
  async getNewArrivals(req, res, next) {
    try {
      const { limit = 8 } = req.query
      const result = await BookService.getNewArrivals(limit)
      res.status(200).json({
        success: true,
        message: "New arrivals retrieved successfully",
        data: result
      })
    } catch (error) {
      next(error)
    }
  },

  async searchBooks(req, res, next) {
    try {
      const searchParams = {
        name: req.query.name,
        category: req.query.category,
        minPrice: parseFloat(req.query.minPrice),
        maxPrice: parseFloat(req.query.maxPrice),
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        sort: req.query.sort,
      }

      const result = await BookService.searchBooks(searchParams)

      res.status(200).json({
        success: true,
        message: "Tìm kiếm sách thành công",
        data: result,
      })
    } catch (error) {
      console.error("Lỗi khi tìm kiếm sách:", error)
      next(error)
    }
  },

  // Thêm phương thức getBooksByCategory
  async getBooksByCategory(req, res, next) {
    try {
      const { categoryId } = req.params
      const { page = 1, limit = 10 } = req.query
      const result = await BookService.getBooksByCategory(categoryId, { page: Number(page), limit: Number(limit) })
      res.status(200).json({
        success: true,
        message: "Books by category retrieved successfully",
        data: result
      })
    } catch (error) {
      next(error)
    }
  },

  // Thêm phương thức mới để lấy thống kê sách
  async getBookStats(req, res, next) {
    try {
      const stats = await BookService.getBookStats()

      res.status(200).json({
        success: true,
        message: "Book statistics retrieved successfully",
        data: stats,
      })
    } catch (error) {
      next(error)
    }
  },
}

module.exports = BookController
