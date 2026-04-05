import React, { useEffect, useState } from "react";
import {
  getTheaters,
  getRoomsByTheater,
  addRoom,
  updateRoom,
  deleteRoom,
} from "../../services/api";

const roomsPerPage = 8;
const initialForm = {
  TENPHONG: "",
  MARAP: "",
};

const RoomManager = () => {
  const [theaters, setTheaters] = useState([]);
  const [selectedTheater, setSelectedTheater] = useState("");
  const [rooms, setRooms] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTheaters();
  }, []);

  useEffect(() => {
    if (selectedTheater) fetchRooms(selectedTheater);
    else setRooms([]);
  }, [selectedTheater]);

  const fetchTheaters = async () => {
    const data = await getTheaters();
    setTheaters(data || []);
    if (data?.length > 0 && !selectedTheater) setSelectedTheater(data[0].MARAP);
  };

  const fetchRooms = async (marap) => {
    setLoading(true);
    const data = await getRoomsByTheater(marap);
    setRooms(data || []);
    setLoading(false);
  };

  const handleAdd = () => {
    if (!selectedTheater) return alert("Vui lòng chọn rạp!");
    setForm({ ...initialForm, MARAP: selectedTheater });
    setIsEdit(false);
    setShowForm(true);
  };

  const handleEdit = (room) => {
    setForm({ TENPHONG: room.TENPHONG, MARAP: room.MARAP });
    setIsEdit(true);
    setSelectedRoom(room);
    setShowForm(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isDuplicate = rooms.some(
      (r) => r.TENPHONG.toLowerCase() === form.TENPHONG.toLowerCase() && (!isEdit || r.MAPHONG !== selectedRoom.MAPHONG)
    );
    if (isDuplicate) return alert("Tên phòng đã tồn tại!");

    try {
      if (isEdit && selectedRoom) await updateRoom(selectedRoom.MAPHONG, form);
      else await addRoom(form);
      setShowForm(false);
      fetchRooms(selectedTheater);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (selectedRoom) {
      try {
        await deleteRoom(selectedRoom.MAPHONG);
        setShowDelete(false);
        fetchRooms(selectedTheater);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const indexOfLastRoom = currentPage * roomsPerPage;
  const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;
  const currentRooms = rooms.slice(indexOfFirstRoom, indexOfLastRoom);
  const totalPages = Math.ceil(rooms.length / roomsPerPage);

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Quản lý phòng chiếu</h3>
          <p className="text-sm text-slate-500">Thiết lập và quản lý các phòng chiếu trong mỗi rạp</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <select
              value={selectedTheater}
              onChange={(e) => setSelectedTheater(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer shadow-sm"
            >
              <option value="">-- Chọn rạp chiếu --</option>
              {theaters.map((t) => <option key={t.MARAP} value={t.MARAP}>{t.TENRAP}</option>)}
            </select>
            <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
          
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-200 font-medium whitespace-nowrap"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            Thêm phòng
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr className="text-slate-400 text-xs uppercase tracking-widest">
              <th className="px-6 py-4 font-semibold">Tên phòng chiếu</th>
              <th className="px-6 py-4 font-semibold text-center">Mã phòng</th>
              <th className="px-6 py-4 font-semibold text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {currentRooms.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-slate-400 italic">
                  {selectedTheater ? "Chưa có phòng chiếu nào trong rạp này." : "Vui lòng chọn rạp để xem danh sách phòng."}
                </td>
              </tr>
            ) : (
              currentRooms.map((r) => (
                <tr key={r.MAPHONG} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
                        {r.TENPHONG.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-700">{r.TENPHONG}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <code className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs">#{r.MAPHONG}</code>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(r)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => { setSelectedRoom(r); setShowDelete(true); }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-8 gap-2">
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md scale-100 animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-3xl">
              <h3 className="text-xl font-bold text-slate-900">{isEdit ? "Điều chỉnh phòng chiếu" : "Thêm phòng chiếu mới"}</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Tên phòng chiếu</label>
                <input type="text" name="TENPHONG" value={form.TENPHONG} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all" placeholder="Phòng 01..." required />
              </div>
              <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block mb-1">Rạp hiện tại</span>
                <span className="text-slate-700 font-medium">
                  {theaters.find(t => t.MARAP === selectedTheater)?.TENRAP || "Chưa xác định"}
                </span>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-colors">Hủy</button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">Xác nhận</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 text-center">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl scale-100 animate-in fade-in zoom-in duration-200">
             <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">⚠</div>
             <h3 className="text-xl font-bold text-slate-900 mb-2">Xóa phòng chiếu?</h3>
             <p className="text-slate-500 mb-8 text-sm">Phòng <b>{selectedRoom?.TENPHONG}</b> sẽ bị xóa vĩnh viễn cùng với toàn bộ dữ liệu ghế và suất chiếu liên quan.</p>
             <div className="flex gap-3">
               <button onClick={() => setShowDelete(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200">Hủy</button>
               <button onClick={handleDelete} className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors">Xóa bỏ</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomManager;
