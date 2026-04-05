import React from "react";
import { formatCurrency, formatDateTime } from "../../utils/formatters";

const TicketSummary = ({ movie, displayDate, selectedSeats, totalAmount, isPaying, user, onNext, onPrev, step }) => {
  return (
    <div className="lg:col-span-4 lg:sticky lg:top-40 h-fit space-y-6 order-2">
      <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-200 group relative">
        {/* Visual Poster */}
        <div className="hidden lg:block aspect-[4/5] bg-gray-100 relative overflow-hidden">
          <img src={movie.images?.[0]} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-90" />
        </div>

        {/* Mobile Poster View */}
        <div className="lg:hidden flex items-center p-5 border-b-2 border-gray-100 bg-gray-50">
          <div className="relative">
            <img src={movie.images?.[0]} alt={movie.title} className="w-16 h-20 object-cover rounded-xl shadow-lg border-2 border-white mr-5" />
            <div className="absolute -top-2 -right-1 w-6 h-6 bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">{selectedSeats.length}</div>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-black uppercase italic tracking-tighter text-neutral-900 leading-none">{movie.title}</h2>
            <p className="text-[10px] font-black text-primary uppercase mt-1.5 tracking-wider">{displayDate}</p>
          </div>
        </div>

        {/* Info Section */}
        <div className="p-8 md:p-10 relative z-10 lg:-mt-32 lg:bg-white/95 lg:backdrop-blur-md lg:rounded-t-[3rem]">
          <h2 className="hidden lg:block text-3xl font-black uppercase tracking-tighter italic leading-none text-neutral-900 mb-6">{movie.title}</h2>
          
          <div className="flex flex-wrap gap-2.5 mt-0">
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-600 bg-gray-100 py-2 px-4 rounded-xl border border-gray-200">{movie.theater}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-600 bg-gray-100 py-2 px-4 rounded-xl border border-gray-200">{movie.room}</span>
          </div>

          <div className="mt-8 space-y-5 pt-8 border-t-2 border-gray-100">
            <div className="flex justify-between items-center text-[12px]">
              <span className="font-black text-neutral-400 uppercase tracking-widest">Thời gian</span>
              <span className="font-black text-primary text-right">{displayDate}</span>
            </div>
            <div className="flex justify-between items-center text-[12px]">
              <span className="font-black text-neutral-400 uppercase tracking-widest">Vị trí ghế</span>
              <span className="font-black text-neutral-900 truncate max-w-[150px] text-right underline decoration-primary decoration-2 underline-offset-4">{selectedSeats.join(", ") || "--"}</span>
            </div>
            <div className="flex justify-between items-center pt-6 border-t-2 border-neutral-100">
              <span className="text-[11px] font-black uppercase tracking-[0.1em] text-neutral-900">Tổng cộng</span>
              <span className="text-3xl font-black text-primary tracking-tighter">{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          {/* Login Warning for Guests */}
          {!user && (
            <div className="mt-8 bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 animate-pulse">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              <span className="text-[10px] font-black uppercase text-primary tracking-wider">Vui lòng đăng nhập để bắt đầu chuyển sang bước Thanh toán</span>
            </div>
          )}

          <button
            disabled={selectedSeats.length === 0 || isPaying || !user}
            onClick={onNext}
            className="w-full mt-8 bg-primary hover:bg-[#b00000] text-white py-6 rounded-[1.5rem] font-black uppercase tracking-[0.15em] text-xs shadow-2xl shadow-primary/30 transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center gap-3 ring-4 ring-primary/5"
          >
            {isPaying ? "Đang xử lý..." : (
               <span className="flex items-center justify-center gap-3">
                 {step === 1 ? "CHỌN THANH TOÁN" : "XÁC NHẬN MUA VÉ"}
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
               </span>
            )}
          </button>

          {step === 2 && (
             <button onClick={onPrev} className="w-full mt-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 hover:text-neutral-900 transition-colors flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                QUAY LẠI CHỌN GHẾ
             </button>
           )}
        </div>
      </div>
    </div>
  );
};

export default TicketSummary;
