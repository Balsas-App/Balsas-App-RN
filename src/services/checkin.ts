import api from "@services/api";

type CreateCheckinResponse = {
    success: boolean;
    checkin_id: number | null;
    message?: string;
};
export const createCheckin = async (
    boarding_id: number,
    plate: string,
    pax: number,
    vehicle_id: number,
    value: number,
    add_value: number,
    observation: string,
    add_value_reason: string
): Promise<CreateCheckinResponse> => {
    try {
        const response = await api.post("/checkins", {
            boarding: boarding_id,
            plate: plate,
            pax: pax,
            vehicle: vehicle_id,
            value: value,
            add_value: add_value,
            observation: observation,
            add_value_reason: add_value_reason,
        });

        return {
            success: true,
            checkin_id: response.data.checkin_id,
        };
    } catch (error: any) {
        return {
            success: false,
            checkin_id: null,
            message: error.response?.data?.error || "Erro desconhecido",
        };
    }
};
