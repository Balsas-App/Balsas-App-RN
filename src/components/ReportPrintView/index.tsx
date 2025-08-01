import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from "react";
import { View, Text, StyleSheet, Platform, Alert } from "react-native";
import { Boarding } from "@type/boardings";
import { router, useNavigation } from "expo-router";
import { VehiclesList } from "@type/vehicles";
import { captureRef } from "react-native-view-shot";
import * as FileSystem from "expo-file-system";
import { BluetoothEscposPrinter } from "react-native-bluetooth-escpos-printer";
import { CheckinInfos } from "@type/checkins";
import PrintableCheckinDetailsRow from "@components/PrintableCheckinDetailsRow";
import { getBoarding } from "@services/boarding";
import { getVehiclesList } from "@services/vehicles";
import { getBoardingCheckins } from "@services/checkin";
import PrintableBoardingHeader from "@components/PrintableBoardingHeader";

export const renderToBase64 = async (
    ref: React.RefObject<any>
): Promise<string | null> => {
    try {
        const uri = await captureRef(ref, {
            format: "png",
            quality: 1,
        });

        const cleanUri =
            Platform.OS === "ios" ? uri.replace("file://", "") : uri;

        const base64 = await FileSystem.readAsStringAsync(cleanUri, {
            encoding: FileSystem.EncodingType.Base64,
        });

        return base64;
    } catch (error) {
        console.error("Erro ao gerar base64 da view:", error);
        return null;
    }
};

type GroupedCheckins = {
    vehicle_type: string;
    checkins: CheckinInfos[];
};

export type PrinterRefProps = {
    print: () => void;
};
type ComponentProps = {
    boarding: Boarding;
};

