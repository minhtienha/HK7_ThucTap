const express = require("express");
const router = express.Router();
const phongChieuController = require("../controllers/phongChieuController");
const { authMiddleware, managerMiddleware } = require("../middleware/authMiddleware");

router.get("/danh-sach", phongChieuController.layDanhSachPhongChieu);
router.get("/chi-tiet/:maphong", phongChieuController.layPhongChieuTheoMa);
router.post("/them-phong-chieu", authMiddleware, managerMiddleware, phongChieuController.themPhongChieu);
router.put("/cap-nhat/:maphong", authMiddleware, managerMiddleware, phongChieuController.capNhatPhongChieu);
router.delete("/xoa-phong-chieu/:maphong", authMiddleware, managerMiddleware, phongChieuController.xoaPhongChieu);
router.get(
  "/danh-sach-theo-rap/:marap",
  phongChieuController.layDanhSachPhongChieuTheoRap
);

module.exports = router;
