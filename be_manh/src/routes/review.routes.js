const express = require("express")
const router = express.Router()
const ReviewController = require("../controllers/review.controller")
const authMiddleware = require("../middlewares/auth.middleware")
const validate = require("../middlewares/validator.middleware")
const reviewValidation = require("../validations/review.validation")

// Public routes
router.get("/book/:bookId", ReviewController.getBookReviews)

// Protected routes
router.use(authMiddleware.authenticate)

router.get("/user", ReviewController.getUserReviews)

router.post(
  "/book/:bookId",
  validate(reviewValidation.createReview),
  ReviewController.createReview
)

router.put(
  "/:id",
  validate(reviewValidation.updateReview),
  ReviewController.updateReview
)

router.delete("/:id", ReviewController.deleteReview)

module.exports = router 