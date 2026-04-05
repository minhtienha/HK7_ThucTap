import React from "react";

const SeatGrid = ({ seats, selectedSeats, toggleSeat, isLoading }) => {
  if (isLoading) {
    return <div className="py-20 animate-pulse text-neutral-400 font-black uppercase tracking-widest text-sm">Đang tải sơ đồ ghế...</div>;
  }

  // Group seats by row
  const groupedSeats = Object.entries(
    seats.reduce((acc, s) => ({ ...acc, [s.HANG]: [...(acc[s.HANG] || []), s] }), {})
  ).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="flex flex-col items-center bg-white p-6 md:p-12 rounded-[3rem] shadow-xl border border-gray-200 w-full mb-12">
      {/* Screen Visual */}
      <div className="relative w-full max-w-lg mb-16 md:mb-28 group">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[110%] h-10 md:h-16 bg-gray-300/40 blur-[40px] rounded-[100%] opacity-40" />
        <div className="h-2 w-full bg-gradient-to-r from-transparent via-neutral-400 to-transparent rounded-full relative overflow-hidden shadow-sm">
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-neutral-500 to-transparent" />
        </div>
        <p className="text-center text-[10px] md:text-xs font-black uppercase tracking-[0.6em] text-neutral-900 mt-5 italic">MÀN HÌNH CHÍNH</p>
      </div>

      {/* Seat Grid */}
      <div className="space-y-3 md:space-y-6 px-2 md:px-4 overflow-x-auto w-full flex flex-col items-center pb-6">
        {groupedSeats.map(([row, rowSeats]) => (
          <div key={row} className="flex items-center gap-3 md:gap-6">
            <span className="w-5 md:w-8 text-center text-xs md:text-sm font-black text-neutral-400">{row}</span>
            <div className="flex gap-1.5 md:gap-3">
              {rowSeats.sort((a,b) => a.SO - b.SO).map((seat) => {
                const isSelected = selectedSeats.includes(`${seat.HANG}${seat.SO}`);
                const isBooked = seat.TRANGTHAI === "DADAT";
                return (
                  <button
                    key={seat.MAGHE}
                    disabled={isBooked}
                    onClick={() => toggleSeat(seat)}
                    className={`w-7 h-7 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center text-[10px] md:text-sm font-black transition-all transform hover:scale-105 active:scale-95 shadow-sm border ${
                      isBooked ? "bg-gray-300 text-white border-gray-400 cursor-not-allowed grayscale" :
                      isSelected ? "bg-primary text-white border-primary shadow-lg shadow-primary/30 -translate-y-1 scale-110" :
                      seat.LOAIGHE === "VIP" ? "bg-yellow-100 text-yellow-800 border-yellow-400 hover:bg-yellow-200" :
                      seat.LOAIGHE === "DOI" ? "bg-purple-100 text-purple-800 border-purple-400 hover:bg-purple-200" :
                      "bg-gray-100 text-neutral-800 border-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    {seat.SO}
                  </button>
                );
              })}
            </div>
            <span className="w-5 md:w-8 text-center text-xs md:text-sm font-black text-neutral-400">{row}</span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-6 md:gap-10 mt-12 md:mt-20 pt-8 md:pt-10 border-t border-gray-100 w-full">
        {[
          { label: "Thường", color: "bg-gray-100 border-gray-300" },
          { label: "VIP", color: "bg-yellow-100 border-yellow-400" },
          { label: "Ghế Đôi", color: "bg-purple-100 border-purple-400" },
          { label: "Đang chọn", color: "bg-primary border-primary" },
          { label: "Đã bán", color: "bg-gray-300 border-gray-400" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-3">
            <div className={`w-4 h-4 md:w-5 md:h-5 rounded-md border ${l.color}`} />
            <span className="text-[10px] md:text-xs font-black uppercase tracking-wider text-neutral-600">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeatGrid;
