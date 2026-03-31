const crypto = require('crypto');
const { Order, Invoice, User } = require('../models');

const SEPAY_CONFIG = {
  apiUrl: process.env.SEPAY_API_URL || 'https://api.sepay.vn/v2',
  apiKey: process.env.SECRET_KEY || process.env.SEPAY_API_KEY || '',
  partnerCode: process.env.MERCHANT_ID || process.env.SEPAY_PARTNER_CODE || ''
};

const randomUpperAlphaNumeric = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const bytes = crypto.randomBytes(length);
  let result = '';

  for (let index = 0; index < length; index += 1) {
    result += chars[bytes[index] % chars.length];
  }

  return result;
};

const generateTransferContent = () => `WeddingWeb${randomUpperAlphaNumeric(10)}`;

const generateQRCode = async (order) => {
  try {
    const script = `
    <html>
      <body>
        <p>Vui lòng quét mã QR để thanh toán</p>
        <p>Số tiền: ${order.amount.toLocaleString('vi-VN')} VND</p>
        <p>Đơn hàng: ${order.id}</p>
        <p>Nội dung CK: ${order.transfer_content}</p>
      </body>
    </html>
    `;

    // For now, we'll return QR code generation data
    // In production, you should integrate with actual Sepay API
    const qrCodeUrl = `${SEPAY_CONFIG.apiUrl}/qr-pay?partner=${SEPAY_CONFIG.partnerCode}&amount=${order.amount}&orderCode=${order.id}&description=${encodeURIComponent(order.transfer_content)}`;

    return {
      qrUrl: qrCodeUrl,
      orderCode: order.id,
      amount: order.amount,
      transferContent: order.transfer_content,
      html: script
    };
  } catch (error) {
    const err = new Error('Lỗi tạo mã QR thanh toán');
    err.status = 500;
    throw err;
  }
};

const requestPayment = async (userId, slotQuantity = 1, amount = null) => {
  try {
    // Kiểm tra user tồn tại
    const user = await User.findByPk(userId);
    if (!user) {
      const error = new Error('Không tìm thấy người dùng');
      error.status = 404;
      throw error;
    }

    const normalizedSlotQuantity = Number.parseInt(slotQuantity, 10);
    const normalizedAmount = Number.parseInt(amount, 10);

    if (!Number.isInteger(normalizedSlotQuantity) || normalizedSlotQuantity <= 0) {
      const error = new Error('slotQuantity phải là số nguyên dương');
      error.status = 400;
      throw error;
    }

    if (!Number.isInteger(normalizedAmount) || normalizedAmount <= 0) {
      const error = new Error('amount phải là số nguyên dương (VND)');
      error.status = 400;
      throw error;
    }

    const totalAmount = normalizedAmount;
    const transferContent = generateTransferContent();

    // Tạo đơn hàng
    const order = await Order.create({
      users_id: userId,
      amount: totalAmount,
      slot_quantity: normalizedSlotQuantity,
      status: 'pending',
      transfer_content: transferContent,
      created_at: new Date(),
      updated_at: new Date()
    });

    // Tạo QR code
    const qrData = await generateQRCode(order);

    return {
      order: {
        id: order.id,
        amount: order.amount,
        slotQuantity: order.slot_quantity,
        status: order.status,
        transferContent: order.transfer_content
      },
      qrCode: qrData
    };
  } catch (error) {
    if (error.status) throw error;
    const err = new Error('Lỗi tạo đơn thanh toán');
    err.status = 500;
    err.originalError = error;
    throw err;
  }
};

