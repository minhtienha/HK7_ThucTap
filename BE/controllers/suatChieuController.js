const SuatChieuMerged = require("../models/Suat_chieu");
const ChiTietSuat = require("../models/Chi_tiet_suat_chieu");
const asyncHandler = require("express-async-handler");

// [GET] Lấy danh sách tất cả suất chiếu
exports.layDanhSachSuatChieu = asyncHandler(async (req, res) => {
  const danhSachSuatChieu = await SuatChieuMerged.find()
    .populate({
      path: "MAPHONG",
      model: "PhongChieu",
      select: "MAPHONG TENPHONG MARAP",
      populate: {
        path: "MARAP",
        model: "RapChieu",
        select: "MARAP TENRAP",
      },
    })
    .populate({
      path: "MAPHIM",
      model: "Phim",
      select: "MAPHIM TENPHIM THOILUONG",
    });
  const { sendSuccess } = require("../utils/responseHelper");
  sendSuccess(res, 200, "Lấy danh sách suất chiếu thành công", danhSachSuatChieu);
});

// [GET] Lấy suất chiếu theo MASUAT
exports.laySuatChieuTheoMa = asyncHandler(async (req, res) => {
  const { masuat } = req.params;
  const suatChieu = await SuatChieuMerged.findOne({ MASUAT: masuat })
    .populate({
      path: "MAPHONG",
      model: "PhongChieu",
      select: "MAPHONG TENPHONG MARAP",
      populate: {
        path: "MARAP",
        model: "RapChieu",
        select: "MARAP TENRAP",
      },
    })
    .populate({
      path: "MAPHIM",
      model: "Phim",
      select: "MAPHIM TENPHIM THOILUONG",
    });

  if (!suatChieu) {
    res.status(404);
    throw new Error("Suất chiếu không tồn tại");
  }
  res.json(suatChieu);
});

// [GET] Lấy suất chiếu theo MAPHIM (phim)
exports.laySuatChieuTheoPhim = asyncHandler(async (req, res) => {
  const { maphim } = req.params;
  const suatChieu = await SuatChieuMerged.find({ MAPHIM: maphim })
    .populate({
      path: "MAPHONG",
      model: "PhongChieu",
      localField: "MAPHONG",
      foreignField: "MAPHONG",
      select: "MAPHONG TENPHONG MARAP",
      populate: {
        path: "MARAP",
        model: "RapChieu",
        localField: "MARAP",
        foreignField: "MARAP",
        select: "MARAP TENRAP DIACHI TINHTHANH",
      },
    })
    .select("GIOBATDAU GIOKETTHUC NGAYCHIEU MASUAT MAPHONG");

  // if (!suatChieu.length) {
  //   res.status(404);
  //   throw new Error("Không tìm thấy suất chiếu cho phim này");
  // }
  res.json(suatChieu || []);
});

// [GET] Lấy tất cả suất chiếu đầy đủ thông tin (phim, phòng, rạp)
exports.layTatCaSuatChieuDayDu = asyncHandler(async (req, res) => {
  const suatChieu = await SuatChieuMerged.find()
    .populate({
      path: "MAPHIM",
      model: "Phim",
      localField: "MAPHIM",
      foreignField: "MAPHIM",
      select: "MAPHIM TENPHIM",
    })
    .populate({
      path: "MAPHONG",
      model: "PhongChieu",
      localField: "MAPHONG",
      foreignField: "MAPHONG",
      select: "MAPHONG TENPHONG MARAP",
      populate: {
        path: "MARAP",
        model: "RapChieu",
        localField: "MARAP",
        foreignField: "MARAP",
        select: "MARAP TENRAP",
      },
    });

  res.json(suatChieu);
});

// [POST] Thêm suất chiếu mới và tạo chi tiết suất chiếu
exports.themSuatChieu = asyncHandler(async (req, res) => {
  const { NGAYCHIEU, MAPHONG, MAPHIM, GIOBATDAU, GIOKETTHUC } = req.body;

  // Tạo suất chiếu mới
  const suatChieuMoi = new SuatChieuMerged({
    NGAYCHIEU,
    MAPHONG,
    MAPHIM,
    GIOBATDAU,
    GIOKETTHUC,
  });
  const savedSuatChieu = await suatChieuMoi.save();

  // Tạo chi tiết suất chiếu tương ứng
  const chiTietSuatMoi = new ChiTietSuat({
    MAPHIM,
    MASUAT: savedSuatChieu.MASUAT,
    GIOBATDAU: new Date(`${NGAYCHIEU}T${GIOBATDAU}:00`),
    GIOKETTHUC: new Date(`${NGAYCHIEU}T${GIOKETTHUC}:00`),
  });
  await chiTietSuatMoi.save();

  res.status(201).json(savedSuatChieu);
});

// [PUT] Cập nhật suất chiếu và chi tiết suất chiếu
exports.capNhatSuatChieu = asyncHandler(async (req, res) => {
  const { masuat } = req.params;
  const suatChieuCapNhat = await SuatChieuMerged.findOneAndUpdate(
    { MASUAT: masuat },
    req.body,
    { new: true, runValidators: true }
  );
  if (!suatChieuCapNhat) {
    res.status(404);
    throw new Error("Suất chiếu không tồn tại");
  }

  // Cập nhật chi tiết suất chiếu nếu có
  if (req.body.GIOBATDAU || req.body.GIOKETTHUC) {
    const updateData = {};
    const formatDate = (date) => {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };
    const ngayChieuFormatted = formatDate(suatChieuCapNhat.NGAYCHIEU);

    if (req.body.GIOBATDAU) {
      updateData.GIOBATDAU = new Date(
        `${ngayChieuFormatted}T${req.body.GIOBATDAU}:00`
      );
    }
    if (req.body.GIOKETTHUC) {
      updateData.GIOKETTHUC = new Date(
        `${ngayChieuFormatted}T${req.body.GIOKETTHUC}:00`
      );
    }
    await ChiTietSuat.findOneAndUpdate({ MASUAT: masuat }, updateData, {
      new: true,
    });
  }

  res.json(suatChieuCapNhat);
});

// [DELETE] Xóa suất chiếu và chi tiết suất chiếu
exports.xoaSuatChieu = asyncHandler(async (req, res) => {
  const { masuat } = req.params;
  const suatChieuXoa = await SuatChieuMerged.findOneAndDelete({
    MASUAT: masuat,
  });
  if (!suatChieuXoa) {
    res.status(404);
    throw new Error("Suất chiếu không tồn tại");
  }

  // Xóa chi tiết suất chiếu tương ứng
  await ChiTietSuat.findOneAndDelete({ MASUAT: masuat });

  res.json({ message: "Suất chiếu đã được xóa thành công" });
});
