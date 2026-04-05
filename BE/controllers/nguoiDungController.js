const NguoiDung = require("../models/Nguoi_dung");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

// Hàm kiểm tra định dạng email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// [POST] Đăng ký
exports.dangKy = asyncHandler(async (req, res) => {
  const { EMAIL, SDT } = req.body;

  if (!isValidEmail(EMAIL)) {
    res.status(400);
    throw new Error("Email không hợp lệ");
  }

  const existingEmail = await NguoiDung.findOne({ EMAIL });
  if (existingEmail) {
    res.status(400);
    throw new Error("Email đã tồn tại");
  }

  const existingPhone = await NguoiDung.findOne({ SDT });
  if (existingPhone) {
    res.status(400);
    throw new Error("Số điện thoại đã tồn tại");
  }

  const khachHangMoi = new NguoiDung(req.body);
  const savedKH = await khachHangMoi.save();

  const token = jwt.sign(
    { id: savedKH._id, email: savedKH.EMAIL, vaitro: savedKH.VAITRO },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.status(201).json({
    user: {
      MAKH: savedKH.MAKH,
      HOTEN: savedKH.HOTEN,
      EMAIL: savedKH.EMAIL,
      SDT: savedKH.SDT,
      VAITRO: savedKH.VAITRO,
      MARAP: savedKH.MARAP,
    },
    token,
  });
});

// [POST] Đăng nhập
exports.dangNhap = asyncHandler(async (req, res) => {
  const { EMAIL, MATKHAU } = req.body;
  const khachHang = await NguoiDung.findOne({ EMAIL });
  if (!khachHang) {
    res.status(401);
    throw new Error("Email không tồn tại");
  }

  const isMatch = await bcrypt.compare(MATKHAU, khachHang.MATKHAU);
  if (!isMatch) {
    res.status(401);
    throw new Error("Sai mật khẩu");
  }

  if (khachHang.VAITRO === "manager" && !khachHang.MARAP) {
    res.status(403);
    throw new Error("Manager chưa được gán rạp");
  }

  const token = jwt.sign(
    { id: khachHang._id, email: khachHang.EMAIL, vaitro: khachHang.VAITRO },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({
    user: {
      MAKH: khachHang.MAKH,
      HOTEN: khachHang.HOTEN,
      EMAIL: khachHang.EMAIL,
      SDT: khachHang.SDT,
      VAITRO: khachHang.VAITRO,
      MARAP: khachHang.MARAP,
    },
    token,
  });
});

// [GET] Lấy thông tin khách hàng theo ID
exports.layKhachHangTheoMa = asyncHandler(async (req, res) => {
  const { makh } = req.params;
  const khachHang = await NguoiDung.findOne({ MAKH: makh });
  if (!khachHang) {
    res.status(404);
    throw new Error("Khách hàng không tồn tại");
  }
  res.json(khachHang);
});

// [PUT] Cập nhật thông tin khách hàng
exports.capNhatKhachHang = asyncHandler(async (req, res) => {
  const { makh } = req.params;
  const khachHangCapNhat = await NguoiDung.findOneAndUpdate(
    { MAKH: makh },
    req.body,
    { new: true }
  );
  if (!khachHangCapNhat) {
    res.status(404);
    throw new Error("Khách hàng không tồn tại");
  }
  res.json(khachHangCapNhat);
});

// [DELETE] Xóa khách hàng
exports.xoaKhachHang = asyncHandler(async (req, res) => {
  const { makh } = req.params;
  const khachHangXoa = await NguoiDung.findOneAndDelete({ MAKH: makh });
  if (!khachHangXoa) {
    res.status(404);
    throw new Error("Khách hàng không tồn tại");
  }
  res.json({ message: "Khách hàng đã được xóa thành công" });
});

// [PUT] Cập nhật mật khẩu người dùng theo email
exports.capNhatMatKhau = asyncHandler(async (req, res) => {
  const { email, matkhau } = req.body;
  if (!email || !matkhau) {
    res.status(400);
    throw new Error("Thiếu email hoặc mật khẩu");
  }
  const user = await NguoiDung.findOne({ EMAIL: email });
  if (!user) {
    res.status(404);
    throw new Error("Người dùng không tồn tại");
  }
  user.MATKHAU = matkhau;
  await user.save();
  res.json({ message: "Cập nhật mật khẩu thành công" });
});

// [GET] Lấy danh sách người dùng
exports.layDanhSachNguoiDung = asyncHandler(async (req, res) => {
  const nguoiDung = await NguoiDung.find();
  res.json(nguoiDung);
});

// [POST] Thêm người dùng
exports.themNguoiDung = asyncHandler(async (req, res) => {
  const { EMAIL, SDT } = req.body;

  if (!isValidEmail(EMAIL)) {
    res.status(400);
    throw new Error("Email không hợp lệ");
  }

  const existingEmail = await NguoiDung.findOne({ EMAIL });
  if (existingEmail) {
    res.status(400);
    throw new Error("Email đã tồn tại");
  }

  if (SDT) {
    const existingPhone = await NguoiDung.findOne({ SDT });
    if (existingPhone) {
      res.status(400);
      throw new Error("Số điện thoại đã tồn tại");
    }
  }

  const nguoiDungMoi = new NguoiDung(req.body);
  const saved = await nguoiDungMoi.save();
  res.status(201).json(saved);
});
