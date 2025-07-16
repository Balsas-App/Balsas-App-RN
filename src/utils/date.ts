export const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // meses são zero-based
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

export const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
};

export const timeToDate = (time: string): Date => {
    const [hoursStr, minutesStr] = time.split(":");
    const date = new Date();
    date.setHours(Number(hoursStr));
    date.setMinutes(Number(minutesStr));
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
};
