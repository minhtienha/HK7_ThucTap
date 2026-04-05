import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useBooking } from "../hooks/useBooking";
import { formatCurrency, formatDateTime } from "../utils/formatters";
import SimplePopup from "../components/SimplePopup";

// Modular Components
import SeatGrid from "../components/booking/SeatGrid";
import TicketSummary from "../components/booking/TicketSummary";
import PaymentFlow from "../components/booking/PaymentFlow";
import BookingSuccess from "../components/booking/BookingSuccess";

export default function BookingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { movie, maPhong, maSuat } = location.state || {};

  // Custom Hook handles ALL the logic
  const {
    user,
    seats,
    isLoading,
    selectedSeats,
    step,
    paymentMethod,
    isPaying,
    popupMessage,
    totalAmount,
    setPaymentMethod,
    setPopupMessage,
    toggleSeat,
    nextStep,
    prevStep,
    handleConfirmPayment,
  } = useBooking(movie, maPhong, maSuat, navigate);

  // Time formatting memoized
  const displayDate = useMemo(() => formatDateTime(movie?.date, movie?.time), [movie]);

  if (!movie) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-neutral-900 font-black italic">NO MOVIE DATA</div>;

  return (
    <div className="min-h-screen bg-[#f1f3f5] text-neutral-900 selection:bg-primary selection:text-white pb-32">
      {/* Header Info Banner - Remained inside for simple context */}
      <section className="bg-white border-b border-gray-300 sticky top-16 z-30 shadow-md">
        <div className="container mx-auto px-4 md:px-8 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-6">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-neutral-600 hover:text-black">
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div>
              <h1 className="text-lg md:text-2xl font-black uppercase tracking-tight italic leading-none text-neutral-900 truncate max-w-[200px] md:max-w-none">{movie.title}</h1>
              <p className="text-[9px] md:text-sm font-bold text-neutral-600 uppercase tracking-wide mt-1">
                 {movie.theater} • {movie.room} • <span className="text-primary font-black">{displayDate}</span>
              </p>
            </div>
          </div>
          <div className="flex gap-4 items-center">
             <div className="text-right">
                <p className="text-[9px] md:text-[11px] font-black text-neutral-400 uppercase tracking-widest leading-none">Tạm tính</p>
                <p className="text-base md:text-2xl font-black text-primary leading-none mt-1">{formatCurrency(totalAmount)}</p>
             </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 md:px-8 pt-8 md:pt-12 h-full">
        {step < 3 ? (
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Main Dynamic Content Area */}
            <div className="lg:col-span-8 order-1">
              {step === 1 ? (
                <SeatGrid seats={seats} selectedSeats={selectedSeats} toggleSeat={toggleSeat} isLoading={isLoading} />
              ) : (
                <PaymentFlow 
                  paymentMethod={paymentMethod} 
                  setPaymentMethod={setPaymentMethod} 
                  selectedSeats={selectedSeats} 
                  totalAmount={totalAmount} 
                />
              )}
            </div>

            {/* Sticky Sidebar Summary */}
            <TicketSummary 
              movie={movie}
              displayDate={displayDate}
              selectedSeats={selectedSeats}
              totalAmount={totalAmount}
              isPaying={isPaying}
              user={user}
              onNext={step === 1 ? nextStep : handleConfirmPayment}
              onPrev={prevStep}
              step={step}
            />
          </div>
        ) : (
          <BookingSuccess />
        )}
      </main>

      {popupMessage && (
        <SimplePopup message={popupMessage} onConfirm={() => setPopupMessage(null)} type="info" confirmText="Đóng" />
      )}
    </div>
  );
}
