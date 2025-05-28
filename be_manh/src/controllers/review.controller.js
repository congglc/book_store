const reviewService = require('../services/review.service')

exports.getBookReviews = async (req, res) => {
  const { bookId } = req.params
  const reviews = await reviewService.getBookReviews(bookId)
  res.json(reviews)
}

exports.getUserReviews = async (req, res) => {
  const userId = req.user._id
  const reviews = await reviewService.getUserReviews(userId)
  res.json(reviews)
}

exports.createReview = async (req, res) => {
  const userId = req.user._id
  const { bookId } = req.params
  const { rating, comment } = req.body
  const review = await reviewService.createReview({ bookId, userId, rating, comment })
  res.status(201).json(review)
}

exports.updateReview = async (req, res) => {
  const { id } = req.params
  const review = await reviewService.updateReview(id, req.body)
  res.json(review)
}

exports.deleteReview = async (req, res) => {
  const { id } = req.params
  await reviewService.deleteReview(id)
  res.json({ message: 'Xóa đánh giá thành công' })
} 