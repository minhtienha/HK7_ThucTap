/**
 * Định dạng tiền tệ VNĐ
 * @param {number} amount 
 * @returns {string} (VD: 75.000đ)
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
};

/**
 * Định dạng ngày giờ từ ISO String hoặc Date object
 * @param {string|Date} dateStr 
 * @param {string} timeStr (Optional time string like "18:00")
 * @returns {string} (VD: 18:00 - Thứ 2, 06/04)
 */
export const formatDateTime = (dateStr, timeStr = "") => {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    const day = String(d.getUTCDate()).padStart(2, "0");
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    const dayOfWeek = ["CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"][d.getUTCDay()];
    
    let result = `${dayOfWeek}, ${day}/${month}`;
    if (timeStr) result = `${timeStr} - ${result}`;
    return result;
  } catch (err) {
    return "Invalid Date";
  }
};
