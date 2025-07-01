const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const addressController = require('../controllers/address');

router.post('/add', auth, addressController.validateAddress, addressController.createAddress);
router.put('/update', auth, addressController.updateAddress);
router.get('/getAll', auth, addressController.getAllAddresses);
router.delete('/delete/:id', auth, addressController.deleteAddress);

module.exports = router;