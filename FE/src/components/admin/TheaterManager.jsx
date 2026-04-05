import React, { useEffect, useState } from "react";
import {
  getTheaters,
  deleteTheater,
  addTheater,
  updateTheater,
} from "../../services/api";

const theatersPerPage = 8;
const initialForm = {
  TENRAP: "",
  DIACHI: "",
  TINHTHANH: "",
};

const TheaterManager = () => {
  const [theaters, setTheaters] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedTheater, setSelectedTheater] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTheaters();
  }, []);

  const fetchTheaters = async () => {
    setLoading(true);
    const data = await getTheaters();
    setTheaters(data || []);
    setLoading(false);
  };

  const handleAdd = () => {
    setForm(initialForm);
    setIsEdit(false);
    setShowForm(true);
  };

  const handleEdit = (theater) => {
    setForm({
      TENRAP: theater.TENRAP,
      DIACHI: theater.DIACHI,
      TINHTHANH: theater.TINHTHANH,
    });
    setIsEdit(true);
    setSelectedTheater(theater);
    setShowForm(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isDuplicate = theaters.some(
      (t) => t.TENRAP.toLowerCase() === form.TENRAP.toLowerCase() && (!isEdit || t.MARAP !== selectedTheater.MARAP)
    );
    if (isDuplicate) return alert("Tên rạp đã tồn tại!");

    try {
      if (isEdit && selectedTheater) await updateTheater(selectedTheater.MARAP, form);
      else await addTheater(form);
      setShowForm(false);
      fetchTheaters();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (selectedTheater) {
      try {
        await deleteTheater(selectedTheater.MARAP);
        setShowDelete(false);
        fetchTheaters();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const indexOfLastTheater = currentPage * theatersPerPage;
  const indexOfFirstTheater = indexOfLastTheater - theatersPerPage;
  const currentTheaters = theaters.slice(indexOfFirstTheater, indexOfLastTheater);
  const totalPages = Math.ceil(theaters.length / theatersPerPage);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Hệ thống rạp chiếu</h3>
          <p className="text-sm text-slate-500">Quản lý mạng lưới rạp chiếu phim trên toàn quốc</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-200 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Thêm rạp mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentTheaters.map((t) => (
          <div key={t.MARAP} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
               <button onClick={() => handleEdit(t)} className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
               </button>
               <button onClick={() => { setSelectedTheater(t); setShowDelete(true); }} className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
               </button>
            </div>
            
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-4 font-bold group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
            
            <h4 className="text-lg font-bold text-slate-800 mb-1">{t.TENRAP}</h4>
            <div className="flex items-start gap-2 text-slate-500 mb-4">
               <svg className="w-4 h-4 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
               <p className="text-sm leading-relaxed">{t.DIACHI}</p>
            </div>
            
            <div className="flex justify-between items-center border-t border-slate-50 pt-4 mt-auto">
               <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{t.TINHTHANH}</span>
               <span className="text-xs font-medium text-slate-400"># {t.MARAP}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center mt-12 gap-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`w-10 h-10 rounded-xl font-medium transition-all ${
              currentPage === i + 1 ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md scale-100 animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">{isEdit ? "Sửa thông tin rạp" : "Thêm rạp chiếu mới"}</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 focus:outline-none">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Tên rạp</label>
                <input type="text" name="TENRAP" value={form.TENRAP} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all" placeholder="CGV Vincom..." required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Địa chỉ chi tiết</label>
                <input type="text" name="DIACHI" value={form.DIACHI} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all" placeholder="Số 1 Đại Cồ Việt..." required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Tỉnh / Thành phố</label>
                <input type="text" name="TINHTHANH" value={form.TINHTHANH} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all" placeholder="Hà Nội" required />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50">Hủy</button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 text-center">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl scale-100 animate-in fade-in zoom-in duration-200">
             <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-2xl">!</div>
             <h3 className="text-xl font-bold text-slate-900 mb-2">Xác nhận xóa</h3>
             <p className="text-slate-500 mb-8 text-sm">Bạn sắp xóa rạp <b>{selectedTheater?.TENRAP}</b>. Hành động này sẽ ảnh hưởng đến tất cả phòng và suất chiếu liên quan.</p>
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

export default TheaterManager;
