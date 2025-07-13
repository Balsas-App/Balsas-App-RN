import React, {
    createContext,
    useContext,
    useState,
    ReactNode,
    useEffect,
} from "react";
import api, { clearTokens, getTokens, storeTokens } from "@services/api";
import { JwtPayload, LoginResponse } from "@type/api";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import Toast, { ErrorToast } from "react-native-toast-message";

type User = {
    id: number;
    email: string;
    data: {
        name: string;
    };
};

type AuthContextType = {
    user: User | null;
    isLoading: boolean;
    login: (
        email: string,
        password: string
    ) => Promise<{
        success: boolean;
        message: string;
    }>;
    logout: () => void;
    authenticated: boolean;
    isCheckingAuth: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
    children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [authenticated, setAuthenticated] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    const decodeUserFromToken = (token: string): JwtPayload => {
        return jwtDecode<JwtPayload>(token);
    };

    useEffect(() => {
        const checkAuth = async () => {
            setIsCheckingAuth(true);

            const { jwt, refreshToken } = await getTokens();

            if (jwt) {
                const user = decodeUserFromToken(jwt);

                if (user.exp < Date.now() / 1000) {
                    if (refreshToken) {
                        try {
                            const response = await api.post("/refresh-token", {
                                refresh_token: refreshToken,
                            });
                            const { access_token, refresh_token } =
                                response.data;

                            await storeTokens(access_token, refresh_token);

                            const newUser = decodeUserFromToken(access_token);
                            setUser({
                                id: newUser.id,
                                email: newUser.email,
                                data: newUser.data,
                            });
                            setAuthenticated(true);
                        } catch (err) {
                            await clearTokens();
                            setUser(null);
                            setAuthenticated(false);

                            Toast.show({
                                type: "error",
                                text1: "Sua sessão expirou.",
                                position: "top",
                                topOffset: 100,
                            });

                            console.log(err);
                        }
                    } else {
                        setAuthenticated(false);
                    }
                } else {
                    setUser({
                        id: user.id,
                        email: user.email,
                        data: user.data,
                    });
                    setAuthenticated(true);
                }
            } else {
                setAuthenticated(false);
            }

            setIsCheckingAuth(false);
        };

        checkAuth();
    }, []);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await api.post("/login", { email, password });

            if (response.status == 200) {
                const data = response.data as LoginResponse;
                await storeTokens(data.access_token, data.refresh_token);

                const user = decodeUserFromToken(data.access_token);
                setUser({
                    id: user.id,
                    email: user.email,
                    data: user.data,
                });
                setAuthenticated(true);
                return { success: true, message: "Login bem sucedido!" };
            } else {
                return {
                    success: false,
                    message: "Login indisponível no momento.",
                };
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const status = error.response?.status;

                if (status === 401) {
                    return { success: false, message: "Credenciais inválidas" };
                    // aqui você pode setar erro de login no estado, ex:
                    // setLoginError("Email ou senha incorretos");
                } else if (status && status >= 500) {
                    return {
                        success: false,
                        message: "Erro no servidor, tente novamente mais tarde",
                    };
                } else {
                    return {
                        success: false,
                        message: `Erro inesperado: ${error.message}`,
                    };
                }
            } else {
                return { success: false, message: `Erro desconhecido.` };
            }
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        await clearTokens();
        setUser(null);
        setAuthenticated(false);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                login,
                logout,
                authenticated,
                isCheckingAuth,
            }}
        >
            {children}
            <Toast
                config={{
                    error: (props: any) => (
                        <ErrorToast
                            {...props}
                            style={{
                                borderLeftColor: "red",
                                backgroundColor: "#ffe6e6",
                                width: "auto",
                                marginHorizontal: 20,
                            }}
                            text1Style={{
                                fontSize: 16,
                                fontWeight: "bold",
                                color: "#1a1a1a",
                            }}
                            text2Style={{
                                fontSize: 14,
                                color: "#333",
                            }}
                        />
                    ),
                }}
            />
        </AuthContext.Provider>
    );
};

// Hook pra usar contexto mais fácil
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth deve ser usado dentro do AuthProvider");
    }
    return context;
};
