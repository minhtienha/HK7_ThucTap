import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import MovieManager from "./MovieManager";
import ShowManager from "./ShowManager";
import HistoryManager from "./HistoryManager";
import TheaterManager from "./TheaterManager";
import TheaterAdminManager from "./TheaterAdminManager";
import RoomManager from "./RoomManager";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState("movies");

  const menuItems = [
    { id: "movies", label: "Quản lý phim", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
    { id: "shows", label: "Quản lý suất chiếu", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
    { id: "cinemas", label: "Quản lý rạp", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
    { id: "rooms", label: "Quản lý phòng chiếu", icon: "M4 6h16M4 10h16M4 14h16M4 18h16" },
    { id: "admins", label: "Quản trị viên rạp", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" },
    { id: "history", label: "Thống kê", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 01-2 2h-2a2 2 0 01-2-2zm10 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col fixed h-full transition-all duration-300 ease-in-out z-20">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
            A
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Cinema Admin
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                tab === item.id
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                  : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              <svg
                className={`w-5 h-5 ${tab === item.id ? "text-white" : "text-slate-500 group-hover:text-indigo-400"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
              </svg>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800/50 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
              {user?.HOTEN?.[0] || "A"}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold truncate text-white">{user?.HOTEN || "Administrator"}</p>
              <p className="text-xs text-slate-500 truncate">{user?.VAITRO || "Admin"}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
              title="Đăng xuất"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen flex flex-col p-8 lg:p-12">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 capitalize">
              {menuItems.find(i => i.id === tab)?.label}
            </h2>
            <p className="text-slate-500 mt-1">Quản lý hệ thống của bạn một cách dễ dàng và hiệu quả.</p>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex items-center space-x-2 bg-white rounded-full px-4 py-2 ring-1 ring-slate-200 shadow-sm">
                   <div className="w-2 h-2 rounded-full bg-green-500"></div>
                   <span className="text-sm font-medium text-slate-600">Hệ thống đang chạy</span>
                </div>
             </div>
          </div>
        </header>

        <section className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden transition-all duration-300">
          <div className="p-1">
            {tab === "movies" && <MovieManager />}
            {tab === "shows" && <ShowManager />}
            {tab === "cinemas" && <TheaterManager />}
            {tab === "rooms" && <RoomManager />}
            {tab === "admins" && <TheaterAdminManager />}
            {tab === "history" && <HistoryManager />}
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