const handleWebhook = async (webhookData) => {
  try {
    const { orderCode, transactionCode, amount, status, transferContent, description, content } = webhookData;

    // Kiểm tra order tồn tại
    const order = await Order.findOne({
      where: { id: orderCode },
      include: [{ model: User, as: 'user' }]
    });

    if (!order) {
      const error = new Error('Không tìm thấy đơn hàng');
      error.status = 404;
      throw error;
    }

    // Kiểm tra trạng thái thanh toán
    if (status !== 'success' && status !== 1) {
      const error = new Error('Thanh toán không thành công');
      error.status = 400;
      throw error;
    }

    // Kiểm tra số tiền
    if (parseInt(amount, 10) !== parseInt(order.amount, 10)) {
      const error = new Error('Số tiền không khớp');
      error.status = 400;
      throw error;
    }

    // Ưu tiên xác thực nội dung chuyển khoản nếu webhook có gửi lên
    const webhookTransferContent = transferContent || description || content;
    if (webhookTransferContent && webhookTransferContent !== order.transfer_content) {
      const error = new Error('Nội dung chuyển khoản không khớp');
      error.status = 400;
      throw error;
    }

    if (order.status === 'paid') {
      return {
        success: true,
        message: 'Đơn hàng đã được ghi nhận thanh toán trước đó',
        order: {
          id: order.id,
          status: order.status,
          slotAdded: 0
        }
      };
    }

    // Update order status
    order.status = 'paid';
    order.transaction_id = transactionCode;
    order.updated_at = new Date();
    await order.save();

    // Tạo invoice
    await Invoice.create({
      order_id: order.id,
      transaction_id: transactionCode,
      transfer_content: order.transfer_content,
      payment_method: 'sepay',
      paid_at: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    });

    // Cộng slot cho user
    const user = order.user;
    await user.increment('slot', { by: order.slot_quantity });

    return {
      success: true,
      message: 'Thanh toán thành công',
      order: {
        id: order.id,
        status: order.status,
        slotAdded: order.slot_quantity
      }
    };
  } catch (error) {
    if (error.status) throw error;
    const err = new Error('Lỗi xử lý webhook thanh toán');
    err.status = 500;
    err.originalError = error;
    throw err;
  }
};

const getOrderDetails = async (orderId, userId = null) => {
  try {
    const findOptions = { where: { id: orderId } };

    // Nếu có userId, chỉ cho phép xem order của chính mình (trừ admin)
    if (userId) {
      findOptions.where.users_id = userId;
    }

    const order = await Order.findOne({
      ...findOptions,
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'slot'] },
        { model: Invoice, as: 'invoice' }
      ]
    });

    if (!order) {
      const error = new Error('Không tìm thấy đơn hàng');
      error.status = 404;
      throw error;
    }

    return order;
  } catch (error) {
    if (error.status) throw error;
    const err = new Error('Lỗi lấy thông tin đơn hàng');
    err.status = 500;
    throw err;
  }
};

const getUserOrders = async (userId, page = 1, limit = 20) => {
  try {
    const offset = (page - 1) * limit;

    const { count, rows } = await Order.findAndCountAll({
      where: { users_id: userId },
      include: [{ model: Invoice, as: 'invoice' }],
      order: [['created_at', 'DESC']],
      limit,
      offset
    });

    return {
      items: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    };
  } catch (error) {
    const err = new Error('Lỗi lấy danh sách đơn hàng');
    err.status = 500;
    throw err;
  }
};

const cancelOrder = async (orderId, userId) => {
  try {
    const order = await Order.findOne({
      where: { id: orderId, users_id: userId }
    });

    if (!order) {
      const error = new Error('Không tìm thấy đơn hàng');
      error.status = 404;
      throw error;
    }

    if (order.status !== 'pending') {
      const error = new Error('Chỉ có thể hủy đơn hàng ở trạng thái chờ thanh toán');
      error.status = 400;
      throw error;
    }

    order.status = 'cancelled';
    order.updated_at = new Date();
    await order.save();

    return order;
  } catch (error) {
    if (error.status) throw error;
    const err = new Error('Lỗi hủy đơn hàng');
    err.status = 500;
    throw err;
  }
};

module.exports = {
  requestPayment,
  handleWebhook,
  getOrderDetails,
  getUserOrders,
  cancelOrder
};
