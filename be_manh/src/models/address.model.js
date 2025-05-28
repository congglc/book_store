const mongoose = require('mongoose')
const Schema = mongoose.Schema

const addressSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
}, { timestamps: true })

module.exports = mongoose.model('Address', addressSchema) 