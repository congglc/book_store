const addressService = require('../services/address.service')

exports.getAddresses = async (req, res) => {
  const userId = req.user._id
  const addresses = await addressService.getAddresses(userId)
  res.json(addresses)
}

exports.createAddress = async (req, res) => {
  const userId = req.user._id
  const address = await addressService.createAddress({ ...req.body, userId })
  res.status(201).json(address)
}

exports.updateAddress = async (req, res) => {
  const { id } = req.params
  const address = await addressService.updateAddress(id, req.body)
  res.json(address)
}

exports.deleteAddress = async (req, res) => {
  const { id } = req.params
  await addressService.deleteAddress(id)
  res.json({ message: 'Xóa địa chỉ thành công' })
} 