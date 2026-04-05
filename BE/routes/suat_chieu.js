const express = require("express");
const router = express.Router();
const suatChieuController = require("../controllers/suatChieuController");
const { authMiddleware, managerMiddleware } = require("../middleware/authMiddleware");

router.get("/danh-sach", suatChieuController.layDanhSachSuatChieu);
router.get("/chi-tiet/:masuat", suatChieuController.laySuatChieuTheoMa);
router.get("/theo-phim/:maphim", suatChieuController.laySuatChieuTheoPhim);
router.get("/day-du", suatChieuController.layTatCaSuatChieuDayDu);
router.post("/them-suat-chieu", authMiddleware, managerMiddleware, suatChieuController.themSuatChieu);
router.put("/cap-nhat/:masuat", authMiddleware, managerMiddleware, suatChieuController.capNhatSuatChieu);
router.delete("/xoa-suat-chieu/:masuat", authMiddleware, managerMiddleware, suatChieuController.xoaSuatChieu);

module.exports = router;
