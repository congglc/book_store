const Review = require('../models/review.model')

exports.getBookReviews = async (bookId) => {
  return Review.find({ bookId }).populate('userId', 'fullName email')
}

exports.getUserReviews = async (userId) => {
  return Review.find({ userId }).populate('bookId', 'title')
}

exports.createReview = async (data) => {
  return Review.create(data)
}

exports.updateReview = async (id, data) => {
  return Review.findByIdAndUpdate(id, data, { new: true })
}

exports.deleteReview = async (id) => {
  return Review.findByIdAndDelete(id)
} 