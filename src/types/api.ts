export interface LoginResponse {
    access_token: string;
    refresh_token: string;
    expires_in: number;
}

export type JwtPayload = {
    id: number;
    email: string;
    level: number;
    data: any;
    exp: number;
};
