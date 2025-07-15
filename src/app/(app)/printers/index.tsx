import AppHeader from "@components/AppHeader";
import { useEffect, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableWithoutFeedback,
    StyleSheet,
    Keyboard,
    PermissionsAndroid,
    View,
    Text,
    TouchableOpacity,
} from "react-native";
import { useBluetoothPermissions } from "../../../hooks/useBluetoothPermissions";
import {
    BluetoothEscposPrinter,
    BluetoothManager,
} from "react-native-bluetooth-escpos-printer";
// import { useBluetoothPermissions } from "../../../hooks/useBluetoothPermissions";
// import {
//     requestMultiple,
//     PERMISSIONS,
//     checkMultiple,
//     RESULTS,
//     openSettings,
//     request,
// } from "react-native-permissions";

const Page = () => {
    const { granted, requestPermissions, loading } = useBluetoothPermissions();
    const [devices, setDevices] = useState<any>();

    const formatLine = (col1: string, col2: string, col3: string) => {
        const pad = (str: string, len: number, dir: string = "right") => {
            if (str.length > len) return str.slice(0, len);
            return dir === "right" ? str.padEnd(len) : str.padStart(len);
        };

        return (
            pad(col1, 16) + // Nome do produto
            pad(col2, 8, "left") + // Quantidade
            pad(col3, 8, "left") + // Valor
            "\n"
        );
    };

    const printSomething = async (macAddress: string) => {
        try {
            // const isEnabled = await BluetoothManager.checkBluetoothEnabled();
            // if (!isEnabled) await BluetoothManager.enableBluetooth();

            await BluetoothManager.connect(macAddress);

            await BluetoothEscposPrinter.printerAlign(
                BluetoothEscposPrinter.ALIGN.CENTER
            );

            await BluetoothEscposPrinter.printText("BILHETE VENDA\n", {
                emphasized: true,
                align: BluetoothEscposPrinter.ALIGN.CENTER,
            });

            await BluetoothEscposPrinter.printText(
                formatLine("PLACA", "Pax", "Total"),
                { emphasized: true }
            );
            await BluetoothEscposPrinter.printText(
                formatLine("XYZ5D51", "2", "45,00"),
                {}
            );
            await BluetoothEscposPrinter.printText(
                formatLine("OAC7Y13", "2", "60,00"),
                {}
            );

            await BluetoothEscposPrinter.printText(
                "------------------------\n\n",
                {}
            );
        } catch (err) {
            console.error("Erro ao imprimir:", err);
        }
    };

    const isLikelyPrinter = (deviceName: string) => {
        const keywords = ["printer", "pos", "mpt", "bt", "escpos"];
        return keywords.some((kw) => deviceName?.toLowerCase().includes(kw));
    };

    const listPrinters = async () => {
        try {
            await requestPermissions();

            if (granted) {
                const devices = await BluetoothManager.enableBluetooth();

                const devicesList: any = [];
                devices?.map((device: any) => {
                    const data = JSON.parse(device);

                    if (isLikelyPrinter(data.name)) devicesList.push(data);
                });
                setDevices(devicesList);
            }
        } catch (error) {
            console.error("Erro ao listar impressoras:", error);
        }
    };

    useEffect(() => {
        // console.log("Métodos disponíveis:", BluetoothEscposPrinter);
        listPrinters();
    }, []);
    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <AppHeader title={"Impressoras"} />

                <ScrollView style={styles.pageContainer}>
                    {devices &&
                        devices.map((device: any) => (
                            <TouchableOpacity
                                onPress={async () =>
                                    await printSomething(device.address)
                                }
                            >
                                <Text>{device.name}</Text>
                            </TouchableOpacity>
                        ))}
                </ScrollView>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F1F1F1",
        justifyContent: "flex-start",
    },
    pageContainer: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 36,
    },
    pageTitle: {
        fontSize: 16,
        fontWeight: 700,
        marginBottom: 16,
    },
    formBody: {
        gap: 16,
    },
});

export default Page;
