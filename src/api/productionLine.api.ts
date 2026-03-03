import axiosClient from "./axiosClient";

export interface ProductionLine {
    id: number;
    lineName: string;
    departmentId: number;
    capacity?: number;
    machineCount?: number;
    status: string;
}

export const productionLineApi = {
    async getProductionLines(): Promise<ProductionLine[]> {
        try {
            const response = await axiosClient.get<any, ProductionLine[]>("/ProductionLines");
            return response;
        } catch (error) {
            throw error;
        }
    },

    async getById(id: number): Promise<ProductionLine> {
        try {
            const response = await axiosClient.get<any, ProductionLine>(`/ProductionLines/${id}`);
            return response;
        } catch (error) {
            throw error;
        }
    },

    async createProductionLine(data: Omit<ProductionLine, "id">): Promise<{ id: number; message: string }> {
        try {
            const response = await axiosClient.post<any, { id: number; message: string }>("/ProductionLines", data);
            return response;
        } catch (error) {
            throw error;
        }
    }
};
