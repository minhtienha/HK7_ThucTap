const Phim = require("../models/Phim");
const asyncHandler = require("express-async-handler");
const { sendSuccess, sendError } = require("../utils/responseHelper");

// [GET] Lấy danh sách phim
exports.layDanhSachPhim = asyncHandler(async (req, res) => {
  const danhSachPhim = await Phim.find();
  sendSuccess(res, 200, "Lấy danh sách phim thành công", danhSachPhim);
});

// [GET] Lấy thông tin phim theo MAPHIM
exports.layPhimTheoMa = asyncHandler(async (req, res) => {
  const { maphim } = req.params;
  const phimTimThay = await Phim.findOne({ MAPHIM: maphim.toUpperCase() });
  if (!phimTimThay) {
    return sendError(res, 404, "Phim không tồn tại");
  }
  sendSuccess(res, 200, "Lấy chi tiết phim thành công", phimTimThay);
});

// [POST] Thêm phim mới
exports.themPhim = asyncHandler(async (req, res) => {
  const phimMoi = new Phim(req.body);
  const savedPhim = await phimMoi.save();
  sendSuccess(res, 201, "Thêm phim mới thành công", savedPhim);
});

// [PUT] Cập nhật thông tin phim
exports.capNhatPhim = asyncHandler(async (req, res) => {
  const { maphim } = req.params;
  const phimCapNhat = await Phim.findOneAndUpdate(
    { MAPHIM: maphim.toUpperCase() },
    req.body,
    { new: true }
  );
  if (!phimCapNhat) {
    return sendError(res, 404, "Phim không tồn tại");
  }
  sendSuccess(res, 200, "Cập nhật phim thành công", phimCapNhat);
});

// [DELETE] Xóa phim
exports.xoaPhim = asyncHandler(async (req, res) => {
  const { maphim } = req.params;
  const phimXoa = await Phim.findOneAndDelete({
    MAPHIM: maphim.toUpperCase(),
  });
  if (!phimXoa) {
    return sendError(res, 404, "Phim không tồn tại");
  }
  sendSuccess(res, 200, "Xóa phim thành công");
});

// [GET] Lấy danh sách phim đang chiếu
exports.layPhimDangChieu = asyncHandler(async (req, res) => {
  const phimDangChieu = await Phim.find({ DANGCHIEU: true });
  sendSuccess(res, 200, "Lấy danh sách phim đang chiếu thành công", phimDangChieu);
});

// [GET] Lấy danh sách phim sắp chiếu
exports.layPhimSapChieu = asyncHandler(async (req, res) => {
  const phimSapChieu = await Phim.find({ SAPCHIEU: true });
  sendSuccess(res, 200, "Lấy danh sách phim sắp chiếu thành công", phimSapChieu);
});

// [GET] Tìm kiếm phim theo tên
exports.timKiemPhim = asyncHandler(async (req, res) => {
  const { tenPhim } = req.query;
  const phimTimKiem = await Phim.find({
    TENPHIM: { $regex: tenPhim, $options: "i" },
  });

  if (!phimTimKiem || phimTimKiem.length === 0) {
    return sendError(res, 404, "Không tìm thấy phim phù hợp");
  }
  sendSuccess(res, 200, "Tìm kiếm phim thành công", phimTimKiem);
});

// [PUT] Cập nhật trạng thái phim sắp chiếu (Cron Job)
exports.capNhatPhimSapChieu = asyncHandler(async (req, res) => {
  const today = new Date();
  const result = await Phim.updateMany(
    {
      NGAYKHOICHIEU: { $lte: today },
      SAPCHIEU: true,
    },
    {
      $set: { DANGCHIEU: true, SAPCHIEU: false },
    }
  );
  sendSuccess(res, 200, "Đã cập nhật trạng thái phim dựa trên ngày khởi chiếu.", { modifiedCount: result.modifiedCount });
});
