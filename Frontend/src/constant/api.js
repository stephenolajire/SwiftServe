import axios from 'axios';
import {jwtDecode} from 'jwt-decode';

const link = "http://127.0.0.1:8000/api/"
const render = "https://swiftserve-server.onrender.com/api/";
export const MEDIA_BASE_URL = "http://localhost:8000";

const api = axios.create({
  baseURL: render,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");
    if (token) {
      const decoded = jwtDecode(token);
      const expiry_date = decoded.exp;
      const current_time = Date.now() / 1000;

      if (expiry_date > current_time) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.log("Token expired");
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
