/**
 * FILE: src/service/employee.service.ts
 * MỤC ĐÍCH: Service layer - Xử lý business logic cho Employee
 * - Thêm các logic xử lý dữ liệu trước/sau khi gọi API
 * - Có thể cache, format data, handle error...
 */

import { employeeApi } from "../api/employee.api";
import { Employee, EmployeeQueryParams } from "../types/api.types";

export const employeeService = {
  async getEmployees(params?: EmployeeQueryParams): Promise<Employee[]> {
    try {
      const employees = await employeeApi.getEmployees(params);
      return employees;
    } catch (error) {
      throw error;
    }
  },

  async getActiveEmployees(): Promise<Employee[]> {
    try {
      return await this.getEmployees({ isActive: true });
    } catch (error) {
      throw error;
    }
  },

  async createEmployee(data: Omit<Employee, "id">): Promise<Employee> {
    try {
      const newEmployee = await employeeApi.createEmployee(data);
      return newEmployee;
    } catch (error) {
      throw error;
    }
  },
};
