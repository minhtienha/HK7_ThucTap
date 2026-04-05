import React from "react";
import { formatCurrency } from "../../utils/formatters";

const PaymentFlow = ({ paymentMethod, setPaymentMethod, selectedSeats, totalAmount }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white p-6 md:p-12 rounded-[2.5rem] shadow-xl border border-gray-200">
      <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic text-neutral-900 leading-none">Thông tin thanh toán</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pt-4">
        {[
          { id: "momo", label: "Ví MOMO", icon: "M" },
          { id: "card", label: "THẺ NGÂN HÀNG", icon: "ATM" },
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => setPaymentMethod(m.id)}
            className={`p-6 md:p-8 rounded-3xl border-2 transition-all text-left flex items-center justify-between group ${
              paymentMethod === m.id ? "bg-primary/5 border-primary ring-4 ring-primary/10" : "bg-white border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-4 md:gap-6">
              <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center font-black text-xs md:text-lg ${
                 paymentMethod === m.id ? "bg-primary text-white" : "bg-gray-100 text-neutral-400"
              }`}>{m.icon}</div>
              <span className={`text-sm md:text-lg font-black uppercase tracking-tight ${paymentMethod === m.id ? "text-primary" : "text-neutral-900"}`}>{m.label}</span>
            </div>
            <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full border-2 flex items-center justify-center ${
              paymentMethod === m.id ? "bg-primary border-primary text-white shadow-lg" : "border-gray-300"
            }`}>
               {paymentMethod === m.id && <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>}
            </div>
          </button>
        ))}
      </div>

      <div className="bg-gray-100 rounded-[2rem] p-8 md:p-10 border border-gray-200 space-y-6">
         <h3 className="text-lg md:text-2xl font-black uppercase italic tracking-tight text-neutral-900 border-b border-gray-300 pb-4">Tóm tắt đơn hàng</h3>
         <div className="space-y-4">
            <div className="flex justify-between items-center text-sm md:text-base">
              <span className="text-neutral-500 font-black uppercase tracking-widest">Danh sách ghế</span>
              <span className="font-black text-neutral-900 text-lg">{selectedSeats.join(", ")}</span>
            </div>
            <div className="flex justify-between items-center border-t border-gray-300 pt-6">
              <span className="text-neutral-500 font-black uppercase tracking-widest text-lg md:text-xl">Tổng thanh toán</span>
              <span className="text-3xl md:text-5xl font-black text-primary tracking-tighter">{formatCurrency(totalAmount)}</span>
            </div>
         </div>
      </div>
    </div>
  );
};

export default PaymentFlow;
