import React, { useEffect, useState } from "react";
import {
  getMovies,
  addMovie,
  updateMovie,
  deleteMovie,
} from "../../services/api";

const initialForm = {
  MAPHIM: "",
  TENPHIM: "",
  MOTA: "",
  THOILUONG: "",
  NGAYKHOICHIEU: "",
  THELOAI: [],
  DAODIEN: "",
  DANHSACHDV: [],
  TRAILER: "",
  POSTER: "",
  HINHANH: [],
  DANHGIA: 0,
  DANGCHIEU: false,
  SAPCHIEU: false,
};

const MovieManager = () => {
  const [movies, setMovies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const moviesPerPage = 8;
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    setLoading(true);
    const data = await getMovies();
    setMovies(data);
    setLoading(false);
  };

  const handleAdd = () => {
    setForm({ ...initialForm, DANHGIA: 0 });
    setIsEdit(false);
    setShowForm(true);
  };

  const handleEdit = (movie) => {
    setForm({
      ...movie,
      NGAYKHOICHIEU: movie.NGAYKHOICHIEU ? movie.NGAYKHOICHIEU.slice(0, 10) : "",
      THELOAI: movie.THELOAI || [],
      DANHSACHDV: movie.DANHSACHDV || [],
      HINHANH: movie.HINHANH || [],
      THOILUONG: movie.THOILUONG || "",
      DANHGIA: movie.DANHGIA || 0,
      DANGCHIEU: !!movie.DANGCHIEU,
      SAPCHIEU: !!movie.SAPCHIEU,
    });
    setIsEdit(true);
    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (["THELOAI", "DANHSACHDV", "HINHANH"].includes(name)) {
      setForm({ ...form, [name]: value.split(",").map((v) => v.trim()) });
    } else if (type === "checkbox") {
      setForm({ ...form, [name]: checked });
    } else if (name === "THOILUONG" || name === "DANHGIA") {
      setForm({ ...form, [name]: Number(value) });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await updateMovie(form.MAPHIM, form);
      } else {
        await addMovie(form);
      }
      setShowForm(false);
      fetchMovies();
    } catch (error) {
      console.error("Lỗi khi lưu phim:", error);
    }
  };

  const handleDelete = async (maphim) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa phim này?")) {
      try {
        await deleteMovie(maphim);
        fetchMovies();
      } catch (error) {
        console.error("Lỗi khi xóa phim:", error);
      }
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN");
  };

  const indexOfLastMovie = currentPage * moviesPerPage;
  const indexOfFirstMovie = indexOfLastMovie - moviesPerPage;
  const currentMovies = movies.slice(indexOfFirstMovie, indexOfLastMovie);
  const totalPages = Math.ceil(movies.length / moviesPerPage);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Danh sách phim</h3>
          <p className="text-sm text-slate-500">Tổng cộng {movies.length} bộ phim trong hệ thống</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-200 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Thêm phim mới
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-3">
          <thead>
            <tr className="text-slate-400 text-sm uppercase tracking-wider">
              <th className="px-4 py-2 font-semibold">Phim</th>
              <th className="px-4 py-2 font-semibold text-center">Thời lượng</th>
              <th className="px-4 py-2 font-semibold">Khởi chiếu</th>
              <th className="px-4 py-2 font-semibold">Trạng thái</th>
              <th className="px-4 py-2 font-semibold text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {currentMovies.map((m) => (
              <tr key={m.MAPHIM} className="bg-white hover:bg-slate-50 transition-colors group">
                <td className="px-4 py-4 rounded-l-2xl border-y border-l border-slate-100">
                  <div className="flex items-center gap-4">
                    <img
                      src={m.POSTER || "https://via.placeholder.com/150"}
                      alt={m.TENPHIM}
                      className="w-12 h-16 rounded-lg object-cover shadow-sm group-hover:scale-105 transition-transform"
                    />
                    <div>
                      <div className="font-bold text-slate-800 leading-tight mb-1">{m.TENPHIM}</div>
                      <div className="text-xs text-slate-400 max-w-[200px] truncate">{m.THELOAI?.join(", ")}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 border-y border-slate-100 text-center">
                   <span className="text-sm font-medium text-slate-600">{m.THOILUONG} phút</span>
                </td>
                <td className="px-4 py-4 border-y border-slate-100">
                  <span className="text-sm text-slate-600">{formatDate(m.NGAYKHOICHIEU)}</span>
                </td>
                <td className="px-4 py-4 border-y border-slate-100">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                      m.DANGCHIEU
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-amber-100 text-amber-600"
                    }`}
                  >
                    {m.DANGCHIEU ? "• Đang chiếu" : "• Sắp chiếu"}
                  </span>
                </td>
                <td className="px-4 py-4 rounded-r-2xl border-y border-r border-slate-100 text-right">
                  <div className="flex justify-end gap-2 text-slate-400">
                    <button
                      onClick={() => handleEdit(m)}
                      className="p-2 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      title="Chỉnh sửa"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(m.MAPHIM)}
                      className="p-2 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Xóa phim"
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
        <p className="text-sm text-slate-500">
          Hiển thị {indexOfFirstMovie + 1} đến {Math.min(indexOfLastMovie, movies.length)} của {movies.length} phim
        </p>
        <div className="flex gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-10 h-10 rounded-xl font-medium transition-all duration-200 ${
                currentPage === i + 1
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col scale-100 animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{isEdit ? "Chỉnh sửa phim" : "Thêm phim mới"}</h3>
                <p className="text-sm text-slate-500">Nhập đầy đủ thông tin bộ phim bên dưới.</p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                 </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Tên phim</label>
                  <input
                    type="text"
                    name="TENPHIM"
                    value={form.TENPHIM}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    placeholder="Nhập tên phim..."
                    required
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Mô tả nội dung</label>
                  <textarea
                    name="MOTA"
                    value={form.MOTA}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[100px]"
                    placeholder="Tóm tắt ngắn gọn nội dung phim..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Thời lượng (phút)</label>
                  <input
                    type="number"
                    name="THOILUONG"
                    value={form.THOILUONG}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Ngày khởi chiếu</label>
                  <input
                    type="date"
                    name="NGAYKHOICHIEU"
                    value={form.NGAYKHOICHIEU}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Thể loại</label>
                  <input
                    type="text"
                    name="THELOAI"
                    value={form.THELOAI?.join(", ")}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    placeholder="Hành động, Hài hước..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Đạo diễn</label>
                  <input
                    type="text"
                    name="DAODIEN"
                    value={form.DAODIEN}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Poster URL (URL ảnh)</label>
                  <input
                    type="text"
                    name="POSTER"
                    value={form.POSTER}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    placeholder="https://..."
                  />
                </div>

                <div className="col-span-2 flex gap-6 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                   <div className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="DANGCHIEU"
                        id="dangchieu"
                        checked={form.DANGCHIEU}
                        onChange={handleChange}
                        className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor="dangchieu" className="text-sm font-medium text-slate-700">Đang chiếu</label>
                   </div>
                   <div className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="SAPCHIEU"
                        id="sapchieu"
                        checked={form.SAPCHIEU}
                        onChange={handleChange}
                        className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor="sapchieu" className="text-sm font-medium text-slate-700">Sắp chiếu</label>
                   </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 font-semibold rounded-2xl hover:bg-slate-50 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieManager;
