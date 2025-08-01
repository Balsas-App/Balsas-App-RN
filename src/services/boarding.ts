import api from "@services/api";
import { Boarding } from "@type/boardings";
import { FerryItem, FerryRoute } from "@type/ferries";
import { getMariaDBTimestamp } from "../utils/date";

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
            date_in: date.toISOString().slice(0, 19).replace("T", " "),
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

type GetBoardingResponse = Boarding | null;

export const getBoarding = async (
    boarding_id: number
): Promise<GetBoardingResponse> => {
    try {
        const response = await api.get(`/boardings/${boarding_id}`);

        return response.data;
    } catch (error: any) {
        console.error("error boarding", JSON.stringify(error));
        return error;
    }
};

export const finishBoarding = async (boarding_id: number): Promise<boolean> => {
    try {
        const response = await api.put(`/boardings/${boarding_id}/finish`);

        return response.data.success ? true : false;
    } catch (error: any) {
        console.error("error finishing boarding", JSON.stringify(error));
        return error;
    }
};

export const getBoardings = async (
    start: Date | null,
    end: Date | null,
    closed: boolean
): Promise<Boarding[]> => {
    try {
        const params: any = {};

        if (start) params.start = getMariaDBTimestamp(start);
        if (end) params.end = getMariaDBTimestamp(end);
        params.closed = closed ? "true" : "false";

        const response = await api.get("/boardings", { params });

        return response.data;
    } catch (error: any) {
        console.error("error getting boardings", JSON.stringify(error));
        return error;
    }
};
