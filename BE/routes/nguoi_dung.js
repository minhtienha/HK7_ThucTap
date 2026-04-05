const express = require("express");
const router = express.Router();
const nguoiDungController = require("../controllers/nguoiDungController");
const { authMiddleware, adminMiddleware, managerMiddleware } = require("../middleware/authMiddleware");

router.post("/dang-ky", nguoiDungController.dangKy);
router.post("/dang-nhap", nguoiDungController.dangNhap);
router.get("/chi-tiet/:makh", authMiddleware, nguoiDungController.layKhachHangTheoMa);
router.put("/cap-nhat/:makh", authMiddleware, nguoiDungController.capNhatKhachHang);
router.put("/cap-nhat-mat-khau", authMiddleware, nguoiDungController.capNhatMatKhau);
router.get("/danh-sach", authMiddleware, managerMiddleware, nguoiDungController.layDanhSachNguoiDung);
router.post("/them", authMiddleware, adminMiddleware, nguoiDungController.themNguoiDung);
router.delete("/xoa/:makh", authMiddleware, adminMiddleware, nguoiDungController.xoaKhachHang);

module.exports = router;
