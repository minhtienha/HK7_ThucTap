const express = require("express");
const router = express.Router();
const danhGiaController = require("../controllers/danhGiaController");

router.get("/theo-phim/:maphim", danhGiaController.layDanhGiaTheoPhim);
router.get("/theo-nguoi-dung/:makh", danhGiaController.layDanhGiaTheoNguoiDung);
router.post("/them", danhGiaController.themDanhGia);
router.put("/cap-nhat", danhGiaController.capNhatDanhGia);
router.delete("/xoa", danhGiaController.xoaDanhGia);

module.exports = router;
