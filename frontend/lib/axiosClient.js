import axios from "axios";
import API_CONFIG from "../config/api";
import config from "../../postcss.config.mjs";

const axiosClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: API_CONFIG.HEADER,
  timeout: API_CONFIG.TIMEOUT,
});

export default axiosClient;

axiosClient.interceptors.request.use (
  (config) => {
    if (typeof window !=="undefined"){
      const token = localStorage.getItem("accessToken");
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// export function setAuthToken(token) {
//     if (token) {
//         axiosClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
//     }
// }

// export function clearAuthToken() {
//     delete axiosClient.defaults.headers.common["Authorization"];
// }

// export function authHeaders(token) {
//     return {
//         ...API_CONFIG.HEADER,
//         Authorization: token ? `Bearer ${token}` : undefined,
//     };
// }

// export default axiosClient;