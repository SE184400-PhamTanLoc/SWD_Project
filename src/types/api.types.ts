export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  userId?: string;
  username?: string;
  roleName?: string;
}

export interface User {
  id: string;
  username: string;
  fullName?: string; // Optional if not always returned
  roles: string[]; // List<string> in BE
  employeeId?: string | null;
}

export interface IoTDevice {
  id: number;
  deviceName: string;
  deviceType: string;
  lineId?: number;
  locationDesc?: string;
  ipAddress?: string;
  macAddress?: string;
  status: string;
  lastHeartbeat?: string;
  productionLineName?: string;
}

export type Login = {
  username: string; // API yêu cầu username, không phải email
  password: string;
};

export type Register = {
  username: string;
  password: string;
  confirmPassword: string;
  roleId: number; // 1=Admin, 2=HR, 3=Manager, 4=Employee
};

// ===== EMPLOYEE TYPES =====
// Interface cho Employee DTO từ API
export interface Employee {
  id: string; // GUID
  employeeCode: string; // Mã nhân viên (unique)
  fullName: string; // Họ tên
  dateOfBirth: string; // ISO 8601 date
  phoneNumber: string | null; // SĐT (optional)
  email: string | null; // Email (optional)
  identityNumber: string | null; // CMND/CCCD
  departmentId: number | null; // ID phòng ban
  hireDate: string; // Ngày vào làm (ISO 8601)
  isActive: boolean; // Trạng thái hoạt động
}

// Query params cho GET /api/employees
export interface EmployeeQueryParams {
  isActive?: boolean; // Filter theo trạng thái
  departmentId?: number; // Filter theo phòng ban
}
export interface EnrollEmployeeFaceResponse {
  success: boolean;
  message: string;
  employeeCode?: string;
  employeeName?: string;
  label?: number;
}
