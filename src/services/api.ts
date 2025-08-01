import axios from "axios";
import * as SecureStore from "expo-secure-store";

const API_BASE = "http://192.168.15.5:8008";

export const storeTokens = async (jwt: string, refresh: string) => {
    await SecureStore.setItemAsync("jwt", jwt);
    await SecureStore.setItemAsync("refreshToken", refresh);
};

export const getTokens = async () => {
    const jwt = await SecureStore.getItemAsync("jwt");
    const refreshToken = await SecureStore.getItemAsync("refreshToken");
    return { jwt, refreshToken };
};

export const clearTokens = async () => {
    await SecureStore.deleteItemAsync("jwt");
    await SecureStore.deleteItemAsync("refreshToken");
};

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

// Criar instância axios padrão
const api = axios.create({
    baseURL: API_BASE, // URL base da sua API
    timeout: 10000, // 10 segundos de timeout
    headers: {
        "Content-Type": "application/json",
    },
});

const excludedRoutes = ["/login"];

api.interceptors.request.use(async (config) => {
    if (excludedRoutes.some((route) => config.url?.startsWith(route))) {
        return config;
    }

    const { jwt } = await getTokens();

    if (jwt && config.headers) {
        config.headers.Authorization = `Bearer ${jwt}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            excludedRoutes.some((route) =>
                originalRequest.url?.startsWith(route)
            )
        ) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization =
                            "Bearer " + token;
                        return api(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const { refreshToken } = await getTokens();

                if (!refreshToken) throw new Error("No refresh token");

                const response = await api.post("/refresh-token", {
                    refreshToken,
                });

                const { access_token: newJwt, refresh_token: newRefresh } =
                    response.data;

                await storeTokens(newJwt, newRefresh);

                api.defaults.headers.common["Authorization"] =
                    "Bearer " + newJwt;
                originalRequest.headers.Authorization = "Bearer " + newJwt;

                processQueue(null, newJwt);

                return api(originalRequest);
            } catch (err) {
                processQueue(err, null);
                await clearTokens();
                // Aqui você pode disparar logout global no app
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
