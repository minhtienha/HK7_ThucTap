const express = require("express");
const router = express.Router();
const chiTietGheController = require("../controllers/chiTietGheController");
const { authMiddleware, managerMiddleware } = require("../middleware/authMiddleware");

router.get("/danh-sach", chiTietGheController.layDanhSachChiTietGhe);
router.get("/chi-tiet/:maghe/:mave", chiTietGheController.layChiTietGheTheoMa);
router.post("/them-chi-tiet-ghe", authMiddleware, managerMiddleware, chiTietGheController.themChiTietGhe);
router.put("/cap-nhat/:maghe/:mave", authMiddleware, managerMiddleware, chiTietGheController.capNhatChiTietGhe);
router.delete(
  "/xoa-chi-tiet-ghe/:maghe/:mave",
  authMiddleware, managerMiddleware,
  chiTietGheController.xoaChiTietGhe
);

module.exports = router;
