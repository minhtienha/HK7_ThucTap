import React, { useEffect, useState } from "react";
import {
  getAllShowDetails,
  addShow,
  updateShow,
  deleteShow,
  getMovies,
  getTheaters,
  getRoomsByTheater,
} from "../../services/api";

const showsPerPage = 8;
const initialForm = {
  MAPHIM: "",
  MARAP: "",
  MAPHONG: "",
  NGAYCHIEU: "",
  GIOBATDAU: "",
};

const ShowManager = () => {
  const [shows, setShows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedShow, setSelectedShow] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [loading, setLoading] = useState(false);

  const [movies, setMovies] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    fetchShows();
    fetchMovies();
    fetchTheaters();
  }, []);

  const fetchShows = async () => {
    setLoading(true);
    const data = await getAllShowDetails();
    setShows(data || []);
    setLoading(false);
  };

  const fetchMovies = async () => {
    const data = await getMovies();
    setMovies(data || []);
  };

  const fetchTheaters = async () => {
    const data = await getTheaters();
    setTheaters(data || []);
  };

  const fetchRooms = async (maRap) => {
    if (!maRap) {
      setRooms([]);
      return;
    }
    const data = await getRoomsByTheater(maRap);
    setRooms(data || []);
  };

  useEffect(() => {
    if (form.MARAP) fetchRooms(form.MARAP);
    else setRooms([]);
  }, [form.MARAP]);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("vi-VN");
  };

  const getEndTime = (gioBatDau, thoiLuongPhim) => {
    const [h, m] = gioBatDau.split(":").map(Number);
    const start = new Date(0, 0, 0, h, m);
    start.setMinutes(start.getMinutes() + Number(thoiLuongPhim));
    return `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`;
  };

  const indexOfLastShow = currentPage * showsPerPage;
  const indexOfFirstShow = indexOfLastShow - showsPerPage;
  const currentShows = shows.slice(indexOfFirstShow, indexOfLastShow);
  const totalPages = Math.ceil(shows.length / showsPerPage);

  const handleAdd = () => {
    setForm(initialForm);
    setIsEdit(false);
    setShowForm(true);
  };

  const handleEdit = (show) => {
    setForm({
      MAPHIM: show.MAPHIM?.MAPHIM || "",
      MARAP: show.MAPHONG?.MARAP?.MARAP || "",
      MAPHONG: show.MAPHONG?.MAPHONG || "",
      NGAYCHIEU: show.NGAYCHIEU?.slice(0, 10) || "",
      GIOBATDAU: show.GIOBATDAU || "",
    });
    setIsEdit(true);
    setShowForm(true);
    setSelectedShow(show);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === "MARAP") setForm((f) => ({ ...f, MAPHONG: "" }));
  };

  const toMinutes = (time) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  const isTimeOverlap = (start1, end1, start2, end2) => {
    const s1 = toMinutes(start1);
    let e1 = toMinutes(end1);
    const s2 = toMinutes(start2);
    let e2 = toMinutes(end2);
    
    // Simple overlap check
    const aStart = s1, aEnd = e1 <= s1 ? e1 + 1440 : e1;
    const bStart = s2, bEnd = e2 <= s2 ? e2 + 1440 : e2;
    return aStart < bEnd && bStart < aEnd;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const movie = movies.find((m) => m.MAPHIM === form.MAPHIM);
    if (!movie) return alert("Vui lòng chọn phim!");

    const newStart = form.GIOBATDAU;
    const newEnd = getEndTime(newStart, movie.THOILUONG);

    const overlap = shows.some(s => {
      if (isEdit && s.MASUAT === selectedShow.MASUAT) return false;
      if (s.MAPHONG?.MAPHONG !== form.MAPHONG || s.NGAYCHIEU?.slice(0, 10) !== form.NGAYCHIEU) return false;
      return isTimeOverlap(newStart, newEnd, s.GIOBATDAU, s.GIOKETTHUC);
    });

    if (overlap) return alert("Suất chiếu bị trùng giờ!");

    try {
      const showData = { ...form, GIOKETTHUC: newEnd };
      if (isEdit) await updateShow(selectedShow.MASUAT, showData);
      else await addShow(showData);
      setShowForm(false);
      fetchShows();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Lịch chiếu phim</h3>
          <p className="text-sm text-slate-500">Quản lý các khung giờ chiếu tại các rạp</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-200 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Thêm suất chiếu
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-3">
          <thead>
            <tr className="text-slate-400 text-sm uppercase tracking-wider">
              <th className="px-4 py-2 font-semibold">Phim & Rạp</th>
              <th className="px-4 py-2 font-semibold text-center">Phòng</th>
              <th className="px-4 py-2 font-semibold text-center">Thời gian</th>
              <th className="px-4 py-2 font-semibold text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {currentShows.map((s, idx) => (
              <tr key={idx} className="bg-white hover:bg-slate-50 transition-colors group">
                <td className="px-4 py-4 rounded-l-2xl border-y border-l border-slate-100">
                   <div className="font-bold text-slate-800">{s.MAPHIM?.TENPHIM}</div>
                   <div className="text-xs text-indigo-500 font-medium">{s.MAPHONG?.MARAP?.TENRAP}</div>
                </td>
                <td className="px-4 py-4 border-y border-slate-100 text-center">
                   <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium">
                     {s.MAPHONG?.TENPHONG}
                   </span>
                </td>
                <td className="px-4 py-4 border-y border-slate-100 text-center">
                   <div className="text-sm font-bold text-slate-700">{formatDate(s.NGAYCHIEU)}</div>
                   <div className="text-xs text-slate-400">{s.GIOBATDAU} - {s.GIOKETTHUC}</div>
                </td>
                <td className="px-4 py-4 rounded-r-2xl border-y border-r border-slate-100 text-right">
                  <div className="flex justify-end gap-2 text-slate-400">
                    <button
                      onClick={() => handleEdit(s)}
                      className="p-2 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => { setSelectedShow(s); setShowDelete(true); }}
                      className="p-2 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-8">
        <p className="text-sm text-slate-500">Trang {currentPage} / {totalPages}</p>
        <div className="flex gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-10 h-10 rounded-xl font-medium transition-all ${
                currentPage === i + 1 ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "bg-white text-slate-600 border border-slate-200"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md scale-100 animate-in fade-in zoom-in duration-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
               <h3 className="text-xl font-bold text-slate-900">{isEdit ? "Sửa suất chiếu" : "Thêm suất chiếu"}</h3>
               <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Phim</label>
                <select name="MAPHIM" value={form.MAPHIM} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all" required disabled={isEdit}>
                  <option value="">-- Chọn phim --</option>
                  {movies.map(m => <option key={m.MAPHIM} value={m.MAPHIM}>{m.TENPHIM}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Rạp</label>
                  <select name="MARAP" value={form.MARAP} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all" required>
                    <option value="">-- Chọn rạp --</option>
                    {theaters.map(t => <option key={t.MARAP} value={t.MARAP}>{t.TENRAP}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Phòng</label>
                  <select name="MAPHONG" value={form.MAPHONG} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all" required disabled={!form.MARAP}>
                    <option value="">-- Chọn phòng --</option>
                    {rooms.map(p => <option key={p.MAPHONG} value={p.MAPHONG}>{p.TENPHONG}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Ngày chiếu</label>
                  <input type="date" name="NGAYCHIEU" value={form.NGAYCHIEU} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Giờ bắt đầu</label>
                  <input type="time" name="GIOBATDAU" value={form.GIOBATDAU} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all" required />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50">Hủy</button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl scale-100 animate-in fade-in zoom-in duration-200">
             <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
             </div>
             <h3 className="text-xl font-bold text-slate-900 mb-2">Xác nhận xóa</h3>
             <p className="text-slate-500 mb-8 text-sm">Bạn có chắc chắn muốn xóa suất chiếu này? Hành động này không thể hoàn tác.</p>
             <div className="flex gap-3">
               <button onClick={() => setShowDelete(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200">Hủy</button>
               <button onClick={handleDelete} className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600">Xóa ngay</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowManager;
