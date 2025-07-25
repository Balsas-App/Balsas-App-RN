export type VehiclesList = {
    type: string;
    models: {
        id: number;
        name: string;
        value: number;
    }[];
}[];
