const Ve = require("../models/Ve");
const ChiTietGhe = require("../models/Chi_tiet_ghe");
const mongoose = require("mongoose");
const ChiTietSuat = require("../models/Chi_tiet_suat_chieu");
const Ghe = require("../models/Ghe");
const { io } = require("../server");
const asyncHandler = require("express-async-handler");
const { sendSuccess, sendError } = require("../utils/responseHelper");

// [GET] Lấy danh sách vé
exports.layDanhSachVe = asyncHandler(async (req, res) => {
  const danhSachVe = await Ve.find()
    .populate({
      path: "MASUAT",
      model: "SuatChieu",
      localField: "MASUAT",
      foreignField: "MASUAT",
      populate: [
        {
          path: "MAPHIM",
          model: "Phim",
          localField: "MAPHIM",
          foreignField: "MAPHIM",
          select: "TENPHIM POSTER",
        },
        {
          path: "MAPHONG",
          model: "PhongChieu",
          localField: "MAPHONG",
          foreignField: "MAPHONG",
          populate: {
            path: "MARAP",
            model: "RapChieu",
            localField: "MARAP",
            foreignField: "MARAP",
            select: "TENRAP TINHTHANH",
          },
        },
      ],
    })
    .populate({
      path: "MAKH",
      model: "NguoiDung",
      localField: "MAKH",
      foreignField: "MAKH",
      select: "TENKH EMAIL",
    })
    .sort({ NGAYMUA: -1 });

  const formattedTickets = await Promise.all(
    danhSachVe.map(async (ticket) => {
      // Lấy danh sách ghế đã đặt cho vé này
      const gheList = await ChiTietGhe.find({ MAVE: ticket.MAVE }).populate({
        path: "MAGHE",
        model: "Ghe",
        localField: "MAGHE",
        foreignField: "MAGHE",
        select: "HANG SO",
      });

      const magheStr = gheList
        .map((g) => `${g.MAGHE?.HANG || ""}${g.MAGHE?.SO || ""}`)
        .join(", ");

      return {
        id: ticket._id,
        ma_ve: ticket.MAVE,
        makh: ticket.MAKH?.MAKH || "",
        tenkh: ticket.MAKH?.TENKH || "",
        tenphim: ticket.MASUAT?.MAPHIM?.TENPHIM || "Không xác định",
        poster: ticket.MASUAT?.MAPHIM?.POSTER || "",
        tenrap: ticket.MASUAT?.MAPHONG?.MARAP?.TENRAP || "Không xác định",
        tinhThanh: ticket.MASUAT?.MAPHONG?.MARAP?.TINHTHANH || "",
        tenphong: ticket.MASUAT?.MAPHONG?.TENPHONG || "Không xác định",
        ngaychieu: ticket.MASUAT?.NGAYCHIEU || "",
        giobatdau: ticket.MASUAT?.GIOBATDAU || "",
        gioketthuc: ticket.MASUAT?.GIOKETTHUC || "",
        maghe: magheStr || "",
        giave: ticket.GIAVE || 0,
        trang_thai: ticket.TRANGTHAI || "confirmed",
        ngaydat: ticket.NGAYMUA || new Date(),
        maphim: ticket.MASUAT?.MAPHIM?._id || "",
        marap: ticket.MASUAT?.MAPHONG?.MARAP?._id || "",
      };
    })
  );

  sendSuccess(res, 200, "Lấy danh sách vé thành công", formattedTickets);
});

