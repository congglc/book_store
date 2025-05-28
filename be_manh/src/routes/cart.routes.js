const express = require("express")
const router = express.Router()
const CartController = require("../controllers/cart.controller")
const authMiddleware = require("../middlewares/auth.middleware")
const validate = require("../middlewares/validator.middleware")
const cartValidation = require("../validations/cart.validation")

// Protected routes
router.use(authMiddleware.authenticate)

router.get("/", CartController.getCart)

router.post(
  "/items",
  validate(cartValidation.addToCart),
  CartController.addToCart
)

router.put(
  "/items/:id",
  validate(cartValidation.updateCartItem),
  CartController.updateCartItem
)

router.delete("/items/:id", CartController.removeFromCart)

module.exports = router 