const Component = forwardRef<PrinterRefProps, ComponentProps>(
    ({ boarding }, ref) => {
        const [boardingData, setBoardingData] = useState<Boarding>();
        const [checkinsData, setCheckinsData] = useState<GroupedCheckins[]>([]);
        const [loading, setLoading] = useState(true);
        const [vehicles, setVehiclesList] = useState<VehiclesList>([]);
        const [partialValue, setPartialValue] = useState(0);
        const [totalValue, setTotalValue] = useState(0);
        const navigation = useNavigation();
        const viewRef = useRef<View>(null);

        useImperativeHandle(ref, () => ({
            print: async () => {
                const base64Image = await renderToBase64(viewRef);
                if (!base64Image) return;

                try {
                    await BluetoothEscposPrinter.printPic(base64Image, {
                        width: 384, // ajuste conforme sua impressora
                        left: 0,
                    });
                } catch (err) {
                    console.error("Erro ao imprimir:", err);
                }
            },
        }));

        const sumCategoryVehicleValues = (vehicles: CheckinInfos[]) => {
            return vehicles.reduce((sum, vehicle) => sum + vehicle.value, 0);
        };

        const groupCheckins = (data: CheckinInfos[]) => {
            const grouped: Record<string, CheckinInfos[]> = data.reduce(
                (acc, item) => {
                    const type = item.vehicle_category_name;
                    if (!acc[type]) {
                        acc[type] = [];
                    }
                    acc[type].push(item);
                    return acc;
                },
                {} as Record<string, CheckinInfos[]>
            );

            const result: GroupedCheckins[] = Object.entries(grouped)
                .map(([vehicle_type, checkins]) => {
                    checkins.sort(
                        (a, b) =>
                            new Date(b.date_in).getTime() -
                            new Date(a.date_in).getTime()
                    );
                    return {
                        vehicle_type: vehicle_type,
                        checkins,
                    };
                })
                .sort((a, b) => {
                    const dateA = new Date(a.checkins[0].date_in).getTime();
                    const dateB = new Date(b.checkins[0].date_in).getTime();
                    return dateB - dateA;
                });

            return result;
        };

        useEffect(() => {
            const loadBoarding = async () => {
                try {
                    const [data, vehicles] = await Promise.all([
                        getBoarding(boarding.boarding_id as unknown as number),
                        getVehiclesList(),
                    ]);

                    if (data) {
                        setBoardingData(data);
                        setVehiclesList(vehicles);

                        const checkins = await getBoardingCheckins(
                            boarding.boarding_id as unknown as number
                        );

                        setPartialValue(
                            checkins.reduce(
                                (sum, checkin) => sum + checkin.value,
                                0
                            )
                        );

                        setTotalValue(
                            checkins.reduce(
                                (sum, checkin) =>
                                    sum + checkin.value + checkin.add_value,
                                0
                            )
                        );
                        setCheckinsData(groupCheckins(checkins));
                    } else {
                        Alert.alert(
                            "Ocorreu um erro ao carregar dados do embarque",
                            "Inicie um novo embarque.",
                            [
                                {
                                    text: "Ok",
                                    onPress: () => router.back(),
                                },
                            ],
                            { cancelable: false }
                        );
                    }

                    setLoading(false);
                } catch (err) {
                    console.log("error", err);
                }
            };

            loadBoarding();
        }, [boarding]);

        return (
            <View style={styles.container} ref={viewRef} collapsable={false}>
                <View style={styles.checkinList}>
                    <PrintableBoardingHeader
                        ferry={boardingData?.ferry_name || ""}
                        date={
                            boardingData?.time_in
                                ? new Date(boardingData.time_in)
                                : new Date()
                        }
                    />
                    <View style={{ height: 16 }}></View>
                    <View style={{ backgroundColor: "#fff" }}>
                        <PrintableCheckinDetailsRow
                            checkin={{
                                col1: "Placa",
                                col2: "Veículos",
                                col3: "Pax",
                                col4: "Pago",
                            }}
                            isHeader={true}
                        />
                    </View>
                    {checkinsData.length > 0 &&
                        checkinsData.map((group, key) => (
                            <View key={key}>
                                <Text style={styles.categoryTitle}>
                                    {group.vehicle_type}
                                </Text>
                                {group.checkins.length > 0 &&
                                    group.checkins.map((checkin, subkey) => (
                                        <React.Fragment key={subkey}>
                                            <PrintableCheckinDetailsRow
                                                checkin={checkin}
                                            />
                                            {subkey ==
                                                group.checkins.length - 1 && (
                                                <>
                                                    <View
                                                        style={{ height: 8 }}
                                                    ></View>
                                                    <PrintableCheckinDetailsRow
                                                        checkin={{
                                                            col1: "",
                                                            col2: "Valor Categoria",
                                                            col3: "",
                                                            col4: new Intl.NumberFormat(
                                                                "pt-BR",
                                                                {
                                                                    style: "currency",
                                                                    currency:
                                                                        "BRL",
                                                                }
                                                            ).format(
                                                                sumCategoryVehicleValues(
                                                                    group.checkins
                                                                )
                                                            ),
                                                        }}
                                                        isFooter={true}
                                                    />
                                                </>
                                            )}
                                        </React.Fragment>
                                    ))}
                            </View>
                        ))}

                    <View style={styles.partialValueHeader}>
                        <Text style={styles.partialValueHeaderText}>
                            Total parcial
                        </Text>
                        <Text style={styles.partialValueHeaderText}>
                            {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                            }).format(partialValue)}
                        </Text>
                    </View>

                    {checkinsData.length > 0 &&
                        checkinsData.map((group) =>
                            group.checkins.filter(
                                (checkin) => checkin.add_value > 0
                            )
                        ) && (
                            <Text style={styles.categoryTitle}>
                                Valores adicionais
                            </Text>
                        )}

                    {checkinsData.length > 0 &&
                        checkinsData.map((group, key) => (
                            <View key={key}>
                                {group.checkins.length > 0 &&
                                    group.checkins
                                        .filter(
                                            (checkin) => checkin.add_value > 0
                                        )
                                        .map((checkin, subkey) => {
                                            return (
                                                <React.Fragment key={subkey}>
                                                    <PrintableCheckinDetailsRow
                                                        checkin={{
                                                            ...checkin,
                                                            value: checkin.add_value,
                                                        }}
                                                        showReason={true}
                                                    />
                                                </React.Fragment>
                                            );
                                        })}
                            </View>
                        ))}

                    <View
                        style={[
                            styles.partialValueHeader,
                            { borderTopWidth: 0 },
                        ]}
                    >
                        <Text style={styles.partialValueHeaderText}>Total</Text>
                        <Text style={styles.partialValueHeaderText}>
                            {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                            }).format(totalValue)}
                        </Text>
                    </View>
                </View>
            </View>
        );
    }
);

export default Component;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF",
        position: "absolute",
        left: -384,
        top: 0,
        width: 384,
        height: "auto",
    },
    checkinList: {
        flex: 1,
        backgroundColor: "#fff",
    },
    categoryTitle: {
        paddingHorizontal: 0,
        paddingVertical: 4,
        fontSize: 18,
        fontWeight: 500,
        marginTop: 8,
    },
    partialValueHeader: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        justifyContent: "space-between",
        padding: 16,
        paddingHorizontal: 0,
        borderTopWidth: 1,
        borderTopColor: "#ABBED1",
        marginTop: 24,
    },
    partialValueHeaderText: {
        fontSize: 18,
        fontWeight: 500,
        color: "#212121",
    },
    actions: {
        padding: 16,
        gap: 24,
    },
    sheetContainer: {
        flex: 1,
        padding: 12,
        paddingBottom: 24,
        alignItems: "center",
    },
    boardingTitle: {
        fontWeight: 700,
        textAlign: "center",
        fontSize: 20,
        marginBottom: 12,
        marginTop: 12,
    },
    boardingDetails: {
        gap: 6,
        width: "100%",
        paddingHorizontal: 16,
    },
    confirmBoarding: {
        flexDirection: "row",
        gap: 18,
        paddingHorizontal: 18,
        marginTop: 32,
        paddingBottom: 32,
    },
    confirmBoardingButton: {
        flex: 1,
    },
});
