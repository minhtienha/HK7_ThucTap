const express = require("express");
const router = express.Router();
const phimController = require("../controllers/phimController");
const { authMiddleware, managerMiddleware } = require("../middleware/authMiddleware");

router.get("/danh-sach", phimController.layDanhSachPhim);
router.get("/chi-tiet/:maphim", phimController.layPhimTheoMa);
router.post("/them-phim", authMiddleware, managerMiddleware, phimController.themPhim);
router.put("/cap-nhat/:maphim", authMiddleware, managerMiddleware, phimController.capNhatPhim);
router.delete("/xoa-phim/:maphim", authMiddleware, managerMiddleware, phimController.xoaPhim);
router.get("/tim-kiem", phimController.timKiemPhim);
router.get("/danh-sach-dang-chieu", phimController.layPhimDangChieu);
router.get("/danh-sach-sap-chieu", phimController.layPhimSapChieu);
router.post("/cap-nhat-phim-sap-chieu", authMiddleware, managerMiddleware, phimController.capNhatPhimSapChieu);

module.exports = router;
