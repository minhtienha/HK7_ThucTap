# 🎬 Movie Booking System - Hướng Dẫn Sử Dụng Chi Tiết

Tài liệu này cung cấp hướng dẫn toàn diện từ khâu thiết lập môi trường đến quy trình vận hành hệ thống đặt vé xem phim sử dụng MERN Stack (MongoDB, Express, React, Node.js).

---

## 🛠 1. Yêu Cầu Hệ Thống
Trước khi bắt đầu, hãy đảm bảo máy tính của bạn đã cài đặt:
- **Node.js** (Phiên bản 18.0 trở lên)
- **MongoDB** (Local hoặc MongoDB Atlas)
- **ngrok** (Dùng để test tính năng thanh toán MoMo IPN)
- **Tài khoản MoMo Sandbox** (Dành cho nhà phát triển)

---

## 🚀 2. Thiết Lập Dự Án

### Bước 1: Cài đặt Dependencies
Mở terminal và chạy lệnh sau ở cả hai thư mục:
```bash
# Cài đặt cho Backend
cd BE
npm install

# Cài đặt cho Frontend
cd ../FE
npm install
```

### Bước 2: Cấu hình Biến Môi Trường (.env)
Tạo hoặc cập nhật file `BE/.env` với các nội dung sau:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key

# MoMo Sandbox Config
MOMO_PARTNER_CODE=MOMO
MOMO_ACCESS_KEY=...
MOMO_SECRET_KEY=...
MOMO_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api/create
MOMO_REDIRECT_URL=http://localhost:3000/
MOMO_IPN_URL=http://your-ngrok-url/api/thanh-toan/momo/callback
```

---

## 🏃‍♂️ 3. Khởi Chạy Ứng Dụng

### 1. Chạy Backend
```bash
cd BE
npm run dev
```
*Server sẽ chạy tại: `http://localhost:5000`*

### 2. Chạy Frontend (Vite)
```bash
cd FE
npm run dev
```
*Ứng dụng web sẽ chạy tại: `http://localhost:3000`*

### 3. Cấu hình ngrok (Để test MoMo)
Mở terminal mới và chạy:
```bash
ngrok http 5000
```
Sau đó, copy URL `forwarding` (ví dụ: `https://abc-123.ngrok-free.app`) và điền vào `MOMO_IPN_URL` trong file `.env` của Backend.

---

## 📱 4. Quy Trình Người Dùng (User Flow)

### Bước 1: Đăng Ký & Đăng Nhập
1. Truy cập trang chủ.
2. Click **Đăng Ký** để tạo tài khoản mới.
3. **Đăng Nhập** để nhận JWT Token (tự động lưu vào LocalStorage và gán vào Header API).

### Bước 2: Chọn Phim & Suất Chiếu
1. Xem danh sách phim đang chiếu tại trang chủ.
2. Chọn phim yêu thích để xem chi tiết.
3. Chọn Rạp và Suất chiếu phù hợp.

### Bước 3: Đặt Ghế & Thanh Toán
1. Chọn vị trí ghế trên sơ đồ phòng chiếu.
2. Xác nhận thông tin vé.
3. Chọn hình thức thanh toán **MoMo Sandbox**.
4. Bạn sẽ được chuyển hướng đến trang thanh toán của MoMo. Quét mã QR bằng app MoMo (ở chế độ Sandbox) hoặc nhập thông tin thẻ test.
5. Sau khi thanh toán thành công, hệ thống sẽ tự động xác minh chữ ký và cập nhật trạng thái vé.

---

## 👔 5. Quy Trình Quản Trị (Admin Flow)

Truy cập đường dẫn `/admin` (Yêu cầu tài khoản có vai trò `admin` hoặc `manager`).

### 1. Dashboard
- Xem tổng quan về doanh thu và số lượng vé bán ra theo thời gian thực.

### 2. Quản Lý Phim (Movie Manager)
- Thêm phim mới (Tên, mô tả, trailer, poster, trạng thái chiếu).
- Cập nhật thông tin hoặc xóa phim.

### 3. Quản Lý Suất Chiếu (Show Manager)
- Thiết lập lịch chiếu cho từng bộ phim tại các rạp và phòng khác nhau.
- Quản lý giá vé cho từng suất chiếu cụ thể.

### 4. Quản Lý Rạp & Phòng (Theater/Room)
- Quản lý hệ thống cụm rạp trên toàn quốc.
- Thiết lập sơ đồ ghế ngồi cho từng phòng chiếu.

### 5. Lịch Sử Giao Dịch (History)
- Theo dõi chi tiết từng giao dịch thành công.
- Lọc dữ liệu theo Phim, Rạp hoặc Khoảng thời gian để báo cáo doanh thu.

---

## 🔒 6. Các Tính Năng Kỹ Thuật Nổi Bật
- **Bảo mật**: Mật khẩu được mã hóa Bcrypt; Xác thực quyền hạn qua JWT Middleware.
- **Thanh toán**: Tự động xác thực chữ ký (Signature) từ MoMo để chống gian lận giao dịch.
- **UI/UX**: Giao diện Responsive hoàn toàn, hiệu ứng mượt mà với Tailwind CSS v4.
- **Hiệu năng**: Frontend chạy trên Vite cho tốc độ Load trang cực nhanh.

---
*Cảm ơn bạn đã sử dụng hệ thống! Chúc kỳ thực tập của bạn thành công rực rỡ!* 🌟
