import React from "react";
import MovieCard from "./MovieCard";

const NowShowingSection = ({ movies, navigate }) => {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-full border border-primary/10">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Live Screening</span>
            </div>
            <h2 className="text-5xl font-black tracking-tighter text-neutral-950 uppercase leading-none">
              Phim <span className="text-primary italic">Đang Chiếu</span>
            </h2>
            <div className="h-1.5 w-32 bg-primary rounded-full shadow-[0_4px_12px_rgba(229,9,20,0.3)]"></div>
          </div>
          <button 
            onClick={() => navigate("/movies")}
            className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-neutral-400 hover:text-primary transition-all group py-2"
          >
            Tất cả phim
            <div className="p-2 rounded-full bg-neutral-50 group-hover:bg-primary/10 transition-colors">
              <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </button>
        </div>

        {movies.length === 0 ? (
          <div className="text-center py-32 bg-neutral-50 rounded-[3rem] border-2 border-dashed border-neutral-100">
            <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6 text-neutral-300">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <p className="text-neutral-400 font-bold uppercase tracking-[0.25em] text-sm">Hiện tại chưa có phim nào đang chiếu.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {movies.slice(0, 8).map((movie) => (
              <MovieCard 
                key={movie.MAPHIM} 
                movie={movie} 
                onClick={() => navigate(`/movies/${movie.MAPHIM}`)} 
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default NowShowingSection;
