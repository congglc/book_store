const mongoose = require('mongoose')
const Schema = mongoose.Schema

const reviewSchema = new Schema({
  bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
}, { timestamps: true })

module.exports = mongoose.model('Review', reviewSchema) 