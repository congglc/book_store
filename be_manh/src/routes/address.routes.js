const express = require('express')
const router = express.Router()
const AddressController = require('../controllers/address.controller')
const authMiddleware = require('../middlewares/auth.middleware')

router.use(authMiddleware.authenticate)

router.get('/', AddressController.getAddresses)
router.post('/', AddressController.createAddress)
router.put('/:id', AddressController.updateAddress)
router.delete('/:id', AddressController.deleteAddress)

module.exports = router 