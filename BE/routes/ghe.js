const express = require("express");
const router = express.Router();
const gheController = require("../controllers/gheController");
const { authMiddleware, managerMiddleware } = require("../middleware/authMiddleware");

router.get("/danh-sach", gheController.layDanhSachGhe);
router.get("/chi-tiet/:maghe", gheController.layGheTheoMa);
router.get(
  "/theo-phong-va-suat/:maphong/:masuat",
  gheController.layGheTheoPhongVaSuat
);
router.post("/them-ghe", authMiddleware, managerMiddleware, gheController.themGhe);
router.post("/seed-phong", authMiddleware, managerMiddleware, gheController.seedGheChoPhong);
router.put("/cap-nhat/:maghe", authMiddleware, managerMiddleware, gheController.capNhatGhe);
router.delete("/xoa-ghe/:maghe", authMiddleware, managerMiddleware, gheController.xoaGhe);

module.exports = router;
