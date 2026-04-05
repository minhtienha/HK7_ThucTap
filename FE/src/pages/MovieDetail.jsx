import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { movieService } from "../services/movieService";
import { bookingService } from "../services/bookingService";
import { reviewService } from "../services/reviewService";
import { useAuth } from "../contexts/AuthContext";

const TABS = [
  { key: "showtimes", label: "Lịch chiếu" },
  { key: "about", label: "Nội dung phim" },
  { key: "reviews", label: "Bình luận" },
];

const MovieDetail = () => {
  // ... (State logic remains the same)
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString().slice(0, 10);
  });
  const [tab, setTab] = useState("showtimes");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState(0);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");

  const resolveUserName = (candidate) => {
    if (!candidate) return "Người dùng";
    if (typeof candidate === "string") return candidate;
    return (
      candidate.HOTEN ||
      candidate.TENKH ||
      candidate.EMAIL ||
      candidate.email ||
      "Người dùng"
    );
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);

  const handleAddReview = async () => {
    if (newRating === 0 || newComment.trim() === "") return;
    if (!user?.MAKH) {
      alert("Bạn cần đăng nhập để đánh giá");
      return;
    }
    try {
      const payload = {
        MAPHIM: (id || "").trim().toUpperCase(),
        MAKH: user.MAKH,
        SOSAO: newRating,
        BINHLUAN: newComment.trim(),
      };
      const created = await reviewService.upsertReview(payload);
      const newItem = {
        id: created?.MADG,
        userId: created?.MAKH?.MAKH || created?.MAKH,
        userName: resolveUserName(created?.MAKH || user),
        rating: created?.SOSAO,
        comment: created?.BINHLUAN,
        createdAt: created?.NGAYDANHGIA,
      };
      setReviews((prev) => [newItem, ...prev]);
      const fresh = await reviewService.getReviewsByMovie(payload.MAPHIM);
      setReviews(fresh.map(mapReviewToView));
      setNewRating(0);
      setNewComment("");
    } catch (err) {
      const msg =
        err?.response?.data?.details || err.message || "Gửi đánh giá thất bại";
      alert(msg);
    }
  };

  useEffect(() => {
    const fetchMovieAndShowtimes = async () => {
      setLoading(true);
      try {
        const m = (id || "").trim().toUpperCase();
        // Use movieService
        const movieData = await movieService.getMovieById(m);
        setMovie(movieData);

        let showtimesData = [];
        try {
          // Use bookingService
          showtimesData = await bookingService.getShowtimesByMovie(m);
        } catch (errShowtime) {
          showtimesData = [];
        }

        const showtimesWithDetails = (
          Array.isArray(showtimesData) ? showtimesData : []
        ).map((showtime) => ({
          ...showtime,
          room: showtime.MAPHONG?.TENPHONG || "Phòng mẫu",
          theater: showtime.MAPHONG?.MARAP?.TENRAP || "CinemaBox VN",
          location: showtime.MAPHONG?.MARAP?.DIACHI || "Q. 10, TP. HCM",
          format: showtime.DINHDANG || "2D",
          maPhong: showtime.MAPHONG?.MAPHONG || showtime.MAPHONG,
          maSuat: showtime.MASUAT,
        }));

        setShowtimes(showtimesWithDetails);
        setError(null);
      } catch (err) {
        setError(`Lỗi: ${err.message || "Lỗi server"}`);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieAndShowtimes();
  }, [id]);

  const mapReviewToView = (r) => {
    return {
      id: r.MADG,
      userId: r?.MAKH?._id || r?.MAKH?.MAKH || r?.MAKH,
      userName: resolveUserName(r?.MAKH),
      rating: r.SOSAO,
      comment: r.BINHLUAN,
      createdAt: r.NGAYDANHGIA,
    };
  };

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const m = (id || "").trim().toUpperCase();
        const list = await reviewService.getReviewsByMovie(m);
        setReviews(list.map(mapReviewToView));
      } catch (e) {
        console.warn("Reviews fetch error:", e.message);
      }
    };
    if (id) fetchReviews();
  }, [id]);

  const formatDateTime = (s) => {
    try {
      const d = new Date(s);
      // Sử dụng getUTC để lấy đúng ngày/tháng bạn đã nhập nếu chuỗi có chữ 'Z'
      // Giúp hiển thị 20:00 05/04 thay vì 03:00 06/04
      const day = String(d.getUTCDate()).padStart(2, "0");
      const month = String(d.getUTCMonth() + 1).padStart(2, "0");
      const year = d.getUTCFullYear();
      const hours = String(d.getUTCHours()).padStart(2, "0");
      const minutes = String(d.getUTCMinutes()).padStart(2, "0");
      const seconds = String(d.getUTCSeconds()).padStart(2, "0");

      return `${hours}:${minutes}:${seconds} ${day}/${month}/${year} (UTC)`;
    } catch {
      return "";
    }
  };

  const handleDeleteReview = (review) => {
    if (!user?.MAKH) {
      alert("Bạn cần đăng nhập để xóa đánh giá");
      return;
    }
    if (review.userId !== user.MAKH) {
      alert("Bạn chỉ có thể xóa đánh giá của chính bạn");
      return;
    }
    setReviewToDelete(review);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!reviewToDelete) return;
    try {
      await reviewService.deleteReview({
        MADG: reviewToDelete.id,
        MAPHIM: id.trim().toUpperCase(),
        MAKH: user.MAKH,
      });
      setReviews((prev) => prev.filter((r) => r.id !== reviewToDelete.id));
    } catch (err) {
      alert(
        err?.response?.data?.details || err.message || "Xóa đánh giá thất bại",
      );
    } finally {
      setShowDeleteModal(false);
      setReviewToDelete(null);
    }
  };

  const handleSelectShowtime = (showtime) => {
    navigate("/booking", {
      state: {
        movie: {
          title: movie.TENPHIM,
          images: movie.HINHANH,
          time: showtime.GIOBATDAU,
          date: showtime.NGAYCHIEU,
          theater: showtime.theater,
          room: showtime.room,
        },
        maPhong: showtime.maPhong || showtime.MAPHONG,
        maSuat: showtime.maSuat || showtime.MASUAT,
      },
    });
  };

  const handleOpenTrailer = () => {
    if (movie?.TRAILER) window.open(movie.TRAILER, "_blank");
    else alert("Trailer không khả dụng");
  };

  const toLocalDateString = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const isShowtimeValid = (showtime) => {
    const now = new Date();
    // Chuyển NGAYCHIEU sang Date object (loại bỏ phần giờ nếu có để so sánh ngày chuẩn)
    const showtimeDate = new Date(showtime.NGAYCHIEU);
    const [hours, minutes] = showtime.GIOBATDAU.split(":");
    showtimeDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    // Nếu là ngày trong tương lai (sau hôm nay), luôn hợp lệ
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const showDay = new Date(showtime.NGAYCHIEU);
    showDay.setHours(0, 0, 0, 0);

    if (showDay > today) return true;

    // Nếu là hôm nay, kiểm tra xem có cách hiện tại ít nhất 30 phút không (giảm từ 60p xuống 30p cho linh hoạt)
    return showtimeDate > new Date(now.getTime() + 1800000);
  };

  if (loading)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center font-black uppercase tracking-widest text-neutral-400">
        Loading movie details...
      </div>
    );
  if (error || !movie)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center font-black uppercase text-primary">
        {error || "Movie not found"}
      </div>
    );

  return (
    <div className="min-h-screen bg-white">
      {/* Movie Hero Section */}
      <section className="relative h-[60vh] md:h-[80vh] w-full overflow-hidden bg-neutral-950">
        {/* Backdrop Image */}
        <div className="absolute inset-0">
          <img
            src={movie.POSTER || movie.HINHANH?.[0]}
            alt={movie.TENPHIM}
            className="w-full h-full object-cover blur-sm opacity-50 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/80 via-transparent to-transparent hidden md:block" />
        </div>

        {/* Content */}
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 md:px-8 pb-16">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-8 md:gap-16">
              {/* Poster */}
              <div className="w-48 md:w-72 aspect-[2/3] rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-4 border-white/10 backdrop-blur-md transform transition-transform hover:scale-105 duration-500">
                <img
                  src={movie.HINHANH?.[0] || movie.POSTER}
                  alt={movie.TENPHIM}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left space-y-6 md:space-y-8">
                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  {movie.THELOAI?.map((g) => (
                    <span
                      key={g}
                      className="bg-primary hover:bg-primary-hover text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-colors shadow-lg shadow-primary/20"
                    >
                      {g}
                    </span>
                  ))}
                </div>

                <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white uppercase leading-[0.85] drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
                  {movie.TENPHIM}
                </h1>

                <div className="flex items-center justify-center md:justify-start gap-8 text-[11px] font-black uppercase tracking-[0.25em] text-neutral-400">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-400/10 rounded-lg">
                      <svg
                        className="w-5 h-5 text-yellow-400 fill-yellow-400"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    </div>
                    <span className="text-white text-lg">
                      {movie.DANHGIA?.toFixed(1) || "N/A"}
                    </span>{" "}
                    <span className="opacity-40">/ 10</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 8v4l3 3" />
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                    </div>
                    <span className="text-white text-lg">
                      {movie.THOILUONG}
                    </span>{" "}
                    <span className="opacity-40">PHÚT</span>
                  </div>
                  <div className="hidden lg:flex items-center gap-3">
                    <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-white text-lg">
                      {new Date(movie.NGAYKHOICHIEU).getFullYear()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center md:justify-start gap-4 pt-4">
                  <button
                    onClick={() => setTab("showtimes")}
                    className="bg-primary hover:bg-primary-hover text-white px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-primary/40 transition-all active:scale-95 group flex items-center gap-3"
                  >
                    <span>Mua vé ngay</span>
                    <svg
                      className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      viewBox="0 0 24 24"
                    >
                      <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                  <button
                    onClick={handleOpenTrailer}
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest border border-white/20 shadow-xl transition-all flex items-center gap-3"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Trailer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <div className="bg-white sticky top-16 z-40 border-b border-neutral-100 backdrop-blur-md bg-white/80">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex justify-center md:justify-start gap-8">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`py-4 text-xs font-black uppercase tracking-widest transition-all relative ${
                  tab === t.key
                    ? "text-primary"
                    : "text-neutral-400 hover:text-neutral-600"
                }`}
              >
                {t.label}
                {tab === t.key && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full shadow-[0_-4px_12px_rgba(229,9,20,0.4)]" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <main className="container mx-auto px-4 md:px-8 py-12 pb-24">
        {tab === "showtimes" && (
          <div className="space-y-12">
            {movie.SAPCHIEU ? (
              <div className="py-24 text-center bg-neutral-50 rounded-[2rem] border border-neutral-100">
                <p className="text-neutral-400 font-bold uppercase tracking-widest text-sm">
                  Phim này chưa khởi chiếu, chưa có suất chiếu.
                </p>
              </div>
            ) : showtimes.length === 0 ? (
              <div className="py-24 text-center bg-neutral-50 rounded-[2rem] border border-neutral-100">
                <p className="text-neutral-400 font-bold uppercase tracking-widest text-sm">
                  Hiện tại chưa có suất chiếu cho phim này.
                </p>
              </div>
            ) : (
              <>
                {/* Date Picker */}
                <div className="flex flex-wrap gap-3 items-center justify-center md:justify-start">
                  {(() => {
                    const days = Array.from({ length: 5 }, (_, i) => {
                      const d = new Date();
                      d.setDate(d.getDate() + i);
                      d.setHours(0, 0, 0, 0);
                      return {
                        key: toLocalDateString(d),
                        label: d.toLocaleDateString("vi-VN", {
                          weekday: "short",
                          day: "2-digit",
                          month: "2-digit",
                        }),
                      };
                    });
                    const datesWithShows = new Set(
                      showtimes
                        .filter((s) => isShowtimeValid(s))
                        .map((s) => toLocalDateString(s.NGAYCHIEU)),
                    );
                    return days.map((d) => {
                      const hasShows = datesWithShows.has(d.key);
                      const isActive = selectedDate === d.key;
                      return (
                        <button
                          key={d.key}
                          disabled={!hasShows}
                          onClick={() => hasShows && setSelectedDate(d.key)}
                          className={`min-w-[100px] h-20 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all border-2 ${
                            isActive
                              ? "bg-primary border-primary text-white shadow-xl shadow-primary/20 scale-105"
                              : hasShows
                                ? "bg-white border-neutral-100 text-neutral-900 hover:border-primary hover:text-primary"
                                : "bg-neutral-50 border-neutral-50 text-neutral-300 cursor-not-allowed"
                          }`}
                        >
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                            {d.label.split(", ")[0]}
                          </span>
                          <span className="text-lg font-black tracking-tighter">
                            {d.label.split(", ")[1]}
                          </span>
                        </button>
                      );
                    });
                  })()}
                </div>

                {/* Theater List */}
                <div className="grid grid-cols-1 gap-6">
                  {(() => {
                    const filtered = showtimes.filter(
                      (s) =>
                        toLocalDateString(s.NGAYCHIEU) === selectedDate &&
                        isShowtimeValid(s),
                    );
                    if (filtered.length === 0) {
                      return (
                        <div className="py-24 text-center font-bold text-neutral-400 uppercase tracking-widest">
                          Không có suất chiếu trong ngày này.
                        </div>
                      );
                    }
                    const byTheater = Object.values(
                      filtered.reduce((acc, st) => {
                        const key = st.theater;
                        if (!acc[key])
                          acc[key] = {
                            theater: st.theater,
                            location: st.location,
                            times: [],
                          };
                        acc[key].times.push(st);
                        return acc;
                      }, {}),
                    );

                    return byTheater.map((th, idx) => (
                      <div
                        key={idx}
                        className="bg-white rounded-[2rem] p-8 border border-neutral-100 shadow-sm hover:shadow-md transition-shadow group"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="space-y-1">
                            <h3 className="text-xl font-black text-neutral-900 uppercase tracking-tight group-hover:text-primary transition-colors">
                              {th.theater}
                            </h3>
                            <p className="text-xs font-bold text-neutral-400 flex items-center gap-2">
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                viewBox="0 0 24 24"
                              >
                                <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {th.location}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-3">
                            {th.times.map((st, i) => (
                              <button
                                key={i}
                                onClick={() => handleSelectShowtime(st)}
                                className="px-6 py-3 bg-neutral-900 text-white rounded-xl font-black text-sm tracking-tight hover:bg-primary transition-all active:scale-95"
                              >
                                {st.GIOBATDAU}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </>
            )}
          </div>
        )}

        {tab === "about" && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary">
                Cốt truyện
              </h3>
              <p className="text-lg text-neutral-600 leading-relaxed font-medium">
                {movie.MOTA}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { label: "Đạo diễn", value: movie.DAODIEN },
                { label: "Diễn viên", value: movie.DANHSACHDV?.join(", ") },
                { label: "Thể loại", value: movie.THELOAI?.join(", ") },
                {
                  label: "Ngày khởi chiếu",
                  value: new Date(movie.NGAYKHOICHIEU).toLocaleDateString(
                    "vi-VN",
                  ),
                },
                { label: "Thời lượng", value: `${movie.THOILUONG} phút` },
                { label: "Định dạng", value: "2D/Digital" },
              ].map((info) => (
                <div
                  key={info.label}
                  className="flex flex-col gap-1 p-6 bg-neutral-50 rounded-2xl border border-neutral-100"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                    {info.label}
                  </span>
                  <span className="text-sm font-black text-neutral-900">
                    {info.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "reviews" && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {movie.SAPCHIEU ? (
              <div className="py-24 text-center font-bold text-neutral-400 uppercase tracking-widest">
                Phim này chưa khởi chiếu, bạn chưa thể đánh giá.
              </div>
            ) : (
              <div className="space-y-12">
                {/* Review Form */}
                <div className="bg-neutral-900 text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  <div className="relative z-10 space-y-6">
                    <h3 className="text-2xl font-black uppercase tracking-tighter italic">
                      Chia sẻ cảm nhận của bạn
                    </h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">
                          Đánh giá sao
                        </label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setNewRating(star)}
                              className={`text-3xl transition-all ${star <= newRating ? "text-yellow-400 scale-110" : "text-neutral-700 hover:text-neutral-600"}`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex-1 space-y-2">
                        <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">
                          Nội dung bình luận
                        </label>
                        <input
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Phim tuyệt vời, kỹ xảo đỉnh..."
                          className="w-full bg-neutral-800 border border-neutral-700 text-white px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all font-bold"
                        />
                      </div>
                      <button
                        onClick={handleAddReview}
                        className="sm:self-end h-14 px-10 bg-primary hover:bg-primary-hover text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 text-xs"
                      >
                        Gửi ngay
                      </button>
                    </div>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mr-2">
                    Lọc:
                  </span>
                  {[0, 5, 4, 3, 2, 1].map((star) => (
                    <button
                      key={star}
                      onClick={() => setFilter(star)}
                      className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                        filter === star
                          ? "bg-neutral-900 border-neutral-900 text-white"
                          : "border-neutral-100 text-neutral-400 hover:border-neutral-200"
                      }`}
                    >
                      {star === 0 ? "Tất cả" : `${star} sao`}
                    </button>
                  ))}
                </div>

                {/* Review List */}
                <div className="grid grid-cols-1 gap-6">
                  {reviews
                    .filter((r) => filter === 0 || r.rating === filter)
                    .map((review) => (
                      <div
                        key={review.id}
                        className="bg-white p-8 rounded-[2rem] border border-neutral-100 shadow-sm space-y-4 relative group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center font-black text-neutral-400 uppercase">
                              {String(review.userName || "U").charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-black text-neutral-900 text-sm uppercase tracking-tight">
                                {String(review.userName || "Người dùng")}
                              </h4>
                              <div className="flex text-xs text-yellow-400">
                                {"★".repeat(review.rating)}
                                {"☆".repeat(5 - review.rating)}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-neutral-300 uppercase letter tracking-widest">
                            {formatDateTime(review.createdAt)}
                          </span>
                        </div>
                        <p className="text-neutral-600 font-medium leading-relaxed">
                          {review.comment}
                        </p>

                        {user?.MAKH === review.userId && (
                          <button
                            onClick={() => handleDeleteReview(review)}
                            className="absolute bottom-8 right-8 text-[10px] font-black text-neutral-300 uppercase tracking-widest hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                          >
                            Xóa bình luận
                          </button>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modals */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl max-w-sm w-full space-y-6 text-center">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto text-primary">
                <svg
                  className="w-10 h-10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-neutral-900 uppercase tracking-tight">
                  Xác nhận xóa?
                </h3>
                <p className="text-neutral-400 text-sm font-medium">
                  Hành động này không thể hoàn tác. Bạn chắc chắn chứ?
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="py-4 bg-neutral-100 text-neutral-600 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-neutral-200 transition-colors"
                >
                  Bỏ qua
                </button>
                <button
                  onClick={confirmDelete}
                  className="py-4 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary-hover active:scale-95 transition-all"
                >
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MovieDetail;
