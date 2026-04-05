import { useState, useEffect, useMemo, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../contexts/AuthContext";
import { ticketService } from "../services/ticketService";
import { bookingService } from "../services/bookingService";

const SEAT_PRICES = {
  THUONG: 75000,
  VIP: 110000,
  DOI: 160000,
};

export const useBooking = (movie, maPhong, maSuat, navigate) => {
  const { user } = useContext(AuthContext);

  const [seats, setSeats] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("momo");
  const [isPaying, setIsPaying] = useState(false);
  const [popupMessage, setPopupMessage] = useState(null);

  // Fetch Seats
  useEffect(() => {
    async function fetchSeats() {
      try {
        setIsLoading(true);
        let effectiveRoom = maPhong;
        if (!effectiveRoom && maSuat) {
          const suatData = await bookingService.getShowtimeDetail(maSuat);
          effectiveRoom = suatData?.MAPHONG?.MAPHONG || suatData?.MAPHONG || null;
        }
        if (!effectiveRoom || !maSuat) return;

        const seatData = await bookingService.getSeatsByRoomAndSuat(effectiveRoom, maSuat);
        if (Array.isArray(seatData)) {
          setSeats(
            seatData.sort((a, b) => {
              if (a.HANG === b.HANG) {
                return (Number(a.SO) || 0) - (Number(b.SO) || 0);
              }
              return (a.HANG || "").localeCompare(b.HANG || "");
            })
          );
        }
      } catch (err) {
        setError("Không tải được sơ đồ ghế.");
      } finally {
        setIsLoading(false);
      }
    }
    if (maSuat) fetchSeats();
  }, [maPhong, maSuat]);

  // Total amount memoized
  const totalAmount = useMemo(() => {
    return seats
      .filter((s) => selectedSeats.includes(`${s.HANG}${s.SO}`))
      .reduce((sum, s) => sum + (SEAT_PRICES[s.LOAIGHE] || 75000), 0);
  }, [selectedSeats, seats]);

  const toggleSeat = (seat) => {
    if (seat.TRANGTHAI === "DADAT") return;
    const key = `${seat.HANG}${seat.SO}`;
    setSelectedSeats((prev) => prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]);
  };

  const nextStep = () => {
    if (step === 1 && selectedSeats.length === 0) return;
    setStep((prev) => prev + 1);
  };

  const prevStep = () => setStep((prev) => Math.max(1, prev - 1));

  const handleConfirmPayment = async () => {
    if (!user?.MAKH) {
      alert("Bạn cần đăng nhập!");
      navigate("/login");
      return;
    }

    try {
      setIsPaying(true);
      const selectedMagheList = seats
        .filter((s) => selectedSeats.includes(`${s.HANG}${s.SO}`))
        .map((s) => s.MAGHE);

      if (paymentMethod === "momo") {
        const res = await axios.post("http://localhost:5000/api/thanh-toan/momo", {
          amount: totalAmount.toString(),
          orderId: "CB_" + Date.now(),
          orderInfo: `Vé: ${movie.title}`,
          redirectUrl: `http://localhost:3000/booking-success?seats=${selectedSeats.join(",")}&total=${totalAmount}&movie=${movie.title}`,
          ipnUrl: "https://your-webhook.com/api/momo-callback",
          extraData: JSON.stringify({
            MASUAT: maSuat,
            MAKH: user.MAKH,
            GHE_LIST: selectedMagheList,
            GIAVE: totalAmount / selectedSeats.length,
          }),
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        if (res.data?.payUrl) window.location.href = res.data.payUrl;
        return;
      }

      // Offline payment case
      await ticketService.createTicket({
        MASUAT: maSuat,
        MAKH: user.MAKH,
        GHE_LIST: selectedMagheList,
        GIAVE: totalAmount / selectedSeats.length,
      });
      setStep(3);
    } catch (err) {
      setPopupMessage(err.response?.data?.message || "Thanh toán thất bại!");
    } finally {
      setIsPaying(false);
    }
  };

  return {
    user,
    seats,
    isLoading,
    error,
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
  };
};
