import React from "react";

const MovieCard = ({ movie, isUpcoming = false, onClick }) => {
  return (
    <div 
      className="relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 group ring-1 ring-neutral-100 flex flex-col h-full cursor-pointer"
      onClick={onClick}
    >
      {/* Poster Image */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={movie.POSTER || movie.HINHANH?.[0] || "https://parentingwiththebraininmind.com.au/wp-content/uploads/2021/04/Movie-Poster-Coming-Soon.png"}
          alt={movie.TENPHIM}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          loading="lazy"
        />
        
        {/* Rating Badge */}
        {!isUpcoming && (
          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-white text-[10px] font-black tracking-widest z-10 border border-white/10 shadow-lg">
            <svg className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
            {movie.DANHGIA?.toFixed(1) || "N/A"}
          </div>
        )}

        {/* Release Status Badge (Optional) */}
        {isUpcoming && (
          <div className="absolute top-4 left-4 bg-primary px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-white text-[10px] font-black tracking-[0.2em] z-10 shadow-lg shadow-primary/20 uppercase">
             Coming Soon
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-950/20 to-transparent transition-opacity duration-300 opacity-0 group-hover:opacity-100 flex items-end justify-center p-6">
          <button 
            className="w-full py-4 bg-primary text-white text-xs font-black uppercase tracking-[0.25em] rounded-2xl shadow-2xl shadow-primary/40 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 hover:bg-primary-hover active:scale-95 flex items-center justify-center gap-2"
          >
            {isUpcoming ? "Chi tiết" : "Đặt vé ngay"}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Movie Info */}
      <div className="p-6 flex-1 flex flex-col bg-white">
        <h3 className="text-lg font-black text-neutral-900 line-clamp-2 group-hover:text-primary transition-colors mb-2 uppercase tracking-tight leading-tight min-h-[3rem]">
          {movie.TENPHIM}
        </h3>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {movie.THELOAI?.slice(0, 2).map((genre) => (
            <span key={genre} className="text-[10px] font-black text-neutral-400 border border-neutral-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
              {genre}
            </span>
          ))}
        </div>
        
        <div className="mt-auto pt-4 border-t border-neutral-50 flex items-center justify-between text-[11px] font-black text-neutral-500 uppercase tracking-tighter">
          <div className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 opacity-50 text-primary" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M12 8v4l3 3" /><circle cx="12" cy="12" r="10" />
            </svg>
            {movie.THOILUONG} PHÚT
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-neutral-50 text-neutral-900 font-black border border-neutral-100">
            {movie.NGONNGU || "2D • SUB"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
