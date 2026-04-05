import React, { useEffect, useState, useMemo } from "react";
import {
  getAllTickets,
  getMoviesForFilter,
  getTheatersForFilter,
} from "../../services/api";

const ticketsPerPage = 12;

const HistoryManager = () => {
  const [tickets, setTickets] = useState([]);
  const [movies, setMovies] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState("");
  const [selectedTheater, setSelectedTheater] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const toDateString = (d) => d.toISOString().split("T")[0];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [ticketsData, moviesData, theatersData] = await Promise.all([
          getAllTickets(),
          getMoviesForFilter(),
          getTheatersForFilter(),
        ]);
        setTickets(ticketsData || []);
        setMovies(moviesData || []);
        setTheaters(theatersData || []);
      } catch (err) {
        setError("Lỗi khi tải dữ liệu lịch sử vé.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesMovie = !selectedMovie || ticket.maphim === selectedMovie;
      const matchesTheater = !selectedTheater || ticket.marap === selectedTheater;
      const ticketDate = ticket.ngaychieu ? toDateString(new Date(ticket.ngaychieu)) : null;
      const start = startDate || null;
      const end = endDate || null;
      const matchesDate = (!start && !end) || (ticketDate && (!start || ticketDate >= start) && (!end || ticketDate <= end));
      return matchesMovie && matchesTheater && matchesDate;
    });
  }, [tickets, selectedMovie, selectedTheater, startDate, endDate]);

  const totalRevenue = useMemo(() => {
    return filteredTickets.reduce((sum, ticket) => sum + (ticket.giave || 0), 0);
  }, [filteredTickets]);

  const ticketsSold = filteredTickets.length;

  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = filteredTickets.slice(indexOfFirstTicket, indexOfLastTicket);
  const totalPages = Math.ceil(filteredTickets.length / ticketsPerPage);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );
  if (error) return <div className="p-8 text-center text-red-500 font-bold bg-red-50 rounded-3xl border border-red-100">{error}</div>;

  return (
    <div className="p-6 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Lịch sử giao dịch</h3>
          <p className="text-sm text-slate-500">Theo dõi doanh thu và lịch sử đặt vé toàn hệ thống</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-3xl shadow-lg shadow-indigo-100 text-white relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider mb-1">Tổng doanh thu</p>
            <h4 className="text-3xl font-black">{totalRevenue.toLocaleString()} <span className="text-sm font-normal">VND</span></h4>
          </div>
          <svg className="w-24 h-24 absolute -right-4 -bottom-4 text-white/10 group-hover:scale-110 transition-transform duration-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14H11V11H13V16zm0-7H11V7H13V9z"/></svg>
        </div>
        
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Số vé đã bán</p>
          <h4 className="text-3xl font-black text-slate-800">{ticketsSold} <span className="text-sm font-normal text-slate-400 italic">vouchers</span></h4>
          <div className="w-12 h-1 bg-green-400 mt-4 rounded-full"></div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm lg:col-span-2">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[150px]">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Phim</label>
              <select value={selectedMovie} onChange={(e) => setSelectedMovie(e.target.value)} className="w-full bg-slate-50 border-none rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none">
                <option value="">Tất cả</option>
                {movies.map(m => <option key={m._id} value={m._id}>{m.TENPHIM}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Thời gian</label>
              <div className="flex gap-2">
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="flex-1 bg-slate-50 border-none rounded-xl px-2 py-2 text-xs focus:ring-2 focus:ring-indigo-500/20 outline-none" />
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="flex-1 bg-slate-50 border-none rounded-xl px-2 py-2 text-xs focus:ring-2 focus:ring-indigo-500/20 outline-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">
                <th className="px-6 py-4">Khách hàng / Mã vé</th>
                <th className="px-6 py-4">Thông tin suất chiếu</th>
                <th className="px-6 py-4">Vị trí ghế</th>
                <th className="px-6 py-4 text-right">Giá vé</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {currentTickets.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-400 italic">Không tìm thấy giao dịch nào phù hợp.</td>
                </tr>
              ) : (
                currentTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="font-bold text-slate-800">{ticket.tenkh || "Khách vãng lai"}</div>
                      <div className="text-[10px] text-slate-400 font-mono tracking-tighter">ID: {ticket.ma_ve || "---"}</div>
                    </td>
                    <td className="px-6 py-5 uppercase">
                      <div className="text-sm font-bold text-indigo-600 line-clamp-1">{ticket.tenphim}</div>
                      <div className="text-[10px] text-slate-400">{ticket.tenrap} • {ticket.tenphong}</div>
                      <div className="text-[10px] font-bold text-slate-500">
                        {ticket.ngaychieu ? new Date(ticket.ngaychieu).toLocaleDateString("vi-VN") : "---"}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-lg text-xs font-bold">{ticket.maghe || "N/A"}</span>
                    </td>
                    <td className="px-6 py-5 text-right font-black text-slate-700">
                      {ticket.giave ? ticket.giave.toLocaleString() : "0"} <span className="text-[10px] font-normal text-slate-400">đ</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-10 gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-10 h-10 rounded-xl font-medium transition-all ${
                currentPage === i + 1 ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "bg-white text-slate-600 border border-slate-200"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryManager;
