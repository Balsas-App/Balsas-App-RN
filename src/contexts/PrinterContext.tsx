import React, {
    createContext,
    useContext,
    ReactNode,
    useRef,
    useState,
    useEffect,
} from "react";
import {
    DeviceEventEmitter,
    EmitterSubscription,
    Modal,
    StyleSheet,
    Text,
    TouchableNativeFeedback,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { useBluetoothPermissions } from "../hooks/useBluetoothPermissions";
import {
    BluetoothEscposPrinter,
    BluetoothManager,
} from "react-native-bluetooth-escpos-printer";
import SubmitButton from "@components/SubmitButton";
import { ScrollView } from "react-native-gesture-handler";

type PrinterDevice = {
    name: string;
    address: string;
    width?: 80 | 58;
};
type PrinterWidthOptionsProps = {
    device: PrinterDevice;
};
type PrinterContextType = {
    openPrinterList: () => void;
};

const PrinterContext = createContext<PrinterContextType | undefined>(undefined);

type PrinterProviderProps = {
    children: ReactNode;
};

export const PrinterProvider = ({ children }: PrinterProviderProps) => {
    const { granted, requestPermissions, loading } = useBluetoothPermissions();
    const [availablePrinters, setAvailablePrinters] = useState<PrinterDevice[]>(
        []
    );
    const [currentPrinter, setCurrentPrinter] = useState<PrinterDevice | null>(
        null
    );
    const [currentStatus, setCurrentStatus] = useState({
        mac: "",
        success: false,
        loading: true,
        message: "Conectando...",
    });
    const [modalVisible, setModalVisible] = useState(false);
    const subscriptionsRef = useRef<EmitterSubscription[]>([]);

    const isLikelyPrinter = (deviceName: string) => {
        const keywords = ["printer", "pos", "mpt", "bt", "escpos", "epson"];
        return keywords.some((kw) => deviceName?.toLowerCase().includes(kw));
    };

    useEffect(() => {
        // Remove listeners antigos
        subscriptionsRef.current.forEach((sub) => sub.remove());
        subscriptionsRef.current = [];

        if (!currentPrinter) return;

        const sub1 = DeviceEventEmitter.addListener(
            BluetoothManager.EVENT_CONNECTION_LOST,
            () => {
                console.log("lost", currentPrinter?.address);
                setCurrentStatus({
                    mac: currentPrinter?.address || "",
                    loading: false,
                    success: false,
                    message: "Conexão perdida.",
                });
            }
        );

        const sub2 = DeviceEventEmitter.addListener(
            BluetoothManager.EVENT_UNABLE_CONNECT,
            () => {
                console.log("lost 2");
                setCurrentStatus({
                    mac: currentPrinter?.address || "",
                    loading: false,
                    success: false,
                    message: "Não foi possível conectar.",
                });
            }
        );

        const sub3 = DeviceEventEmitter.addListener(
            BluetoothManager.EVENT_CONNECTED,
            (response) => {
                console.log("connected", response);
                const device = availablePrinters.find(
                    (item) => item?.name === response.device_name
                );
                if (device) {
                    setCurrentStatus({
                        mac: device.address,
                        loading: false,
                        success: true,
                        message: "Conectado",
                    });
                }
            }
        );

        // Armazena os listeners ativos
        subscriptionsRef.current = [sub1, sub2, sub3];

        // Remove listeners ao desmontar ou mudar impressora
        return () => {
            subscriptionsRef.current.forEach((sub) => sub.remove());
            subscriptionsRef.current = [];
        };
    }, [currentPrinter]); // Só reinstancia quando mudar

    useEffect(() => {
        const setupPrinter = async (mac: string) => {
            const connect = await BluetoothManager.connect(mac);
        };
        if (currentPrinter) {
            setCurrentStatus({
                mac: currentPrinter.address,
                loading: true,
                success: false,
                message: "Conectando...",
            });
            setupPrinter(currentPrinter.address);
        }
    }, [currentPrinter]);

    const listPrinters = async () => {
        try {
            await requestPermissions();

            if (granted) {
                const devices = await BluetoothManager.enableBluetooth();

                const devicesList: PrinterDevice[] = [];
                devices?.map((device: string) => {
                    const data: PrinterDevice = JSON.parse(device);

                    if (isLikelyPrinter(data.name)) {
                        data.width = 80;
                        devicesList.push(data);
                    }
                });
                setAvailablePrinters(devicesList);
            }
        } catch (error) {
            console.error("Erro ao listar impressoras:", error);
        }
    };

    const openPrinterList = async () => {
        await listPrinters();
        setModalVisible(true);
    };

    const changePrinterWidth = (
        device: PrinterDevice,
        width: PrinterDevice["width"]
    ) => {
        setAvailablePrinters((current) =>
            current.map((printer) => {
                printer.width = width;
                return printer;
            })
        );
    };

    // TODO LATER - Print reports
    //
    // const formatLine = (col1: string, col2: string, col3: string) => {
    //     const pad = (str: string, len: number, dir: string = "right") => {
    //         if (str.length > len) return str.slice(0, len);
    //         return dir === "right" ? str.padEnd(len) : str.padStart(len);
    //     };

    //     return (
    //         pad(col1, 16) + // Nome do produto
    //         pad(col2, 8, "left") + // Quantidade
    //         pad(col3, 8, "left") + // Valor
    //         "\n"
    //     );
    // };

    // const printSomething = async (macAddress: string) => {
    //     try {
    //         await BluetoothManager.connect(macAddress);

    //         await BluetoothEscposPrinter.printerAlign(
    //             BluetoothEscposPrinter.ALIGN.CENTER
    //         );

    //         await BluetoothEscposPrinter.printText("BILHETE VENDA\n", {
    //             emphasized: true,
    //             align: BluetoothEscposPrinter.ALIGN.CENTER,
    //         });

    //         await BluetoothEscposPrinter.printText(
    //             formatLine("PLACA", "Pax", "Total"),
    //             { emphasized: true }
    //         );
    //         await BluetoothEscposPrinter.printText(
    //             formatLine("XYZ5D51", "2", "45,00"),
    //             {}
    //         );
    //         await BluetoothEscposPrinter.printText(
    //             formatLine("OAC7Y13", "2", "60,00"),
    //             {}
    //         );

    //         await BluetoothEscposPrinter.printText(
    //             "------------------------\n\n",
    //             {}
    //         );
    //     } catch (err) {
    //         console.error("Erro ao imprimir:", err);
    //     }
    // };

    const handleSave = () => {
        setModalVisible(false);
    };

    const PrinterWidthOptions = ({ device }: PrinterWidthOptionsProps) => {
        return (
            <View style={styles.printerOptionWidth}>
                <TouchableOpacity
                    style={[
                        styles.printerOptionWidthOption,
                        device?.width == 80 &&
                            styles.printerOptionWidthOptionChecked,
                    ]}
                    onPress={() => changePrinterWidth(device, 80)}
                >
                    <Text
                        style={[
                            styles.printerOptionWidthOptionText,
                            device?.width == 80 &&
                                styles.printerOptionWidthOptionTextChecked,
                        ]}
                    >
                        80mm
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.printerOptionWidthOption,
                        device?.width == 58 &&
                            styles.printerOptionWidthOptionChecked,
                    ]}
                    onPress={() => changePrinterWidth(device, 58)}
                >
                    <Text
                        style={[
                            styles.printerOptionWidthOptionText,
                            device?.width == 58 &&
                                styles.printerOptionWidthOptionTextChecked,
                        ]}
                    >
                        58mm
                    </Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <PrinterContext.Provider
            value={{
                openPrinterList,
            }}
        >
            {children}

            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableWithoutFeedback
                    onPress={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback onPress={() => {}}>
                            <View style={styles.modalContent}>
                                <View style={styles.modalTitle}>
                                    <Text style={styles.modalTitleText}>
                                        Impressoras
                                    </Text>
                                    <Text style={styles.modalTitleDesc}>
                                        Escolha a impressora a ser utilizada nas
                                        impressões.
                                    </Text>
                                </View>
                                {availablePrinters.length == 0 ? (
                                    <View style={styles.notFound}>
                                        <Text style={styles.notFoundText}>
                                            Nenhuma impressora encontrada.
                                        </Text>
                                        <Text style={styles.notFoundText}>
                                            Faça o pareamento com uma impressora
                                            e toque em 'Buscar novamente'.
                                        </Text>

                                        <TouchableOpacity
                                            style={styles.notFoundButton}
                                            onPress={async () =>
                                                await listPrinters()
                                            }
                                        >
                                            <Text
                                                style={
                                                    styles.notFoundSearchText
                                                }
                                            >
                                                Buscar novamente
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <ScrollView style={styles.allPrinters}>
                                        {availablePrinters.map(
                                            (device, index) => (
                                                <TouchableNativeFeedback
                                                    key={index}
                                                    background={TouchableNativeFeedback.Ripple(
                                                        "rgba(0,0,0,0.2)",
                                                        false
                                                    )}
                                                    onPress={() => {
                                                        setCurrentPrinter(
                                                            device
                                                        );
                                                    }}
                                                >
                                                    <View
                                                        style={
                                                            styles.printerOption
                                                        }
                                                    >
                                                        <View
                                                            style={
                                                                styles.printerOptionItem
                                                            }
                                                        >
                                                            <Text
                                                                style={
                                                                    styles.printerOptionName
                                                                }
                                                            >
                                                                {device.name}
                                                            </Text>
                                                            {currentStatus.mac ==
                                                                currentPrinter?.address && (
                                                                <Text
                                                                    style={[
                                                                        styles.printerOptionStatus,
                                                                        !currentStatus.success &&
                                                                            !currentStatus.loading &&
                                                                            styles.printerOptionStatusFailed,
                                                                        !currentStatus.success &&
                                                                            currentStatus.loading &&
                                                                            styles.printerOptionStatusLoading,
                                                                    ]}
                                                                >
                                                                    {
                                                                        currentStatus.message
                                                                    }
                                                                </Text>
                                                            )}
                                                        </View>
                                                        <PrinterWidthOptions
                                                            device={device}
                                                        />
                                                    </View>
                                                </TouchableNativeFeedback>
                                            )
                                        )}
                                    </ScrollView>
                                )}
                                <View style={{ padding: 16 }}>
                                    <SubmitButton
                                        title={
                                            currentPrinter ? "Salvar" : "Fechar"
                                        }
                                        onPress={handleSave}
                                    />
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </PrinterContext.Provider>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.7)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "white",
        borderRadius: 4,
        width: "90%",
        height: "80%",
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        overflow: "hidden",
    },
    modalTitle: {
        backgroundColor: "#061949",
        padding: 16,
        maxWidth: "100%",
    },
    modalTitleText: {
        fontWeight: 700,
        fontSize: 16,
        color: "#fff",
    },
    modalTitleDesc: {
        fontSize: 14,
        color: "#fff",
        flexShrink: 1,
        flexWrap: "wrap",
        overflow: "hidden",
    },
    allPrinters: {
        flex: 1,
    },
    printerOption: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        padding: 16,
    },
    printerOptionCheck: {
        width: 20,
        height: 20,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: "#061949",
    },
    printerOptionChecked: {
        backgroundColor: "#061949",
    },
    printerOptionItem: {
        flex: 1,
    },
    printerOptionName: {
        fontSize: 15,
        flex: 1,
    },
    printerOptionStatus: {
        fontSize: 14,
        color: "#27CF2F",
    },
    printerOptionStatusFailed: {
        fontSize: 14,
        color: "#FF3535",
    },
    printerOptionStatusLoading: {
        fontSize: 14,
        color: "#061949",
    },
    printerOptionWidth: {
        width: 120,
        height: 46,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: "#061949",
        flexDirection: "row",
        padding: 2,
    },
    printerOptionWidthOption: {
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
        borderRadius: 2,
    },
    printerOptionWidthOptionChecked: {
        backgroundColor: "#061949",
    },
    printerOptionWidthOptionText: {
        fontSize: 14,
        color: "#000",
    },
    printerOptionWidthOptionTextChecked: {
        color: "#fff",
    },
    notFound: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 32,
    },
    notFoundText: {
        textAlign: "center",
        paddingHorizontal: 32,
    },
    notFoundButton: {
        borderRadius: 8,
        padding: 16,
        backgroundColor: "#EAF6FF",
    },
    notFoundSearchText: {},
});

export const usePrinter = () => {
    const context = useContext(PrinterContext);
    if (!context) {
        throw new Error("usePrinter deve ser usado dentro do PrinterProvider");
    }
    return context;
};
