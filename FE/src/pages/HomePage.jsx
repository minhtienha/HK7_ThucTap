import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NowShowingSection from "../components/NowShowingSection";
import UpcomingSection from "../components/UpcomingSection";
import {
  getFeaturedMovies,
  getNowShowingMovies,
  getUpcomingMovies,
  getShowtimesByMovie,
  getShowtimeDetail,
  getRoomDetail,
  getTheaterDetail,
} from "../services/api";

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [movies, setMovies] = useState([]);
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const [qbMovieId, setQbMovieId] = useState("");
  const [qbShowtimes, setQbShowtimes] = useState([]);
  const [qbTheater, setQbTheater] = useState("");
  const [qbDate, setQbDate] = useState("");
  const [qbTime, setQbTime] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const featured = await getFeaturedMovies();
        setFeaturedMovies(featured.slice(0, 5));

        const nowShowing = await getNowShowingMovies();
        setMovies(nowShowing);

        const upcoming = await getUpcomingMovies();
        setUpcomingMovies(upcoming);
      } catch (err) {
        console.error("Lỗi khi load dữ liệu:", err);
      }
    }
    fetchData();
  }, []);

  // Tự động chuyển slide cho phim nổi bật
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredMovies.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featuredMovies]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredMovies.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + featuredMovies.length) % featuredMovies.length
    );
  };

  // Xử lý mua vé
  const handleBuyTicketClick = (movie) => {
    navigate(`/movies/${movie.MAPHIM}`);
  };

  const handleOpenTrailer = (movie) => {
    if (movie?.TRAILER) {
      window.open(movie.TRAILER, "_blank");
    } else {
      alert("Trailer không khả dụng");
    }
  };

  useEffect(() => {
    async function fetchQbShowtimes(movieId) {
      try {
        setQbShowtimes([]);
        setQbTheater("");
        setQbDate("");
        setQbTime("");
        if (!movieId) return;

        const showtimesRes = await getShowtimesByMovie(movieId);
        const enriched = await Promise.all(
          showtimesRes.data.map(async (st) => {
            try {
              const suatChieuRes = await getShowtimeDetail(st.MASUAT.MASUAT);
              const phongRes = await getRoomDetail(
                suatChieuRes.data.MAPHONG.MAPHONG
              );
              const rapRes = await getTheaterDetail(phongRes.data.MARAP.MARAP);

              return {
                maSuat: suatChieuRes.data.MASUAT,
                maPhong: suatChieuRes.data.MAPHONG.MAPHONG,
                time: st.GIOBATDAU,
                date: suatChieuRes.data.NGAYCHIEU,
                theater: rapRes.data.TENRAP,
                room: phongRes.data.TENPHONG,
              };
            } catch {
              return null;
            }
          })
        );
        setQbShowtimes(enriched.filter(Boolean));
      } catch (err) {
        console.error("Lỗi lấy suất chiếu cho đặt vé nhanh:", err);
      }
    }

    if (qbMovieId) fetchQbShowtimes(qbMovieId);
  }, [qbMovieId]);

  const qbTheaterOptions = Array.from(
    new Set(qbShowtimes.map((s) => s.theater))
  );
  const qbDateOptions = Array.from(
    new Set(
      qbShowtimes
        .filter((s) => (!qbTheater ? true : s.theater === qbTheater))
        .map((s) => s.date)
    )
  );
  const qbTimeOptions = qbShowtimes
    .filter(
      (s) =>
        (!qbTheater || s.theater === qbTheater) &&
        (!qbDate || s.date === qbDate)
    )
    .map((s) => s.time);

  const handleQuickBook = () => {
    if (!qbMovieId || !qbTheater || !qbDate || !qbTime) return;
    const movie =
      movies.find((m) => m.MAPHIM === qbMovieId) ||
      featuredMovies.find((m) => m.MAPHIM === qbMovieId);
    const chosen = qbShowtimes.find(
      (s) => s.theater === qbTheater && s.date === qbDate && s.time === qbTime
    );
    if (!movie || !chosen) return;
    navigate("/booking", {
      state: {
        movie: {
          title: movie.TENPHIM,
          poster: movie.POSTER,
          time: chosen.time,
          date: chosen.date,
          theater: chosen.theater,
          room: chosen.room,
        },
        maPhong: chosen.maPhong,
        maSuat: chosen.maSuat,
      },
    });
  };

  return (
    <div className="bg-white">
      {/* Hero Slider */}
      <section className="relative h-[60vh] md:h-[85vh] w-full overflow-hidden bg-neutral-900 text-white">
        {featuredMovies.map((movie, index) => (
          <div
            key={movie.MAPHIM}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentSlide ? "opacity-100 scale-100 z-10" : "opacity-0 scale-110 z-0"
            }`}
          >
            {/* Background Image with Parallax-like feel */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] ease-linear"
              style={{ 
                backgroundImage: `url(${movie.POSTER || movie.HINHANH?.[0]})`,
                transform: index === currentSlide ? 'scale(1.1)' : 'scale(1)'
              }}
            />
            
            {/* Professional Cinematic Gradients */}
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />

            {/* Content Container */}
            <div className="container mx-auto px-4 md:px-8 h-full flex flex-col justify-center relative z-20">
              <div className="max-w-2xl space-y-8">
                <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-md px-4 py-2 rounded-full border border-primary/30 text-primary animate-bounce-subtle">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-[0.2em]">Hot Movie Now</span>
                </div>
                
                <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85] text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
                  {movie.TENPHIM}
                </h1>
                
                <p className="text-lg md:text-xl text-neutral-300 font-medium max-w-lg line-clamp-3 drop-shadow-md">
                  {movie.MOTA || "Trải nghiệm điện ảnh đỉnh cao cùng hệ thống rạp hiện đại nhất Việt Nam."}
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-4">
                  <button
                    className="bg-primary hover:bg-primary-hover text-white font-black px-10 py-4 rounded-2xl shadow-2xl shadow-primary/40 transition-all active:scale-95 text-sm uppercase tracking-widest"
                    onClick={() => handleBuyTicketClick(movie)}
                  >
                    Mua vé ngay
                  </button>
                  <button
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-black px-10 py-4 rounded-2xl border border-white/20 transition-all text-sm uppercase tracking-widest flex items-center gap-2"
                    onClick={() => handleOpenTrailer(movie)}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    Xem Trailer
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Custom Slider Navigation */}
        <div className="absolute bottom-12 container left-1/2 -translate-x-1/2 px-4 md:px-8 flex items-center justify-between z-30 pointer-events-none">
          <div className="flex gap-3 pointer-events-auto">
            {featuredMovies.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 transition-all duration-300 rounded-full ${
                  idx === currentSlide ? "w-12 bg-primary" : "w-6 bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
          <div className="flex gap-4 pointer-events-auto">
            <button 
              onClick={prevSlide}
              className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button 
              onClick={nextSlide}
              className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </section>

      <NowShowingSection
        movies={movies}
        handleBuyTicketClick={handleBuyTicketClick}
        navigate={navigate}
      />

      <UpcomingSection
        upcomingMovies={upcomingMovies}
        handleBuyTicketClick={handleBuyTicketClick}
      />

      {/* Quick Booking Section */}
      <section className="py-24 bg-neutral-900 relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter">
              Đặt vé <span className="text-primary italic">Siêu Tốc</span>
            </h2>
            <div className="h-1.5 w-24 bg-primary mx-auto rounded-full"></div>
            <p className="text-neutral-400 font-medium max-w-xl mx-auto uppercase text-xs tracking-widest">
              Tiết kiệm thời gian với hệ thống đặt vé thông minh
            </p>
          </div>

          <div className="bg-neutral-800/50 backdrop-blur-xl p-8 rounded-[2rem] border border-neutral-700/50 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-4">1. Chọn phim</label>
                <select
                  value={qbMovieId}
                  onChange={(e) => setQbMovieId(e.target.value)}
                  className="w-full h-14 bg-neutral-900 border border-neutral-700 text-white px-6 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none appearance-none font-bold"
                >
                  <option value="">Phim đang hot</option>
                  {movies.concat(upcomingMovies).map((m) => (
                    <option key={m.MAPHIM} value={m.MAPHIM}>{m.TENPHIM}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-4">2. Chọn rạp</label>
                <select
                  value={qbTheater}
                  onChange={(e) => {
                    setQbTheater(e.target.value);
                    setQbDate("");
                    setQbTime("");
                  }}
                  disabled={!qbMovieId || qbTheaterOptions.length === 0}
                  className="w-full h-14 bg-neutral-900 border border-neutral-700 text-white px-6 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none appearance-none font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Hệ thống rạp</option>
                  {qbTheaterOptions.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-4">3. Chọn ngày</label>
                <select
                  value={qbDate}
                  onChange={(e) => {
                    setQbDate(e.target.value);
                    setQbTime("");
                  }}
                  disabled={!qbTheater}
                  className="w-full h-14 bg-neutral-900 border border-neutral-700 text-white px-6 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none appearance-none font-bold disabled:opacity-50"
                >
                  <option value="">Lịch chiếu</option>
                  {qbDateOptions.map((d) => (
                    <option key={d} value={d}>
                      {new Date(d).toLocaleDateString("vi-VN", { weekday: 'short', day: '2-digit', month: '2-digit' })}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-4">4. Chọn suất</label>
                <select
                  value={qbTime}
                  onChange={(e) => setQbTime(e.target.value)}
                  disabled={!qbDate}
                  className="w-full h-14 bg-neutral-900 border border-neutral-700 text-white px-6 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none appearance-none font-bold disabled:opacity-50"
                >
                  <option value="">Giờ xem</option>
                  {qbTimeOptions.map((t) => (
                    <option key={t} value={t}>
                      {new Date(t).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" })}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  className="w-full h-14 bg-primary hover:bg-primary-hover disabled:bg-neutral-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:cursor-not-allowed"
                  disabled={!qbTime}
                  onClick={handleQuickBook}
                >
                  Giữ chỗ ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
