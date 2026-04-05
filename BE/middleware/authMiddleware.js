const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "Vui lòng đăng nhập" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Phiên đăng nhập hết hạn hoặc không hợp lệ" });
  }
};

const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.vaitro !== "admin") {
    return res.status(403).json({ error: "Bạn không có quyền truy cập trang này" });
  }
  next();
};

const managerMiddleware = (req, res, next) => {
  if (!req.user || (req.user.vaitro !== "manager" && req.user.vaitro !== "admin")) {
    return res.status(403).json({ error: "Bạn không có quyền quản lý" });
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware, managerMiddleware };
