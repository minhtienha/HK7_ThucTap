import React from "react";
import { useNavigate } from "react-router-dom";

const BookingSuccess = () => {
  const navigate = useNavigate();
  return (
    <div className="container mx-auto px-4 pt-12 md:pt-20 animate-in zoom-in-95 duration-700">
      <div className="py-16 md:py-24 text-center space-y-10 bg-white p-6 md:p-16 rounded-[4rem] shadow-2xl border-2 border-gray-100">
        <div className="w-24 h-24 md:w-32 md:h-32 bg-green-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-green-500/30 -rotate-3">
          <svg className="w-12 h-12 md:w-16 md:h-16 text-white" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
        </div>
        <div className="space-y-4">
          <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter italic text-neutral-900 leading-none">MUA VÉ THÀNH CÔNG!</h2>
          <p className="text-neutral-500 font-black uppercase tracking-[0.2em] text-xs md:text-sm">Vui lòng kiểm tra email hoặc mục 'Vé của tôi' để lấy mã QR.</p>
        </div>
        <div className="flex flex-col md:flex-row justify-center gap-4 pt-8">
          <button onClick={() => navigate("/")} className="bg-neutral-900 text-white px-12 py-6 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-black transition-all">TRANG CHỦ</button>
          <button onClick={() => navigate("/account")} className="bg-primary text-white px-12 py-6 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-neutral-800 transition-all">LỊCH SỬ ĐẶT VÉ</button>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;
