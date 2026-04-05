const express = require("express");
const router = express.Router();
const rapChieuController = require("../controllers/rapChieuController");
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");

router.get("/danh-sach", rapChieuController.layDanhSachRapChieu);
router.get("/chi-tiet/:marap", rapChieuController.layRapChieuTheoMa);
router.post("/them-rap-chieu", authMiddleware, adminMiddleware, rapChieuController.themRapChieu);
router.put("/cap-nhat/:marap", authMiddleware, adminMiddleware, rapChieuController.capNhatRapChieu);
router.delete("/xoa-rap-chieu/:marap", authMiddleware, adminMiddleware, rapChieuController.xoaRapChieu);

module.exports = router;
