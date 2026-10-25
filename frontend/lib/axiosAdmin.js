import axios from "axios";
import API_CONFIG from "@/config/api";
import Cookies from "js-cookie";

const axiosAdmin = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    withCredentials: true,
    headers:{
        'Content-Type':'application/json',
        'Accept' : 'application/json',
    }
})

axiosAdmin.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined')
        {
            const token = Cookies.get('admin_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }

        return config;
    },
    (error) => Promise.reject(error)
)

export default axiosAdmin;