import { IoTDevice } from "../types/api.types";
import { API_ENDPOINTS } from "../utils/constants";
import axiosClient from "./axiosClient";

export const iotApi = {
    async getDevices(): Promise<IoTDevice[]> {
        try {
            const response = await axiosClient.get<any, IoTDevice[]>(
                API_ENDPOINTS.IOT_DEVICES
            );
            return response;
        } catch (error) {
            throw error;
        }
    },

    async registerDevice(data: {
        deviceName: string;
        deviceType: string;
        lineId?: number;
        locationDesc?: string;
        ipAddress?: string;
        macAddress?: string;
    }): Promise<{ deviceId: number; message: string }> {
        try {
            const response = await axiosClient.post<any, { deviceId: number; message: string }>(
                API_ENDPOINTS.IOT_REGISTER,
                data
            );
            return response;
        } catch (error) {
            throw error;
        }
    },
};
