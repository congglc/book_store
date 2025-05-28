const OrderService = require("../services/order.service")
const { ObjectId } = require("mongodb")

const OrderController = {
  async createOrder(req, res, next) {
    try {
      const orderData = req.body

      // If user is authenticated, add userId to customerInfo và trường user (ObjectId)
      if (req.user) {
        const userId = typeof req.user.id === 'string' && ObjectId.isValid(req.user.id)
          ? new ObjectId(req.user.id)
          : req.user.id;
        orderData.customerInfo = {
          ...orderData.customerInfo,
          userId: userId,
        }
        orderData.user = userId
      }

      const order = await OrderService.createOrder(orderData)

      res.status(201).json({
        success: true,
        message: "Order created successfully",
        data: order,
      })
    } catch (error) {
      next(error)
    }
  },

  async getOrderById(req, res, next) {
    try {
      const { id } = req.params
      
      // Kiểm tra id có hợp lệ không
      if (!id || (typeof id === 'string' && !ObjectId.isValid(id))) {
        return res.status(400).json({
          success: false,
          message: "Invalid order ID",
        })
      }
      
      const order = await OrderService.getOrderById(id)
      
      // Nếu không tìm thấy đơn hàng, trả về 404
      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        })
      }

      // Check if user is authorized to view this order
      if (
        req.user.role !== "admin" &&
        (!order.customerInfo.userId || order.customerInfo.userId.toString() !== req.user.id)
      ) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to view this order",
        })
      }

      res.status(200).json({
        success: true,
        data: order,
      })
    } catch (error) {
      next(error)
    }
  },

  async updateOrderStatus(req, res, next) {
    try {
      const { id } = req.params
      const { status } = req.body

      const order = await OrderService.updateOrderStatus(id, status)

      res.status(200).json({
        success: true,
        message: "Order status updated successfully",
        data: order,
      })
    } catch (error) {
      next(error)
    }
  },

  async getUserOrders(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query

      const options = {
        skip: (Number.parseInt(page) - 1) * Number.parseInt(limit),
        limit: Number.parseInt(limit),
      }

      const orders = await OrderService.getUserOrders(req.user.id, options)

      res.status(200).json({
        success: true,
        count: orders.length,
        data: orders,
      })
    } catch (error) {
      next(error)
    }
  },

  async getAllOrders(req, res, next) {
    try {
      const { page = 1, limit = 10, status } = req.query

      const query = {}
      if (status) {
        query.status = status
      }

      const options = {
        skip: (Number.parseInt(page) - 1) * Number.parseInt(limit),
        limit: Number.parseInt(limit),
      }

      const orders = await OrderService.getAllOrders(query, options)

      res.status(200).json({
        success: true,
        count: orders.length,
        data: orders,
      })
    } catch (error) {
      next(error)
    }
  },

  // Thêm phương thức mới để lấy thống kê đơn hàng
  async getOrderStats(req, res, next) {
    try {
      const stats = await OrderService.getOrderStats()

      res.status(200).json({
        success: true,
        message: "Order statistics retrieved successfully",
        data: stats,
      })
    } catch (error) {
      console.error("Error in getOrderStats:", error)
      next(error)
    }
  },

  // Thêm phương thức mới để lấy đơn hàng gần đây
  async getRecentOrders(req, res, next) {
    try {
      const { limit = 5 } = req.query
      const orders = await OrderService.getRecentOrders(parseInt(limit))

      res.status(200).json({
        success: true,
        message: "Recent orders retrieved successfully",
        data: orders,
      })
    } catch (error) {
      console.error("Error in getRecentOrders:", error)
      next(error)
    }
  },

  // Thêm phương thức để lấy lịch sử đơn hàng chi tiết
  async getOrderHistory(req, res, next) {
    try {
      const { page = 1, limit = 10, status, startDate, endDate, sort = "desc" } = req.query

      const options = {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        sort: sort === "asc" ? { createdAt: 1 } : { createdAt: -1 },
        status,
        startDate,
        endDate,
      }

      const orders = await OrderService.getOrderHistory(req.user.id, options)

      res.status(200).json({
        success: true,
        message: "Order history retrieved successfully",
        data: orders,
      })
    } catch (error) {
      next(error)
    }
  },
}

module.exports = OrderController
