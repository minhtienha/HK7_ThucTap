import { apiRequest } from "./axiosInstance";

export const authService = {
  register: (userData) => apiRequest("POST", "/nguoidung/dang-ky", userData),
  login: (userData) => apiRequest("POST", "/nguoidung/dang-nhap", userData),
  getUsers: () => apiRequest("GET", "/nguoidung/danh-sach"),
  addUser: (userData) => apiRequest("POST", "/nguoidung/them", userData),
  deleteUser: (id) => apiRequest("DELETE", `/nguoidung/xoa/${id}`),
  updatePasswordByEmail: (payload) => apiRequest("PUT", "/nguoidung/cap-nhat-mat-khau", payload),
  getUserById: (makh) => apiRequest("GET", `/nguoidung/chi-tiet/${makh}`),
  updateUser: (makh, payload) => apiRequest("PUT", `/nguoidung/cap-nhat/${makh}`, payload),
  checkPhone: (phone) => apiRequest("GET", "/checkPhone", null, { phone }),
};
