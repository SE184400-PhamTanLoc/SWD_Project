/**
 * FILE: src/service/iot.service.ts
 * MỤC ĐÍCH: Service layer - Xử lý business logic cho IoT Devices
 */

import { iotApi } from "../api/iot.api";
import { IoTDevice } from "../types/api.types";

export const iotService = {
    async getDevices(): Promise<IoTDevice[]> {
        try {
            return await iotApi.getDevices();
        } catch (error) {
            throw error;
        }
    },

    async registerDevice(data: any): Promise<{ deviceId: number; message: string }> {
        try {
            return await iotApi.registerDevice(data);
        } catch (error) {
            throw error;
        }
    },
};
