/**
 * Chuẩn hóa phản hồi API thành công
 * @param {object} res 
 * @param {number} statusCode 
 * @param {string} message 
 * @param {any} data 
 */
const sendSuccess = (res, statusCode, message, data = null) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Chuẩn hóa phản hồi API lỗi (Thường dùng trong errorMiddleware)
 * @param {object} res 
 * @param {number} statusCode 
 * @param {string} message 
 */
const sendError = (res, statusCode, message) => {
  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = {
  sendSuccess,
  sendError,
};
