import { apiRequest } from "./axiosInstance";

export const reviewService = {
  getReviewsByMovie: (maphim) => apiRequest("GET", `/danhgia/theo-phim/${maphim}`),
  upsertReview: (reviewData) => apiRequest("POST", "/danhgia/them", reviewData),
  deleteReview: (params) => {
    const searchParams = new URLSearchParams(params);
    return apiRequest("DELETE", `/danhgia/xoa?${searchParams.toString()}`);
  },
  updateReview: (reviewData) => apiRequest("PUT", "/danhgia/cap-nhat", reviewData),
  getReviewsByUser: (makh) => apiRequest("GET", `/danhgia/theo-nguoi-dung/${makh}`),
};
