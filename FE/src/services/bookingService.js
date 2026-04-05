import { apiRequest } from "./axiosInstance";

export const bookingService = {
  getShowtimesByMovie: (movieId) => apiRequest("GET", `/suatchieu/theo-phim/${movieId}`),
  getShowtimeDetail: (maSuat) => apiRequest("GET", `/suatchieu/chi-tiet/${maSuat}`),
  getAllShows: () => apiRequest("GET", "/suatchieu/danh-sach"),
  getAllShowDetails: () => apiRequest("GET", "/suatchieu/day-du"),
  addShow: (showData) => apiRequest("POST", "/suatchieu/them-suat-chieu", showData),
  updateShow: (masuat, showData) => apiRequest("PUT", `/suatchieu/cap-nhat/${masuat}`, showData),
  deleteShow: (masuat) => apiRequest("DELETE", `/suatchieu/xoa-suat-chieu/${masuat}`),

  getTheaters: () => apiRequest("GET", "/rapchieu/danh-sach"),
  getTheaterByMarap: (marap) => apiRequest("GET", `/rapchieu/chi-tiet/${marap}`),
  addTheater: (theaterData) => apiRequest("POST", "/rapchieu/them-rap", theaterData),
  updateTheater: (marap, theaterData) => apiRequest("PUT", `/rapchieu/cap-nhat/${marap}`, theaterData),
  deleteTheater: (marap) => apiRequest("DELETE", `/rapchieu/xoa-rap/${marap}`),

  getRoomsByTheater: (marap) => apiRequest("GET", `/phongchieu/danh-sach-theo-rap/${marap}`),
  getRoomDetail: (maphong) => apiRequest("GET", `/phongchieu/chi-tiet/${maphong}`),
  addRoom: (roomData) => apiRequest("POST", "/phongchieu/them-phong-chieu", roomData),
  updateRoom: (maphong, roomData) => apiRequest("PUT", `/phongchieu/cap-nhat/${maphong}`, roomData),
  deleteRoom: (maphong) => apiRequest("DELETE", `/phongchieu/xoa-phong-chieu/${maphong}`),

  // Missing seat endpoint
  getSeatsByRoomAndSuat: (maphong, masuat) => apiRequest("GET", `/ghe/theo-phong-va-suat/${maphong}/${masuat}`),
};
