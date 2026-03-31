const express = require('express');
const paymentController = require('../controllers/paymentController');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

// POST - Yêu cầu thanh toán (tạo QR code)
router.post('/request-payment', authenticate, paymentController.requestPayment);

// POST - Webhook callback từ Sepay
router.post('/webhook', paymentController.handleWebhook);

// GET - Lấy chi tiết đơn hàng
router.get('/orders/:orderId', authenticate, paymentController.getOrderDetails);

// GET - Lấy danh sách đơn hàng của user
router.get('/orders', authenticate, paymentController.getUserOrders);

// DELETE - Hủy đơn hàng
router.delete('/orders/:orderId', authenticate, paymentController.cancelOrder);

module.exports = router;
