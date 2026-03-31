const paymentService = require('../services/paymentService');

const requestPayment = async (req, res) => {
  try {
    const { slotQuantity = 1, amount = null } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Yêu cầu đăng nhập'
      });
    }

    const data = await paymentService.requestPayment(userId, slotQuantity, amount);
    return res.status(201).json({
      success: true,
      message: 'Tạo đơn thanh toán thành công',
      data
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Tạo đơn thanh toán thất bại'
    });
  }
};

const handleWebhook = async (req, res) => {
  try {
    const webhookData = req.body;
    const result = await paymentService.handleWebhook(webhookData);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Xử lý webhook thất bại'
    });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user?.id;

    const data = await paymentService.getOrderDetails(orderId, userId);
    return res.status(200).json({
      success: true,
      message: 'Lấy thông tin đơn hàng thành công',
      data
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Lấy thông tin đơn hàng thất bại'
    });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const userId = req.user?.id;
    const page = Number.parseInt(req.query.page, 10) || 1;
    const limit = Number.parseInt(req.query.limit, 10) || 20;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Yêu cầu đăng nhập'
      });
    }

    const data = await paymentService.getUserOrders(userId, page, limit);
    return res.status(200).json({
      success: true,
      message: 'Lấy danh sách đơn hàng thành công',
      data
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Lấy danh sách đơn hàng thất bại'
    });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Yêu cầu đăng nhập'
      });
    }

    const data = await paymentService.cancelOrder(orderId, userId);
    return res.status(200).json({
      success: true,
      message: 'Hủy đơn hàng thành công',
      data
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Hủy đơn hàng thất bại'
    });
  }
};

/**
 * Kiểm tra trạng thái thanh toán của đơn hàng
 * Dùng cho AJAX endpoint từ frontend (checkout page)
 * Frontend sẽ định kỳ poll endpoint này để kiểm tra xem thanh toán có thành công chưa
 */
const checkPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user?.id; // Có thể optional tùy setup security

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu orderId'
      });
    }

    const data = await paymentService.checkPaymentStatus(orderId, userId);
    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Kiểm tra trạng thái thanh toán thất bại'
    });
  }
};

module.exports = {
  requestPayment,
  handleWebhook,
  getOrderDetails,
  getUserOrders,
  cancelOrder,
  checkPaymentStatus
};
