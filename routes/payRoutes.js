const express = require('express');
const payController = require('../controllers/payController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/vnpay_return', payController.vnpayReturn);

router.use(authMiddleware.isLoggedIn);

router.post('/create_payment_url', payController.createPaymentURL);

router.post('/pay_via_paypal', payController.payViaPaypal);

module.exports = router;
