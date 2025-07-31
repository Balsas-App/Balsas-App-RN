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

export const getMariaDBTimestamp = (date: Date = new Date()): string => {
    const pad = (n: number) => n.toString().padStart(2, "0");

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export const formatDateLabel = (dateStr: string): string => {
    const inputDate = new Date(dateStr);
    const today = new Date();

    // Zera horas para comparar apenas as datas
    const normalize = (date: Date) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d;
    };

    const normalizedInput = normalize(inputDate);
    const normalizedToday = normalize(today);

    const diffTime = normalizedToday.getTime() - normalizedInput.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays === 0) {
        return "Hoje";
    } else if (diffDays === 1) {
        return "Ontem";
    } else {
        const day = inputDate.getDate().toString().padStart(2, "0");
        const month = (inputDate.getMonth() + 1).toString().padStart(2, "0");
        const year = inputDate.getFullYear();
        return `${day}/${month}/${year}`;
    }
};
