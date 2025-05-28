const OrderModel = require("../models/order.model")
const BookModel = require("../models/book.model")
const UserModel = require("../models/user.model")
const { getDb } = require("../config/database")
const { ObjectId } = require("mongodb")

const OrderService = {
  async createOrder(orderData) {
    // Không ép lại userId ở đây nữa, chỉ nhận từ controller
    if (orderData.user) {
      const user = await UserModel.findById(orderData.user)
      if (!user) throw new Error("User not found")
      orderData.customerInfo = orderData.customerInfo || {}
      orderData.customerInfo.userId = orderData.user
      orderData.user = orderData.user
    }

    // Check stock for each book and update stock
    for (const item of orderData.items) {
      const book = await BookModel.findById(item.id)
      if (!book) {
        throw new Error(`Book with ID ${item.id} not found`)
      }

      if (book.stock < item.quantity) {
        throw new Error(`Not enough stock for book: ${book.title}`)
      }

      // Update book stock
      await BookModel.updateStock(item.id, item.quantity)
    }

    // Create order
    return OrderModel.create(orderData)
  },

  async getOrderById(id) {
    // Kiểm tra id có hợp lệ không
    if (!id || (typeof id === 'string' && !ObjectId.isValid(id))) {
      throw new Error("Invalid order ID")
    }
    
    const order = await OrderModel.findById(id)
    if (!order) {
      throw new Error("Order not found")
    }
    return order
  },

  async updateOrderStatus(id, status) {
    // Validate status
    const validStatuses = ["pending", "processing", "completed", "cancelled"]
    if (!validStatuses.includes(status)) {
      throw new Error("Invalid order status")
    }

    // Check if order exists
    const order = await OrderModel.findById(id)
    if (!order) {
      throw new Error("Order not found")
    }

    // If cancelling an order that was not cancelled before, restore stock
    if (status === "cancelled" && order.status !== "cancelled") {
      for (const item of order.items) {
        await BookModel.updateStock(item.id, -item.quantity) // Negative to add back to stock
      }
    }

    return OrderModel.updateStatus(id, status)
  },

  async getUserOrders(userId, options = {}) {
    // Validate user
    let _userId = userId
    if (typeof _userId === 'string' && ObjectId.isValid(_userId)) {
      _userId = new ObjectId(_userId)
    }
    // Log kiểu và giá trị userId để debug
    console.log('Truy vấn đơn hàng với userId:', _userId, 'Kiểu:', typeof _userId)
    const user = await UserModel.findById(_userId)
    if (!user) {
      throw new Error("User not found")
    }
    return OrderModel.getByUser(_userId, options)
  },

  async getAllOrders(query = {}, options = {}) {
    return OrderModel.getAll(query, options)
  },

  // Thêm phương thức mới để lấy thống kê đơn hàng
  async getOrderStats() {
    const db = getDb()

    // Đếm tổng số đơn hàng
    const totalOrders = await db.collection("orders").countDocuments()

    // Đếm số đơn hàng theo trạng thái
    const ordersByStatus = await db
      .collection("orders")
      .aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            status: "$_id",
            count: 1,
          },
        },
      ])
      .toArray()

    // Chuyển đổi mảng thành đối tượng
    const statusCounts = {
      pending: 0,
      processing: 0,
      completed: 0,
      cancelled: 0,
      total: totalOrders,
    }

    ordersByStatus.forEach((item) => {
      if (item && item.status && statusCounts.hasOwnProperty(item.status)) {
        statusCounts[item.status] = item.count
      }
    })

    return statusCounts
  },

  // Thêm phương thức mới để lấy đơn hàng gần đây
  async getRecentOrders(limit = 5) {
    const db = getDb()

    try {
      const orders = await db
        .collection("orders")
        .find()
        .sort({ createdAt: -1 })
        .limit(parseInt(limit) || 5)
        .toArray()

      return orders || []
    } catch (error) {
      console.error("Error getting recent orders:", error)
      return []
    }
  },

  // Thêm phương thức lấy lịch sử đơn hàng chi tiết
  async getOrderHistory(userId, options = {}) {
    // Validate user
    let _userId = userId
    if (typeof _userId === 'string' && ObjectId.isValid(_userId)) {
      _userId = new ObjectId(_userId)
    }
    const user = await UserModel.findById(_userId)
    if (!user) {
      throw new Error("User not found")
    }

    const { page = 1, limit = 10, sort = { createdAt: -1 }, status, startDate, endDate } = options
    const skip = (page - 1) * limit

    // Xây dựng query
    const query = { "customerInfo.userId": _userId }

    // Lọc theo trạng thái nếu có
    if (status) {
      query.status = status
    }

    // Lọc theo khoảng thời gian
    if (startDate || endDate) {
      query.createdAt = {}

      if (startDate) {
        query.createdAt.$gte = new Date(startDate)
      }

      if (endDate) {
        query.createdAt.$lte = new Date(endDate)
      }
    }

    const db = getDb()

    // Đếm tổng số đơn hàng
    const total = await db.collection("orders").countDocuments(query)

    // Lấy danh sách đơn hàng
    const orders = await db.collection("orders").find(query).sort(sort).skip(skip).limit(limit).toArray()

    return {
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  },
}

module.exports = OrderService
