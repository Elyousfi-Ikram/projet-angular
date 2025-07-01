const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

router.post('/add', auth, paymentController.addPaymentMethod);
router.get('/getAll', auth, paymentController.getAllPaymentMethods);
router.delete('/delete/:id', auth, paymentController.deletePaymentMethod);

module.exports = router;