import { apiRequest } from "./axiosInstance";

export const movieService = {
  getMovies: () => apiRequest("GET", "/phim/danh-sach"),
  getNowShowingMovies: () => apiRequest("GET", "/phim/danh-sach-dang-chieu"),
  getUpcomingMovies: () => apiRequest("GET", "/phim/danh-sach-sap-chieu"),
  getMovieById: (id) => apiRequest("GET", `/phim/chi-tiet/${id}`),
  searchMovies: (tenPhim) => apiRequest("GET", "/phim/tim-kiem", null, { tenPhim }),
  addMovie: (movieData) => apiRequest("POST", "/phim/them-phim", movieData),
  updateMovie: (maphim, movieData) => apiRequest("PUT", `/phim/cap-nhat/${maphim}`, movieData),
  deleteMovie: (maphim) => apiRequest("DELETE", `/phim/xoa-phim/${maphim}`),
};
