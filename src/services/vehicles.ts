import { VehiclesList } from "@type/vehicles";
import api from "./api";

export const getVehiclesList = async (): Promise<VehiclesList> => {
    try {
        const response = await api.get(`/vehicles`);

        return response.data;
    } catch (error: any) {
        console.error("error vehicles", JSON.stringify(error));
        return [];
    }
};
