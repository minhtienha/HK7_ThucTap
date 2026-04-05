import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext.jsx";

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate("/");
  };

  const handleNavigate = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="sticky top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-gray-100 shadow-sm">
      <div className="container mx-auto flex items-center justify-between h-16 px-4 md:px-8">
        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => handleNavigate("/")}
        >
          <div className="w-10 h-10 bg-primary text-white font-bold rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            MT
          </div>
          <span className="text-xl font-black tracking-tight text-gray-900">
            MOVIE<span className="text-primary">BOOKING</span>
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {[
            { name: "Trang chủ", path: "/" },
            { name: "Phim", path: "/movies" },
            { name: "Rạp chiếu", path: "/theaters" },
            { name: "Vé của tôi", path: "/bookings" },
          ].map((item) => (
            <span
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className="text-sm font-bold text-gray-600 hover:text-primary cursor-pointer transition-colors uppercase tracking-wider"
            >
              {item.name}
            </span>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div 
                className="flex items-center gap-2 cursor-pointer group"
                onClick={() => handleNavigate("/account")}
              >
                <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 group-hover:border-primary transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="text-sm font-bold text-gray-700 group-hover:text-primary transition-colors">
                  {user.HOTEN || "Tài khoản"}
                </span>
              </div>
              <button
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-full text-xs transition-colors"
                onClick={handleLogout}
              >
                ĐĂNG XUẤT
              </button>
            </div>
          ) : (
            <button
              className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-6 rounded-full text-xs shadow-md shadow-primary/20 transition-all active:scale-95"
              onClick={() => handleNavigate("/login")}
            >
              ĐĂNG NHẬP
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div
          className="md:hidden fixed inset-0 top-16 bg-white z-40 animate-in fade-in slide-in-from-top duration-300"
          onClick={() => setIsMenuOpen(false)}
        >
          <nav
            className="flex flex-col p-6 gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            {[
              { name: "Trang chủ", path: "/" },
              { name: "Phim", path: "/movies" },
              { name: "Rạp chiếu", path: "/theaters" },
              { name: "Vé của tôi", path: "/bookings" },
            ].map((item) => (
              <span
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className="text-lg font-bold text-gray-800 border-b border-gray-50 pb-2"
              >
                {item.name}
              </span>
            ))}
            <div className="pt-4">
              {user ? (
                <div className="flex flex-col gap-4">
                  <span
                    onClick={() => handleNavigate("/account")}
                    className="text-lg font-bold text-primary"
                  >
                    {user.HOTEN || "Tài khoản cá nhân"}
                  </span>
                  <button
                    className="w-full py-3 bg-gray-100 text-gray-800 font-bold rounded-xl"
                    onClick={handleLogout}
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <button
                  className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg"
                  onClick={() => handleNavigate("/login")}
                >
                  Đăng nhập
                </button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
