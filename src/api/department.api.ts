import { API_ENDPOINTS } from "../utils/constants";
import axiosClient from "./axiosClient";

export interface Department {
    id: number;
    departmentCode: string;
    name: string;
    description?: string;
}

export const departmentApi = {
    async getDepartments(): Promise<Department[]> {
        try {
            const response = await axiosClient.get<any, Department[]>(API_ENDPOINTS.DEPARTMENTS);
            return response;
        } catch (error) {
            throw error;
        }
    },

    async createDepartment(data: Omit<Department, "id">): Promise<Department> {
        try {
            const response = await axiosClient.post<any, Department>(API_ENDPOINTS.DEPARTMENTS, data);
            return response;
        } catch (error) {
            throw error;
        }
    }
};
