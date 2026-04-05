import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getNowShowingMovies, getUpcomingMovies } from "../services/api";
import MovieCard from "../components/MovieCard";

const MoviesPage = () => {
  const navigate = useNavigate();
  const [nowShowing, setNowShowing] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("Tất cả");
  const [genres, setGenres] = useState(["Tất cả"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nowShowingPage, setNowShowingPage] = useState(1);
  const [upcomingPage, setUpcomingPage] = useState(1);

  const ITEMS_PER_PAGE = 8;

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const [nowMoviesData, upcomingMoviesData] = await Promise.all([
          getNowShowingMovies(),
          getUpcomingMovies(),
        ]);

        const allGenres = [
          ...new Set(
            [...nowMoviesData, ...upcomingMoviesData]
              .flatMap((m) => m.THELOAI || [])
              .map((genre) => genre.charAt(0).toUpperCase() + genre.slice(1).toLowerCase())
          ),
        ];
        setGenres(["Tất cả", ...allGenres]);

        setNowShowing(nowMoviesData);
        setUpcoming(upcomingMoviesData);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách phim:", error);
        setError("Không thể tải danh sách phim");
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [nowShowingPage, upcomingPage, searchTerm, selectedGenre]);

  const filterMovies = (list) =>
    list.filter((movie) => {
      const matchesSearch = movie.TENPHIM.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGenre =
        selectedGenre === "Tất cả" ||
        movie.THELOAI?.some((g) => g.toLowerCase() === selectedGenre.toLowerCase());
      return matchesSearch && matchesGenre;
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-black uppercase tracking-[0.3em] text-primary">Đang tải phim...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-6">
        <div className="text-primary text-6xl">⚠️</div>
        <p className="text-lg font-black text-neutral-900 uppercase tracking-widest">{error}</p>
        <button onClick={() => window.location.reload()} className="px-8 py-3 bg-primary text-white font-black rounded-xl uppercase tracking-widest text-xs">Thử lại</button>
      </div>
    );
  }

  const filteredNowShowing = filterMovies(nowShowing);
  const filteredUpcoming = filterMovies(upcoming);

  const renderPagination = (totalItems, currentPage, setPage) => {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center items-center gap-3 mt-12">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`w-12 h-12 rounded-2xl font-black text-sm transition-all border-2 ${
              currentPage === i + 1
                ? "bg-primary border-primary text-white shadow-xl shadow-primary/20 scale-110"
                : "bg-white border-neutral-100 text-neutral-400 hover:border-primary hover:text-primary"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Header Container */}
      <div className="bg-neutral-50 border-b border-neutral-100 py-20 mb-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-neutral-950 uppercase leading-none">
                Tất cả <span className="text-primary italic">Phim</span>
              </h1>
              <p className="text-neutral-400 font-bold uppercase tracking-[0.2em] text-sm">
                Khám phá & Đặt vé các bộ phim bom tấn mới nhất
              </p>
            </div>

            {/* Modern Filters */}
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative group flex-1 md:w-80">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors group-focus-within:text-primary z-10">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <input
                  type="text"
                  placeholder="Tìm kiếm phim..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-white border-2 border-transparent rounded-2xl focus:border-primary focus:outline-none shadow-sm transition-all font-bold text-neutral-900 placeholder:text-neutral-300"
                />
              </div>
              
              <div className="relative group md:w-48">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 z-10">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                </div>
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="w-full pl-12 pr-8 py-4 bg-white border-2 border-transparent rounded-2xl focus:border-primary focus:outline-none appearance-none shadow-sm transition-all font-bold text-neutral-900 cursor-pointer"
                >
                  {genres.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-300 pointer-events-none">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 space-y-32">
        {/* Now Showing Section */}
        <section>
          <div className="flex items-center gap-6 mb-12">
            <h2 className="text-3xl font-black text-neutral-950 uppercase tracking-tighter shrink-0">Phim Đang Chiếu</h2>
            <div className="h-px bg-neutral-100 w-full" />
            <span className="shrink-0 text-xs font-black text-primary bg-primary/5 px-4 py-2 rounded-full border border-primary/10 tracking-widest">{filteredNowShowing.length} PHIM</span>
          </div>

          {filteredNowShowing.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
                {filteredNowShowing
                  .slice((nowShowingPage - 1) * ITEMS_PER_PAGE, nowShowingPage * ITEMS_PER_PAGE)
                  .map((movie) => (
                    <MovieCard 
                      key={movie.MAPHIM} 
                      movie={movie} 
                      onClick={() => navigate(`/movies/${movie.MAPHIM}`)} 
                    />
                  ))}
              </div>
              {renderPagination(filteredNowShowing.length, nowShowingPage, setNowShowingPage)}
            </>
          ) : (
            <div className="text-center py-24 bg-neutral-50 rounded-[3rem] border-2 border-dashed border-neutral-100">
               <p className="text-neutral-300 font-black uppercase tracking-[0.3em] text-sm italic">Không tìm thấy phim đang chiếu phù hợp</p>
            </div>
          )}
        </section>

        {/* Upcoming Section */}
        <section>
          <div className="flex items-center gap-6 mb-12">
            <h2 className="text-3xl font-black text-neutral-950 uppercase tracking-tighter shrink-0">Phim Sắp Chiếu</h2>
            <div className="h-px bg-neutral-100 w-full" />
            <span className="shrink-0 text-xs font-black text-neutral-400 bg-neutral-50 px-4 py-2 rounded-full border border-neutral-100 tracking-widest">{filteredUpcoming.length} PHIM</span>
          </div>

          {filteredUpcoming.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
                {filteredUpcoming
                  .slice((upcomingPage - 1) * ITEMS_PER_PAGE, upcomingPage * ITEMS_PER_PAGE)
                  .map((movie) => (
                    <MovieCard 
                      key={movie.MAPHIM} 
                      movie={movie} 
                      isUpcoming={true}
                      onClick={() => navigate(`/movies/${movie.MAPHIM}`)} 
                    />
                  ))}
              </div>
              {renderPagination(filteredUpcoming.length, upcomingPage, setUpcomingPage)}
            </>
          ) : (
            <div className="text-center py-24 bg-neutral-50 rounded-[3rem] border-2 border-dashed border-neutral-100">
               <p className="text-neutral-300 font-black uppercase tracking-[0.3em] text-sm italic">Không tìm thấy phim sắp chiếu phù hợp</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default MoviesPage;
