import api from "@services/api";
import { CheckinInfos } from "@type/checkins";

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
            checkin_id: error.response?.data?.checkin_id || null,
            message: error.response?.data?.error || "Erro desconhecido",
        };
    }
};

type GetCheckinResponse = CheckinInfos | null;

export const getCheckin = async (
    checkin_id: number
): Promise<GetCheckinResponse> => {
    try {
        const response = await api.get(`/checkins/${checkin_id}`);

        return response.data;
    } catch (error: any) {
        return null;
    }
};

type GetBoardingCheckinsResponse = CheckinInfos[];

export const getBoardingCheckins = async (
    boarding_id: number
): Promise<GetBoardingCheckinsResponse> => {
    try {
        const response = await api.get(`/boardings/${boarding_id}/checkins`);
        return response.data;
    } catch (error: any) {
        console.error("error checkin", JSON.stringify(error));
        return [];
    }
};
