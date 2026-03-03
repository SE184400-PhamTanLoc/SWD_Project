import { Shift, ShiftAssignment } from "../types/api.types";
import { API_ENDPOINTS } from "../utils/constants";
import axiosClient from "./axiosClient";

export const shiftApi = {
    async getShifts(): Promise<Shift[]> {
        try {
            const response = await axiosClient.get<any, Shift[]>(API_ENDPOINTS.SHIFTS);
            return response;
        } catch (error) {
            throw error;
        }
    },

    async createShift(data: Omit<Shift, "id">): Promise<{ id: string; message: string }> {
        try {
            const response = await axiosClient.post<any, { id: string; message: string }>(API_ENDPOINTS.SHIFTS, data);
            return response;
        } catch (error) {
            throw error;
        }
    },

    async assignShift(data: Omit<ShiftAssignment, "id">): Promise<{ assignmentId: string; message: string }> {
        try {
            const response = await axiosClient.post<any, { assignmentId: string; message: string }>(
                API_ENDPOINTS.SHIFT_ASSIGN,
                data
            );
            return response;
        } catch (error) {
            throw error;
        }
    },

    async updateAssignment(id: string, data: ShiftAssignment): Promise<{ message: string }> {
        try {
            const response = await axiosClient.put<any, { message: string }>(
                `${API_ENDPOINTS.SHIFT_ASSIGNMENTS}/${id}`,
                data
            );
            return response;
        } catch (error) {
            throw error;
        }
    },

    async getAssignmentsByEmployee(employeeId: string): Promise<ShiftAssignment[]> {
        try {
            const response = await axiosClient.get<any, ShiftAssignment[]>(
                `${API_ENDPOINTS.SHIFT_ASSIGNMENTS}/employee/${employeeId}`
            );
            return response;
        } catch (error) {
            throw error;
        }
    }
};
