import axios from "axios";

export const domain = "http://127.0.0.1:8000";

const axiosInstance = axios.create({
  baseURL: domain,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token =
      typeof window !== "undefined" ? sessionStorage.getItem("token") : null;
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
