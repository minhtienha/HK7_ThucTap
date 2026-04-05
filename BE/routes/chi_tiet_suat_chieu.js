const express = require("express");
const router = express.Router();
const chiTietSCController = require("../controllers/chiTietSCController");
const { authMiddleware, managerMiddleware } = require("../middleware/authMiddleware");

router.get("/danh-sach", chiTietSCController.layDanhSachChiTietSuat);
router.get("/theo-phim/:maphim", chiTietSCController.layChiTietSuatTheoPhim);
router.get(
  "/chi-tiet-ma-suat/:masuat",
  chiTietSCController.layChiTietSuatChieuTheoMaSuat
);
router.get("/day-du", chiTietSCController.layTatCaChiTietDayDu);
router.post("/them-chi-tiet-suat", authMiddleware, managerMiddleware, chiTietSCController.themChiTietSuat);
router.put(
  "/cap-nhat/:maphim/:masuat/:giobatdau",
  authMiddleware, managerMiddleware,
  chiTietSCController.capNhatChiTietSuat
);
router.delete(
  "/xoa-chi-tiet-suat/:maphim/:masuat/:giobatdau",
  authMiddleware, managerMiddleware,
  chiTietSCController.xoaChiTietSuat
);

module.exports = router;
