import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from "react";
import {
    View,
    Text,
    StyleSheet,
    Platform,
    Alert,
    Image,
    TouchableOpacity,
} from "react-native";
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

import BalsasReportLogo from "@assets/images/balsas-report-logo.svg";

export const renderToBase64 = async (
    ref: React.RefObject<any>
): Promise<string | null> => {
    try {
        const uri = await captureRef(ref, {
            format: "png",
            quality: 1,
            result: "base64",
            width: 384,
        });

        return uri;
    } catch (error) {
        console.error("Erro ao gerar base64 da view:", error);
        return null;
    }
};

export type PrinterRefProps = {
    print: () => void;
};
type ComponentProps = {
    checkin: CheckinInfos;
};

const Component = forwardRef<PrinterRefProps, ComponentProps>(
    ({ checkin }, ref) => {
        const [boardingData, setBoardingData] = useState<Boarding>();
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
                        width: 384,
                        left: 0,
                    });
                } catch (err) {
                    console.error("Erro ao imprimir:", err);
                }
            },
        }));

        useEffect(() => {
            const loadCheckin = async () => {
                try {
                    const [boarding, vehicles] = await Promise.all([
                        getBoarding(checkin.boarding),
                        getVehiclesList(),
                    ]);

                    if (boarding && vehicles) {
                        setBoardingData(boarding);
                        setVehiclesList(vehicles);
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

            loadCheckin();
        }, [checkin]);

        return (
            <View style={styles.container} ref={viewRef} collapsable={false}>
                <View style={styles.header}>
                    <BalsasReportLogo width={180} height={58} />
                    <Text style={styles.title}>Comprovante de pagamento</Text>
                    <Text style={styles.date}>
                        {checkin?.date_in
                            ? `${new Date(
                                  checkin.date_in
                              ).toLocaleDateString()} - ${new Date(
                                  checkin.date_in
                              ).toLocaleTimeString()}`
                            : ""}
                    </Text>
                    <Text style={styles.ferryName}>
                        {boardingData?.ferry_name}
                    </Text>
                </View>
                <View style={styles.value}>
                    <Text style={styles.valueText}>Valor</Text>
                    <Text style={styles.valueText}>
                        {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                        }).format(checkin?.value || 0)}
                    </Text>
                </View>
                <View style={styles.info}>
                    <Text style={[styles.infoText, styles.infoTextTitle]}>
                        Trecho
                    </Text>
                    <Text style={styles.infoText}>
                        {boardingData?.route_name}
                    </Text>
                </View>
                <View style={styles.info}>
                    <Text style={[styles.infoText, styles.infoTextTitle]}>
                        Placa
                    </Text>
                    <Text style={styles.infoText}>{checkin?.plate}</Text>
                </View>
                <View style={styles.info}>
                    <Text style={[styles.infoText, styles.infoTextTitle]}>
                        Tipo
                    </Text>
                    <Text style={styles.infoText}>
                        {checkin?.vehicle_category_name}:{" "}
                        {checkin?.vehicle_name}
                    </Text>
                </View>
                <View style={styles.info}>
                    <Text style={[styles.infoText, styles.infoTextTitle]}>
                        Pax
                    </Text>
                    <Text style={styles.infoText}>{checkin?.pax}</Text>
                </View>
                <View style={styles.info}>
                    <Text style={[styles.infoText, styles.infoTextTitle]}>
                        Obs
                    </Text>
                    <Text style={styles.infoText}>{checkin?.observation}</Text>
                </View>

                {!!checkin?.add_value && (
                    <View style={styles.addValues}>
                        <Text style={styles.addValuesTitle}>
                            Valores adicionais
                        </Text>

                        <View
                            style={[
                                styles.info,
                                { borderBottomWidth: 0, paddingHorizontal: 0 },
                            ]}
                        >
                            <Text
                                style={[styles.infoText, styles.infoTextTitle]}
                            >
                                {checkin?.add_value_reason}
                            </Text>
                            <Text style={styles.infoText}>
                                {new Intl.NumberFormat("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                }).format(checkin?.add_value || 0)}
                            </Text>
                        </View>
                    </View>
                )}

                <View style={styles.fixedText}>
                    <Text style={styles.fixedTextTitle}>
                        Observações Importantes:
                    </Text>
                    <Text style={styles.fixedTextText}>
                        • Este Bilhete só é válido para a viagem de IDA;
                    </Text>
                    <Text style={styles.fixedTextText}>
                        • Durante a viagem o passageiro é o único responsável
                        pelos seus pertences, tais como: Carteira, Celular e
                        equipamentos eletrônicos etc.{" "}
                    </Text>
                </View>

                <View style={styles.fixedContact}>
                    <Text style={styles.fixedContactTitle}>
                        Dúvidas entre em contato!
                    </Text>
                    <Text style={styles.contactNumber}>92 99177-7713</Text>
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
        padding: 0,
        margin: 0,
    },
    header: {
        padding: 16,
        paddingTop: 0,
        borderBottomWidth: 1,
        borderBottomColor: "#ABBED1",
        borderStyle: "dashed",
    },
    title: {
        fontSize: 20,
        fontWeight: 600,
        color: "#212121",
        marginTop: 32,
    },
    date: {
        color: "#4D4D4D",
        fontSize: 16,
        marginTop: 4,
    },
    ferryName: {
        fontSize: 18,
        fontWeight: 600,
        color: "#212121",
        marginTop: 24,
    },
    value: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 24,
        borderBottomWidth: 1,
        borderBottomColor: "#ABBED1",
        borderStyle: "dashed",
    },
    valueText: {
        fontSize: 18,
        fontWeight: 700,
        color: "#212121",
    },
    info: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        gap: 32,
    },
    infoText: {
        fontSize: 18,
        color: "#212121",
        fontWeight: 300,
    },
    infoTextTitle: {
        fontWeight: 500,
    },
    addValues: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: "#ABBED1",
        borderStyle: "dashed",
    },
    addValuesTitle: {
        fontSize: 18,
        fontWeight: 700,
        color: "#4D4D4D",
    },
    fixedText: {
        borderTopWidth: 1,
        borderTopColor: "#ABBED1",
        borderStyle: "dashed",
        padding: 16,
    },
    fixedTextTitle: {
        fontSize: 18,
        fontWeight: 700,
        color: "#4D4D4D",
        marginBottom: 8,
    },
    fixedTextText: {
        fontSize: 16,
        fontWeight: 300,
        color: "#4D4D4D",
    },
    fixedContact: {
        borderTopWidth: 1,
        borderTopColor: "#ABBED1",
        borderStyle: "dashed",
        padding: 16,
    },
    fixedContactTitle: {
        fontSize: 18,
        fontWeight: 700,
        color: "#4D4D4D",
        marginBottom: 16,
        textAlign: "center",
    },
    contactNumber: {
        textAlign: "center",
        fontSize: 16,
        fontWeight: 500,
        color: "#4D4D4D",
    },
});
