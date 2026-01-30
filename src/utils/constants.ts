// Base URL theo API Documentation: http://localhost:5028
// Bạn có thể thay đổi thành IP máy thật nếu test trên thiết bị
export const API_BASE_URL = "http://localhost:5028/api";
export const API_ENDPOINTS = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  LOGOUT: "/auth/logout",
  ME: "/auth/me",
  EMPLOYEES: "/employees", // GET: danh sách, POST: tạo mới
};
export const STORAGE_KEYS = {
  TOKEN: "@auth_token",
  USER: "@user_info",
};
export const API_TIMEOUT = 10000;
