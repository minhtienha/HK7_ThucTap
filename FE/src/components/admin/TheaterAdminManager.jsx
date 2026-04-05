import React, { useEffect, useState } from "react";
import {
  getUsers,
  deleteUser,
  addUser,
  updateUser,
  getTheaters,
} from "../../services/api";

const theaterAdminsPerPage = 8;
const initialForm = {
  HOTEN: "",
  EMAIL: "",
  SDT: "",
  MATKHAU: "",
  VAITRO: "manager",
  MARAP: "",
};

const TheaterAdminManager = () => {
  const [admins, setAdmins] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAdmins();
    fetchTheaters();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    const data = await getUsers();
    const filtered = data.filter(u => u.VAITRO === "manager" || u.VAITRO === "admin");
    setAdmins(filtered || []);
    setLoading(false);
  };

  const fetchTheaters = async () => {
    const data = await getTheaters();
    setTheaters(data || []);
  };

  const handleAdd = () => {
    setForm(initialForm);
    setIsEdit(false);
    setShowForm(true);
  };

  const handleEdit = (admin) => {
    setForm({
      HOTEN: admin.HOTEN,
      EMAIL: admin.EMAIL,
      SDT: admin.SDT,
      MATKHAU: "", // Don't show password
      VAITRO: admin.VAITRO,
      MARAP: admin.MARAP || "",
    });
    setIsEdit(true);
    setSelectedAdmin(admin);
    setShowForm(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isDuplicate = admins.some(
      (a) => a.EMAIL.toLowerCase() === form.EMAIL.toLowerCase() && (!isEdit || a._id !== selectedAdmin._id)
    );
    if (isDuplicate) return alert("Email đã tồn tại!");

    try {
      if (isEdit && selectedAdmin) await updateUser(selectedAdmin._id, form);
      else await addUser(form);
      setShowForm(false);
      fetchAdmins();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (selectedAdmin) {
      try {
        await deleteUser(selectedAdmin._id);
        setShowDelete(false);
        fetchAdmins();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const indexOfLastAdmin = currentPage * theaterAdminsPerPage;
  const indexOfFirstAdmin = indexOfLastAdmin - theaterAdminsPerPage;
  const currentAdmins = admins.slice(indexOfFirstAdmin, indexOfLastAdmin);
  const totalPages = Math.ceil(admins.length / theaterAdminsPerPage);

  return (
    <div className="p-6 font-sans">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Đội ngũ quản lý</h3>
          <p className="text-sm text-slate-500">Phân quyền và quản lý nhân sự vận hành hệ thống rạp</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-200 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          Thêm quản trị viên
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr className="text-slate-400 text-xs uppercase tracking-widest">
              <th className="px-6 py-4 font-semibold">Thông tin cơ bản</th>
              <th className="px-6 py-4 font-semibold">Quyền hạn</th>
              <th className="px-6 py-4 font-semibold">Rạp quản lý</th>
              <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {currentAdmins.map((a) => {
              const theater = theaters.find(t => t.MARAP === a.MARAP);
              return (
                <tr key={a._id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-bold border-2 border-white shadow-sm">
                        {a.HOTEN.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{a.HOTEN}</div>
                        <div className="text-xs text-slate-400">{a.EMAIL} • {a.SDT}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      a.VAITRO === 'admin' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                    }`}>
                      {a.VAITRO}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-slate-600">
                       <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                       <span className="text-sm font-medium">{theater ? theater.TENRAP : "Tất cả hệ thống"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(a)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => { setSelectedAdmin(a); setShowDelete(true); }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg scale-100 animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-3xl">
              <h3 className="text-xl font-bold text-slate-900">{isEdit ? "Điều chỉnh quản trị" : "Thêm quản trị mới"}</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Họ và tên</label>
                  <input type="text" name="HOTEN" value={form.HOTEN} onChange={handleChange} className="w-full border border-slate-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all bg-slate-50/50" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Số điện thoại</label>
                  <input type="phone" name="SDT" value={form.SDT} onChange={handleChange} className="w-full border border-slate-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all bg-slate-50/50" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Địa chỉ Email</label>
                <input type="email" name="EMAIL" value={form.EMAIL} onChange={handleChange} className="w-full border border-slate-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all bg-slate-50/50" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Quyền hạn</label>
                  <select name="VAITRO" value={form.VAITRO} onChange={handleChange} className="w-full border border-slate-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all bg-slate-50/50" required>
                    <option value="manager">Quản lý rạp</option>
                    <option value="admin">Quản trị hệ thống</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phụ trách rạp</label>
                  <select name="MARAP" value={form.MARAP} onChange={handleChange} className="w-full border border-slate-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all bg-slate-50/50" required={form.VAITRO === 'manager'}>
                    <option value="">Chọn rạp</option>
                    {theaters.map(t => <option key={t._id} value={t.MARAP}>{t.TENRAP}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mật khẩu {isEdit && "(Bỏ trống nếu không đổi)"}</label>
                <input type="password" name="MATKHAU" value={form.MATKHAU} onChange={handleChange} className="w-full border border-slate-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all bg-slate-50/50" placeholder="••••••••" required={!isEdit} />
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3.5 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-colors">Hủy</button>
                <button type="submit" className="flex-1 py-3.5 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">Xác nhận</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 text-center">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl scale-100 animate-in fade-in zoom-in duration-200">
             <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">!</div>
             <h3 className="text-xl font-bold text-slate-900 mb-2">Gỡ bỏ nhân sự?</h3>
             <p className="text-slate-500 mb-8 text-sm">Quản lý <b>{selectedAdmin?.HOTEN}</b> sẽ không còn quyền truy cập vào hệ thống này nữa.</p>
             <div className="flex gap-3">
               <button onClick={() => setShowDelete(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">Hủy</button>
               <button onClick={handleDelete} className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors">Xóa bỏ</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TheaterAdminManager;
