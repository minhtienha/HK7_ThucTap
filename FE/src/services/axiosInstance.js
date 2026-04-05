import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Auto-inject Token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Centralized Error Handling
export const handleError = (error, customMessage = "API Error") => {
  const message = error.response?.data?.message || error.response?.data?.error || error.message;
  console.error(`${customMessage}:`, message);
  throw new Error(message);
};

// Simplified Request Wrapper
export const apiRequest = async (method, url, data = null, params = null) => {
  try {
    const response = await axiosInstance({
      method,
      url,
      data,
      params,
    });
    
    // Nếu Backend trả về chuẩn { success, message, data }
    // thì tự động trả về phần 'data' để Frontend dễ xử lý
    const responseData = response.data;
    if (responseData && responseData.success === true && 'data' in responseData) {
      return responseData.data;
    }
    
    return responseData;
  } catch (error) {
    handleError(error, `Error calling ${method.toUpperCase()} ${url}`);
  }
};

export default axiosInstance;
