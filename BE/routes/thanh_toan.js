const express = require("express");
const router = express.Router();
const thanhToanController = require("../controllers/thanhToanController");
const { authMiddleware } = require("../middleware/authMiddleware");

// Yêu cầu đăng nhập trước khi tạo thanh toán MoMo
router.post("/momo", authMiddleware, thanhToanController.createMoMoPayment);
router.post("/momo/callback", thanhToanController.handleMoMoCallback);

module.exports = router;
