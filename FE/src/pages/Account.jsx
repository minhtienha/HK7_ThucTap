import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckTicketBooked,
  updateUser,
  getReviewsByUser,
  updateReview,
  deleteReview,
} from "../services/api";
import { AuthContext } from "../contexts/AuthContext";
import SimplePopup from "../components/SimplePopup";
import { validateInput } from "../utils/validation";

const Account = () => {
  const navigate = useNavigate();
  const {
    user: authUser,
    setUser: setAuthUser,
    logout,
  } = useContext(AuthContext);

  // State chung cho tất cả sections
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState("account");
  const [tickets, setTickets] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State cho ProfileForm
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // State cho Reviews
  const [editingReview, setEditingReview] = useState(null);
  const [editForm, setEditForm] = useState({ rating: 5, comment: "" });
  const [popup, setPopup] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeSection]);

  // Fetch tất cả dữ liệu cùng lúc
  useEffect(() => {
    const initializeData = async () => {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        navigate("/login");
        return;
      }

      const userData = JSON.parse(storedUser);
      setUser(userData);
      setEditName(userData?.HOTEN || "");
      setEditPhone(userData?.SDT || "");

      if (!userData?.MAKH) {
        setError("Không tìm thấy thông tin tài khoản");
        setLoading(false);
        return;
      }

      try {
        const [ticketsData, reviewsData] = await Promise.all([
          CheckTicketBooked(userData.MAKH),
          getReviewsByUser(userData.MAKH),
        ]);

        setTickets(ticketsData || []);
        setReviews(processReviewsData(reviewsData));
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
        setError("Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [navigate, authUser]);

  // Helper function để xử lý reviews data
  const processReviewsData = (reviewsData) => {
    if (!reviewsData) return [];

    let processedReviews = [];

    if (Array.isArray(reviewsData)) {
      processedReviews = reviewsData.map((review) => ({
        MADG: review.MADG || review._id,
        TENPHIM:
          review.MAPHIM?.TENPHIM || review.TENPHIM || "Không rõ tên phim",
        BINHLUAN: review.BINHLUAN || "",
        SOSAO: review.SOSAO || 0,
        NGAYDANHGIA: review.NGAYDANHGIA,
        MAPHIM: review.MAPHIM?.MAPHIM || review.MAPHIM,
        HINHANH: review.MAPHIM?.HINHANH || review.HINHANH || null,
      }));
    } else if (typeof reviewsData === "object") {
      processedReviews = [
        {
          MADG: reviewsData.MADG || reviewsData._id,
          TENPHIM:
            reviewsData.MAPHIM?.TENPHIM ||
            reviewsData.TENPHIM ||
            "Không rõ tên phim",
          BINHLUAN: reviewsData.BINHLUAN || "",
          SOSAO: reviewsData.SOSAO || 0,
          NGAYDANHGIA: reviewsData.NGAYDANHGIA,
          MAPHIM: reviewsData.MAPHIM?.MAPHIM || reviewsData.MAPHIM,
          HINHANH: reviewsData.MAPHIM?.HINHANH || reviewsData.HINHANH || null,
        },
      ];
    }

    return processedReviews;
  };

  const handleSaveProfile = async (updatePayload) => {
    if (!user?.MAKH) return;

    try {
      setSavingProfile(true);
      setProfileMsg("");

      const updated = await updateUser(user.MAKH, updatePayload);
      localStorage.setItem(
        "user",
        JSON.stringify({ ...updated, MATKHAU: undefined })
      );
      setUser({ ...updated, MATKHAU: undefined });
      setAuthUser({ ...updated, MATKHAU: undefined });

      setProfileMsg("Cập nhật thành công");
      setIsEditing(false);
      setEditPassword("");

      setTimeout(() => setProfileMsg(""), 2500);
    } catch (e) {
      setProfileMsg(e?.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditName(user?.HOTEN || "");
    setEditPhone(user?.SDT || "");
    setEditPassword("");
    setProfileMsg("");
  };

  // Reviews handlers
  const handleEditReview = (review) => {
    setEditingReview(review);
    setEditForm({
      rating: review.SOSAO || 5,
      comment: review.BINHLUAN || "",
    });
  };

  const handleSaveReviewEdit = async () => {
    if (!user?.MAKH || !editingReview) return;

    try {
      const payload = {
        MAPHIM: editingReview.MAPHIM,
        MAKH: user.MAKH,
        SOSAO: Number(editForm.rating),
        BINHLUAN: editForm.comment,
      };

      await updateReview(payload);

      // Hiển thị thông báo thành công với nút OK
      setPopup({
        type: "info",
        message: "Đã cập nhật đánh giá thành công!",
        onConfirm: () => {
          setPopup(null);
          setEditingReview(null);
          setEditForm({ rating: 5, comment: "" });
        },
        confirmText: "OK",
      });

      // Refresh reviews data
      const updatedReviews = await getReviewsByUser(user.MAKH);
      setReviews(processReviewsData(updatedReviews));
    } catch (error) {
      setPopup({
        type: "info",
        message: "Không thể cập nhật đánh giá: " + error.message,
        onConfirm: () => setPopup(null),
        confirmText: "OK",
      });
    }
  };

  const handleDeleteReview = (review) => {
    setPopup({
      type: "confirm",
      message: "Bạn có chắc muốn xóa đánh giá này?",
      onConfirm: async () => {
        setPopup(null); // Đóng confirm trước khi thực hiện xoá
        try {
          const payload = {
            MADG: review.MADG,
            MAPHIM: review.MAPHIM,
            MAKH: user.MAKH,
          };

          await deleteReview(payload);

          // Hiển thị thông báo thành công với nút OK
          setPopup({
            type: "info",
            message: "Đã xóa đánh giá thành công!",
            onConfirm: () => setPopup(null),
            confirmText: "OK",
          });

          // Refresh reviews data
          const updatedReviews = await getReviewsByUser(user.MAKH);
          setReviews(processReviewsData(updatedReviews));
        } catch (error) {
          setPopup({
            type: "info",
            message: "Không thể xóa đánh giá: " + error.message,
            onConfirm: () => setPopup(null),
            confirmText: "OK",
          });
        }
      },
      confirmText: "Xác nhận",
      cancelText: "Hủy",
    });
  };

  // Format functions
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Vừa xong";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    return formatDate(dateString);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Menu items
  const menuItems = [
    { id: "account", label: "Thông tin cá nhân", icon: "👤" },
    { id: "tickets", label: "Vé đã đặt", icon: "🎟️" },
    { id: "reviews", label: "Đánh giá của tôi", icon: "⭐" },
  ];

  // Validation
  const validateProfile = () => {
    if (!editName.trim()) {
      setProfileMsg("Vui lòng nhập họ tên");
      return false;
    }

    const phoneValidation = validateInput("phone", editPhone);
    if (!phoneValidation.isValid) {
      setProfileMsg(phoneValidation.message);
      return false;
    }

    if (editPassword) {
      const passwordValidation = validateInput("password", editPassword);
      if (!passwordValidation.isValid) {
        setProfileMsg(passwordValidation.message);
        return false;
      }
    }

    return true;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-500">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-4 px-4 md:px-32">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-1/4">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="text-center mb-6">
                <div className="w-24 h-24 rounded-full bg-red-500 text-white flex items-center justify-center text-3xl font-bold mx-auto mb-3">
                  {user?.HOTEN?.charAt(0) || "?"}
                </div>
                <h2 className="text-xl font-semibold">
                  {user?.HOTEN || "Không xác định"}
                </h2>
                <p className="text-gray-500">{user?.EMAIL}</p>
              </div>

              <ul className="space-y-2">
                {menuItems.map((item) => (
                  <li key={item.id}>
                    <button
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3
                        ${
                          activeSection === item.id
                            ? "bg-red-500 text-white"
                            : "hover:bg-gray-100"
                        }`}
                      onClick={() => setActiveSection(item.id)}
                    >
                      <span>{item.icon}</span>
                      {item.label}
                    </button>
                  </li>
                ))}
                <button
                  className="w-full mt-6 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  onClick={handleLogout}
                >
                  <span>🚪</span>
                  Đăng xuất
                </button>
              </ul>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              {error && <p className="text-red-500 mb-4">{error}</p>}

              {/* Profile Section */}
              {activeSection === "account" && (
                <div>
                  <h1 className="text-2xl font-bold mb-6">Thông tin cá nhân</h1>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium break-words">{user?.EMAIL}</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-gray-500">Họ và tên</p>
                        {isEditing ? (
                          <input
                            className="mt-1 w-full border rounded px-3 py-2"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                          />
                        ) : (
                          <p className="font-medium">{user?.HOTEN || "--"}</p>
                        )}
                      </div>
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-gray-500">Số điện thoại</p>
                        {isEditing ? (
                          <input
                            className="mt-1 w-full border rounded px-3 py-2"
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                          />
                        ) : (
                          <p className="font-medium">{user?.SDT || "--"}</p>
                        )}
                      </div>
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-gray-500">Mật khẩu</p>
                        {isEditing ? (
                          <input
                            type="password"
                            className="mt-1 w-full border rounded px-3 py-2"
                            value={editPassword}
                            onChange={(e) => setEditPassword(e.target.value)}
                            placeholder="Nhập mật khẩu mới (tùy chọn)"
                          />
                        ) : (
                          <p className="font-medium">********</p>
                        )}
                      </div>
                    </div>
                    <div>
                      {profileMsg && (
                        <div className="text-sm mt-1 text-gray-600">
                          {profileMsg}
                        </div>
                      )}
                      {isEditing ? (
                        <div className="flex space-x-2">
                          <button
                            className="px-4 py-2 rounded text-white bg-gray-500 hover:bg-gray-600"
                            onClick={handleCancelEdit}
                          >
                            Hủy
                          </button>
                          <button
                            className={`px-4 py-2 rounded text-white ${
                              savingProfile
                                ? "bg-gray-400"
                                : "bg-red-600 hover:bg-red-700"
                            }`}
                            disabled={savingProfile}
                            onClick={() => {
                              if (validateProfile()) {
                                handleSaveProfile({
                                  HOTEN: editName.trim(),
                                  SDT: editPhone.trim(),
                                  ...(editPassword && {
                                    MATKHAU: editPassword,
                                  }),
                                });
                              }
                            }}
                          >
                            {savingProfile ? "Đang lưu..." : "Lưu thay đổi"}
                          </button>
                        </div>
                      ) : (
                        <button
                          className="px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-700"
                          onClick={() => setIsEditing(true)}
                        >
                          Chỉnh sửa
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Tickets Section */}
              {activeSection === "tickets" && (
                <div>
                  <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">
                      Vé đã đặt
                    </h1>
                  </div>
                  {tickets.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-6xl mb-4">🎫</p>
                      <p>Hiện chưa có vé nào được đặt</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {tickets.map((ticket, index) => (
                        <div
                          key={index}
                          className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
                        >
                          <div className="bg-white flex flex-row gap-6 p-4 rounded-lg shadow">
                            {/* Poster */}
                            <div className="flex-shrink-0">
                              <img
                                src={ticket.poster}
                                alt={ticket.tenphim}
                                className="w-36 h-48 object-cover rounded-lg"
                              />
                            </div>

                            {/* Thông tin vé */}
                            <div className="flex-1">
                              <h2 className="text-lg font-bold mb-3">
                                {ticket.tenphim}
                              </h2>
                              <hr className="mb-4" />

                              {/* Grid 2 cột thông tin + 1 cột QR */}
                              <div className="grid grid-cols-3 gap-x-8 gap-y-4 items-start">
                                {/* Cột 1: Ngày chiếu, Rạp, Ghế */}
                                <div className="space-y-4">
                                  <div>
                                    <p className="text-sm text-gray-500">
                                      Ngày chiếu
                                    </p>
                                    <p className="font-medium">
                                      {new Date(
                                        ticket.ngaychieu
                                      ).toLocaleDateString("vi-VN", {
                                        weekday: "long",
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                      })}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Rạp</p>
                                    <p className="font-medium">
                                      {ticket.tenrap}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Ghế</p>
                                    <p className="font-medium">
                                      {ticket.maghe}
                                    </p>
                                  </div>
                                </div>

                                {/* Cột 2: Giờ chiếu, Phòng, Giá vé */}
                                <div className="space-y-4">
                                  <div>
                                    <p className="text-sm text-gray-500">
                                      Giờ chiếu
                                    </p>
                                    <p className="font-medium">
                                      {new Date(
                                        ticket.giobatdau
                                      ).toLocaleTimeString("vi-VN", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}{" "}
                                      -{" "}
                                      {new Date(
                                        ticket.gioketthuc
                                      ).toLocaleTimeString("vi-VN", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">
                                      Phòng
                                    </p>
                                    <p className="font-medium">
                                      {ticket.tenphong}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">
                                      Giá vé
                                    </p>
                                    <p className="font-medium text-red-500">
                                      {ticket.giave}
                                    </p>
                                  </div>
                                </div>

                                {/* Cột 3: QR code */}
                                <div className="flex flex-col items-center">
                                  <p className="text-sm text-gray-500 mb-2">
                                    Mã QR
                                  </p>
                                  <div className="bg-white rounded-lg shadow p-1">
                                    <img
                                      alt={`QR code vé ${ticket.mave}`}
                                      className="w-36 h-36"
                                      src={`https://quickchart.io/qr?text=${encodeURIComponent(
                                        JSON.stringify({
                                          ma_ve: ticket.ma_ve,
                                          makh: ticket.makh,
                                          tenphim: ticket.tenphim,
                                          tenrap: ticket.tenrap,
                                          tenphong: ticket.tenphong,
                                          ngaychieu: new Date(
                                            ticket.ngaychieu
                                          ).toLocaleDateString("vi-VN"),
                                          giobatdau: new Date(
                                            ticket.giobatdau
                                          ).toLocaleTimeString("vi-VN", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          }),
                                          gioketthuc: new Date(
                                            ticket.gioketthuc
                                          ).toLocaleTimeString("vi-VN", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          }),
                                          maghe: ticket.maghe,
                                          giave:
                                            ticket.giave.toLocaleString(
                                              "vi-VN"
                                            ) + " VND",
                                        })
                                      )}&size=250`}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Reviews Section */}
              {activeSection === "reviews" && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">
                    Lịch sử đánh giá của tôi
                  </h2>
                  {reviews.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Bạn chưa có đánh giá nào
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div
                          key={review.MADG}
                          className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow"
                        >
                          <div className="flex gap-4">
                            <div className="flex-shrink-0">
                              <img
                                src={
                                  review.HINHANH ||
                                  `https://via.placeholder.com/120x180?text=${encodeURIComponent(
                                    review.TENPHIM
                                  )}`
                                }
                                alt={review.TENPHIM}
                                className="w-32 h-48 object-cover rounded-md shadow-sm"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-xl text-gray-800 mb-1">
                                    {review.TENPHIM}
                                  </h3>
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs text-gray-500">
                                      {formatTimeAgo(review.NGAYDANHGIA)}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                      •
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {formatDate(review.NGAYDANHGIA)}
                                    </span>
                                  </div>
                                  <div className="flex items-center mb-3">
                                    {[...Array(5)].map((_, i) => (
                                      <span
                                        key={i}
                                        className={`text-xl ${
                                          i < review.SOSAO
                                            ? "text-yellow-400"
                                            : "text-gray-300"
                                        }`}
                                      >
                                        ★
                                      </span>
                                    ))}
                                    <span className="ml-2 text-sm font-medium text-gray-700">
                                      {review.SOSAO}/5 sao
                                    </span>
                                  </div>
                                  <div className="bg-gray-50 p-3 rounded-md">
                                    <p className="text-gray-700 leading-relaxed">
                                      {review.BINHLUAN}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex flex-col space-y-2 ml-4">
                                  <button
                                    onClick={() => handleEditReview(review)}
                                    className="px-3 py-1.5 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                                  >
                                    Sửa
                                  </button>
                                  <button
                                    onClick={() => handleDeleteReview(review)}
                                    className="px-3 py-1.5 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                                  >
                                    Xóa
                                  </button>
                                </div>
                              </div>
                              {editingReview?.MADG === review.MADG && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                                  <h4 className="font-semibold mb-3 text-gray-800">
                                    Chỉnh sửa đánh giá
                                  </h4>
                                  <div className="space-y-4">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Đánh giá sao
                                      </label>
                                      <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                          <span
                                            key={star}
                                            onClick={() =>
                                              setEditForm({
                                                ...editForm,
                                                rating: star,
                                              })
                                            }
                                            className={`cursor-pointer text-2xl transition-colors ${
                                              star <= editForm.rating
                                                ? "text-yellow-500"
                                                : "text-gray-300 hover:text-yellow-400"
                                            }`}
                                          >
                                            ★
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nhận xét
                                      </label>
                                      <textarea
                                        value={editForm.comment}
                                        onChange={(e) =>
                                          setEditForm({
                                            ...editForm,
                                            comment: e.target.value,
                                          })
                                        }
                                        placeholder="Viết nhận xét của bạn..."
                                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows="4"
                                      />
                                    </div>
                                    <div className="flex space-x-3">
                                      <button
                                        onClick={handleSaveReviewEdit}
                                        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                                      >
                                        Lưu thay đổi
                                      </button>
                                      <button
                                        onClick={() => setEditingReview(null)}
                                        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                                      >
                                        Hủy
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Popup Modal */}
        {popup && (
          <SimplePopup
            message={popup.message}
            onClose={() => setPopup(null)}
            onConfirm={popup.onConfirm}
            confirmText={popup.confirmText}
            cancelText={popup.cancelText}
            type={popup.type}
          />
        )}
      </div>
    </div>
  );
};

export default Account;
