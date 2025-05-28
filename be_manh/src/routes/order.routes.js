const express = require("express")
const router = express.Router()
const OrderController = require("../controllers/order.controller")
const authMiddleware = require("../middlewares/auth.middleware")
const validate = require("../middlewares/validator.middleware")
const orderValidation = require("../validations/order.validation")

// Create a new order (yêu cầu đăng nhập)
router.post("/", authMiddleware.authenticate, validate(orderValidation.createOrder), OrderController.createOrder)

// Sửa route để lấy thống kê đơn hàng - đảm bảo đúng thứ tự
// Đặt route cụ thể trước route với tham số
router.get(
  "/stats",
  authMiddleware.authenticate,
  authMiddleware.authorize("admin"),
  OrderController.getOrderStats
)

// Thêm route mới để lấy đơn hàng gần đây
router.get(
  "/recent",
  authMiddleware.authenticate,
  authMiddleware.authorize("admin"),
  OrderController.getRecentOrders
)

// Các route khác với tham số động
router.get("/:id", authMiddleware.authenticate, OrderController.getOrderById)

// Get current user's orders (authenticated)
router.get("/user/me", authMiddleware.authenticate, OrderController.getUserOrders)

// Get all orders (admin only)
router.get("/", authMiddleware.authenticate, authMiddleware.authorize("admin"), OrderController.getAllOrders)

// Update order status (admin only) - hỗ trợ cả PUT và PATCH
router.patch(
  "/:id/status",
  authMiddleware.authenticate,
  authMiddleware.authorize("admin"),
  validate(orderValidation.updateOrderStatus),
  OrderController.updateOrderStatus,
)

// Thêm route PUT để hỗ trợ cả hai phương thức
router.put(
  "/:id/status",
  authMiddleware.authenticate,
  authMiddleware.authorize("admin"),
  validate(orderValidation.updateOrderStatus),
  OrderController.updateOrderStatus,
)

// Thêm route lấy lịch sử đơn hàng chi tiết
router.get("/history", authMiddleware.authenticate, OrderController.getOrderHistory)

module.exports = router
