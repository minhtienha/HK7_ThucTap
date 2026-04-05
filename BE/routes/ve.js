const express = require("express");
const router = express.Router();
const veController = require("../controllers/veController");
const { authMiddleware, managerMiddleware } = require("../middleware/authMiddleware");

router.get("/danh-sach", authMiddleware, managerMiddleware, veController.layDanhSachVe);
router.get("/chi-tiet/:mave", authMiddleware, veController.layVeTheoMa);
router.post("/them-ve", authMiddleware, managerMiddleware, veController.themVe);
router.get("/lay-ve-theo-makh/:makh", authMiddleware, veController.layVeTheoMaKH);
router.post("/dat-ve", authMiddleware, veController.datVeNhieuGhe);

module.exports = router;
