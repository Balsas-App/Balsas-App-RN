import { useEffect, useState } from "react";
import { Platform } from "react-native";
import {
    checkMultiple,
    requestMultiple,
    PERMISSIONS,
    RESULTS,
    PermissionStatus,
} from "react-native-permissions";

const androidPermissions = [
    PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
    PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
    PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
];

export function useBluetoothPermissions() {
    const [statuses, setStatuses] = useState<Record<string, PermissionStatus>>(
        {}
    );
    const [granted, setGranted] = useState(false);
    const [loading, setLoading] = useState(true);

    const requestPermissions = async () => {
        if (Platform.OS !== "android") return;

        setLoading(true);
        try {
            const result = await requestMultiple(androidPermissions);
            setStatuses(result);
            const allGranted = androidPermissions.every(
                (perm) => result[perm] === RESULTS.GRANTED
            );
            setGranted(allGranted);
        } catch (error) {
            console.error("Erro ao pedir permissões:", error);
        } finally {
            setLoading(false);
        }
    };

    const checkPermissions = async () => {
        if (Platform.OS !== "android") return;

        setLoading(true);
        try {
            const result = await checkMultiple(androidPermissions);
            setStatuses(result);
            const allGranted = androidPermissions.every(
                (perm) => result[perm] === RESULTS.GRANTED
            );
            setGranted(allGranted);
        } catch (error) {
            console.error("Erro ao checar permissões:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkPermissions();
    }, []);

    return {
        granted,
        loading,
        statuses,
        requestPermissions,
        checkPermissions,
    };
}
