export type Boarding = {
    boarding_id: number;
    time_in: string;
    ferry_name: string;
    route_name: string;
    checkins_count: number;
    closed: number;
    agent_id: number;
    agent_username: string;
    agent_data: string | JSON;
};
