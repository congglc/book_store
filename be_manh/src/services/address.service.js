const Address = require('../models/address.model')

exports.getAddresses = async (userId) => {
  return Address.find({ userId })
}

exports.createAddress = async (data) => {
  if (data.isDefault) {
    await Address.updateMany({ userId: data.userId }, { isDefault: false })
  }
  return Address.create(data)
}

exports.updateAddress = async (id, data) => {
  if (data.isDefault) {
    const address = await Address.findById(id)
    await Address.updateMany({ userId: address.userId }, { isDefault: false })
  }
  return Address.findByIdAndUpdate(id, data, { new: true })
}

exports.deleteAddress = async (id) => {
  return Address.findByIdAndDelete(id)
} 