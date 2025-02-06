import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Remove any response interceptors that strip headers
// Add this interceptor to preserve full response
axiosInstance.interceptors.response.use(
  (response) => response,  // 👈 Keep full response object
  (error) => Promise.reject(error)
); 