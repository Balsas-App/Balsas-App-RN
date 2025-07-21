import api from "@services/api";
import { FerryItem, FerryRoute } from "@type/ferries";

export const getFerries = async (): Promise<FerryItem[]> => {
    const response = await api.get("/ferries");

    return response.status == 200 ? response.data : [];
};

export const getFerryRoutes = async (): Promise<FerryRoute[]> => {
    const response = await api.get("/boardings/routes");

    return response.status == 200 ? response.data : [];
};

type InitBoardingResponse = {
    success: boolean;
    continue: boolean;
    boarding_id: number | null;
    message: string | null;
};
export const initBoarding = async (
    ferry_id: number,
    route_id: number,
    date: Date
): Promise<InitBoardingResponse> => {
    try {
        const response = await api.post("/boardings", {
            ferry: ferry_id,
            route: route_id,
            date_in: date,
        });

        return {
            success: true,
            continue: false,
            boarding_id: response.data.boarding_id,
            message: null,
        };
    } catch (error: any) {
        const status = error.response?.status;
        const data = error.response?.data;

        if (status === 409) {
            return data?.boarding_id
                ? {
                      success: true,
                      continue: true,
                      boarding_id: data.boarding_id,
                      message: data.error,
                  }
                : {
                      success: false,
                      continue: false,
                      boarding_id: null,
                      message: data?.error || "Conflito detectado.",
                  };
        }

        return {
            success: false,
            continue: false,
            boarding_id: null,
            message: data?.error || "Erro inesperado.",
        };
    }
};
