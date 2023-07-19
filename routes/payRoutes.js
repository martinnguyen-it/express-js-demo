const express = require('express');
const authController = require('../controllers/authController');
const payController = require('../controllers/payController');

const router = express.Router();

router.post(
    '/create_payment_url',
    authController.isLoggedIn,
    payController.createPaymentURL,
);

router.get('/vnpay_return', payController.vnpayReturn);

module.exports = router;
