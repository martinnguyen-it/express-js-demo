const express = require('express');
const payController = require('../controllers/payController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post(
    '/create_payment_url',
    authMiddleware.isLoggedIn,
    payController.createPaymentURL,
);

router.get('/vnpay_return', payController.vnpayReturn);

module.exports = router;
