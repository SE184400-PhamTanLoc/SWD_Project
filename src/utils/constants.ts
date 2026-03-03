// Base URL theo API Documentation: http://localhost:5028
// Lưu ý: Dùng http://10.0.2.2:5028 (HTTP) thay vì HTTPS để tránh lỗi chứng chỉ trên Emulator
export const API_BASE_URL = "http://10.0.2.2:5028/api";
export const API_ENDPOINTS = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  LOGOUT: "/auth/logout",
  ME: "/auth/me",
  EMPLOYEES: "/employees", // GET: danh sách, POST: tạo mới
  IOT_DEVICES: "/IoTDevices",
  IOT_REGISTER: "/IoTDevices/register",
  FACE_CHECKIN: "/Attendance/face-checkin", // POST: check-in with face recognition
  SHIFTS: "/Shifts",
  SHIFT_ASSIGN: "/Shifts/assign",
  SHIFT_ASSIGNMENTS: "/Shifts/assignments",
  DEPARTMENTS: "/Departments",
};
export const STORAGE_KEYS = {
  TOKEN: "@auth_token",
  USER: "@user_info",
};
export const API_TIMEOUT = 10000;

// UDP Discovery Configuration
export const UDP_DISCOVERY_PORT = 45678;
export const UDP_DISCOVERY_TIMEOUT = 6000; // 6 seconds
export const CAMERA_STREAM_PORT = 81;