// [GET] Lấy vé theo MAKH (user ID)
exports.layVeTheoMaKH = asyncHandler(async (req, res) => {
  const { makh } = req.params;
  if (!makh) {
    res.status(400);
    throw new Error("Thiếu mã khách hàng");
  }

  const danhSachVe = await Ve.find({ MAKH: makh })
    .populate({
      path: "MASUAT",
      model: "SuatChieu",
      localField: "MASUAT",
      foreignField: "MASUAT",
      populate: {
        path: "MAPHONG",
        model: "PhongChieu",
        localField: "MAPHONG",
        foreignField: "MAPHONG",
        populate: {
          path: "MARAP",
          model: "RapChieu",
          localField: "MARAP",
          foreignField: "MARAP",
          select: "TENRAP TINHTHANH",
        },
      },
    })
    .populate({
      path: "MAKH",
      model: "NguoiDung",
      localField: "MAKH",
      foreignField: "MAKH",
      select: "TENKH EMAIL",
    })
    .sort({ NGAYMUA: -1 });

  const formattedTickets = await Promise.all(
    danhSachVe.map(async (ticket) => {
      const masuatCode = ticket.MASUAT?.MASUAT || ticket.MASUAT;
      const chiTietSuat = await ChiTietSuat.findOne({ MASUAT: masuatCode }).populate({
        path: "MAPHIM",
        model: "Phim",
        localField: "MAPHIM",
        foreignField: "MAPHIM",
        select: "TENPHIM POSTER",
      });

      const gheList = await ChiTietGhe.find({ MAVE: ticket.MAVE }).populate({
        path: "MAGHE",
        model: "Ghe",
        localField: "MAGHE",
        foreignField: "MAGHE",
        select: "HANG SO",
      });

      const magheStr = gheList
        .map((g) => `${g.MAGHE?.HANG || ""}${g.MAGHE?.SO || ""}`)
        .join(", ");

      return {
        id: ticket._id,
        ma_ve: ticket.MAVE,
        makh: ticket.MAKH?.MAKH || "",
        tenphim: chiTietSuat?.MAPHIM?.TENPHIM || "Không xác định",
        poster: chiTietSuat?.MAPHIM?.POSTER || "",
        tenrap: ticket.MASUAT?.MAPHONG?.MARAP?.TENRAP || "Không xác định",
        tinhThanh: ticket.MASUAT?.MAPHONG?.MARAP?.TINHTHANH || "",
        tenphong: ticket.MASUAT?.MAPHONG?.TENPHONG || "Không xác định",
        ngaychieu: ticket.MASUAT?.NGAYCHIEU || "",
        giobatdau: chiTietSuat?.GIOBATDAU || "",
        gioketthuc: chiTietSuat?.GIOKETTHUC || "",
        maghe: magheStr || "",
        giave: ticket.GIAVE || 0,
        trang_thai: ticket.TRANGTHAI || "confirmed",
        ngaydat: ticket.NGAYMUA || new Date(),
      };
    })
  );

  sendSuccess(res, 200, "Lấy lịch sử vé thành công", formattedTickets);
});

// [POST] Đặt vé (nhiều ghế) - Logic lõi đã được kiểm duyệt
exports.datVeNhieuGhe = asyncHandler(async (req, res) => {
  const { MASUAT, MAKH, GHE_LIST, GIAVE } = req.body || {};
  if (!MASUAT || !MAKH || !Array.isArray(GHE_LIST) || GHE_LIST.length === 0 || !GIAVE) {
    sendError(res, 400, "Dữ liệu đặt vé không đầy đủ (MASUAT, MAKH, GHE_LIST, GIAVE)");
    return;
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const chiTietList = await ChiTietGhe.find({
      MASUAT,
      MAGHE: { $in: GHE_LIST },
    }).session(session);

    const magheToTrangThai = new Map(chiTietList.map((ct) => [ct.MAGHE, ct.TRANGTHAI]));
    const gheDaDat = GHE_LIST.filter((maghe) => magheToTrangThai.get(maghe) === "DADAT");
    if (gheDaDat.length > 0) {
      throw new Error(`Ghế đã được đặt: ${gheDaDat.join(", ")}`);
    }

    const tongTien = GIAVE * GHE_LIST.length;
    const veMoi = new Ve({ MASUAT, MAKH, GIAVE: tongTien });
    const savedVe = await veMoi.save({ session });

    for (const maghe of GHE_LIST) {
      await ChiTietGhe.findOneAndUpdate(
        { MAGHE: maghe, MASUAT },
        { MAGHE: maghe, MASUAT, MAVE: savedVe.MAVE, TRANGTHAI: "DADAT" },
        { new: true, upsert: true, session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    sendSuccess(res, 201, "Đặt vé thành công", { ticket: savedVe, seats: GHE_LIST });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    sendError(res, 400, err.message || "Lỗi khi xử lý đặt vé");
  }
});

// Các hàm khác có thể được tinh gọn tương tự...
exports.layVeTheoMa = asyncHandler(async (req, res) => {
  const { mave } = req.params;
  const ve = await Ve.findOne({ MAVE: mave }).populate("MASUAT MAKH");
  if (!ve) return sendError(res, 404, "Vé không tồn tại");
  sendSuccess(res, 200, "Lấy thông tin vé thành công", ve);
});

exports.themVe = asyncHandler(async (req, res) => {
  const veMoi = new Ve(req.body);
  const savedVe = await veMoi.save();
  sendSuccess(res, 201, "Thêm vé thành công", savedVe);
});
