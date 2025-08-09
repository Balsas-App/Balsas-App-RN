import AppHeader from "@components/AppHeader";
import BoardingHeader from "@components/BoardingHeader";
import {
    router,
    useFocusEffect,
    useLocalSearchParams,
    useNavigation,
} from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    StyleSheet,
    View,
    Alert,
    Text,
    ScrollView,
    BackHandler,
    Platform,
    TouchableOpacity,
    Modal,
    TouchableWithoutFeedback,
    Keyboard,
} from "react-native";
import LoadingScreen from "@components/LoadingScreen";
import { CheckinInfos } from "@type/checkins";
import { finishBoarding, getBoarding } from "@services/boarding";
import { getVehiclesList } from "@services/vehicles";
import { VehiclesList } from "@type/vehicles";
import {
    changePlate,
    getBoardingCheckins,
    getCheckin,
} from "@services/checkin";
import CheckinDetailsRow from "@components/CheckinDetailsRow";
import React from "react";
import SubmitButton from "@components/SubmitButton";
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetView,
} from "@gorhom/bottom-sheet";
import WarningIcon from "@assets/images/warning-checkin.svg";
import Toast from "react-native-toast-message";
import { captureRef } from "react-native-view-shot";
import * as FileSystem from "expo-file-system";
import { BluetoothEscposPrinter } from "react-native-bluetooth-escpos-printer";
import ReportPrintView, { PrinterRefProps } from "@components/ReportPrintView";
import { Boarding } from "@type/boardings";

import PrintIcon from "@assets/icons/action-print.svg";
import SendIcon from "@assets/icons/action-send.svg";
import RefundIcon from "@assets/icons/action-refund.svg";
import CloseIcon from "@assets/icons/close-modal.svg";
import CheckinDetailsPrintView from "@components/CheckinDetailsPrintView";
import TextInput from "@components/TextInput";
import CloseModal from "@assets/icons/close-modal.svg";

const Page = () => {
    const params = useLocalSearchParams();
    const [boardingData, setBoardingData] = useState<Boarding>();
    const [checkinData, setCheckinData] = useState<CheckinInfos>();
    const [loading, setLoading] = useState(true);
    const [vehicles, setVehiclesList] = useState<VehiclesList>([]);
    const navigation = useNavigation();
    const [changePlateModal, setChangePlateModal] = useState(false);
    const [plate, setPlate] = useState<string>();

    const compRef = useRef<PrinterRefProps>(null);

    useEffect(() => {
        const loadCheckin = async () => {
            try {
                const [data, vehicles] = await Promise.all([
                    getCheckin(params.checkin_id as unknown as number),
                    getVehiclesList(),
                ]);

                if (data) {
                    setCheckinData(data);
                    setPlate(data.plate);

                    const boarding = await getBoarding(data.boarding);
                    if (boarding) setBoardingData(boarding);
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
    }, [params.checkin_id]);

    const handlePrint = () => {
        compRef.current?.print();
    };

    const handleChangePlate = async () => {
        if (!checkinData || !plate) return;

        try {
            const response = await changePlate(checkinData?.id, plate);

            if (response) {
                Toast.show({
                    type: "success",
                    text1: "Placa alterada com sucesso!",
                    position: "top",
                    topOffset: 100,
                });
            } else {
                Toast.show({
                    type: "error",
                    text1: "Ocorreu um erro ao alterar placa.",
                    position: "top",
                    topOffset: 100,
                });
            }
        } catch (_e) {
            Toast.show({
                type: "error",
                text1: "Ocorreu um erro ao alterar placa.",
                position: "top",
                topOffset: 100,
            });
        } finally {
            setChangePlateModal(false);
            setLoading(false);
        }
    };

    if (loading && !checkinData) return <LoadingScreen />;

    return (
        <>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <CloseIcon />
                    </TouchableOpacity>

                    <Text style={styles.title}>Comprovante de pagamento</Text>
                    <Text style={styles.date}>
                        {checkinData?.date_in
                            ? `${new Date(
                                  checkinData.date_in
                              ).toLocaleDateString()} - ${new Date(
                                  checkinData.date_in
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
                        }).format(checkinData?.value || 0)}
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
                    <TouchableOpacity onPress={() => setChangePlateModal(true)}>
                        <Text style={styles.infoText}>
                            {checkinData?.plate}
                        </Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.info}>
                    <Text style={[styles.infoText, styles.infoTextTitle]}>
                        Tipo
                    </Text>
                    <Text style={styles.infoText}>
                        {checkinData?.vehicle_category_name}:{" "}
                        {checkinData?.vehicle_name}
                    </Text>
                </View>
                <View style={styles.info}>
                    <Text style={[styles.infoText, styles.infoTextTitle]}>
                        Pax
                    </Text>
                    <Text style={styles.infoText}>{checkinData?.pax}</Text>
                </View>
                <View style={styles.info}>
                    <Text style={[styles.infoText, styles.infoTextTitle]}>
                        Obs
                    </Text>
                    <Text style={styles.infoText}>
                        {checkinData?.observation}
                    </Text>
                </View>

                {!!checkinData?.add_value && (
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
                                {checkinData?.add_value_reason}
                            </Text>
                            <Text style={styles.infoText}>
                                {new Intl.NumberFormat("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                }).format(checkinData?.add_value || 0)}
                            </Text>
                        </View>
                    </View>
                )}

                <View style={styles.actions}>
                    <TouchableOpacity
                        style={styles.action}
                        onPress={handlePrint}
                    >
                        <View style={styles.actionIcon}>
                            <PrintIcon color="#1A1A1A" />
                        </View>
                        <Text style={styles.actionText}>
                            Imprimir comprovante
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.action}>
                        <View style={styles.actionIcon}>
                            <SendIcon color="#1A1A1A" />
                        </View>
                        <Text style={styles.actionText}>
                            Enviar comprovante
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.action}
                        onPress={() =>
                            checkinData &&
                            router.push({
                                pathname: "/refund",
                                params: {
                                    checkin_id: checkinData.id,
                                },
                            })
                        }
                    >
                        <View style={styles.actionIcon}>
                            <RefundIcon color="#1A1A1A" />
                        </View>
                        <Text style={styles.actionText}>
                            Fazer um reembolso
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <Modal
                visible={changePlateModal}
                onRequestClose={() => setChangePlateModal(false)}
                transparent={true}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.modal}>
                        <View style={styles.changePlateForm}>
                            <View style={styles.changePlateFormTitle}>
                                <Text>Editar Placa</Text>
                                <TouchableOpacity
                                    onPress={() => setChangePlateModal(false)}
                                >
                                    <CloseModal />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.changePlateFormBody}>
                                <TextInput
                                    placeholder="XYZ9999"
                                    type="text"
                                    maxLength={7}
                                    value={plate}
                                    onChange={(text) =>
                                        setPlate(text.toString())
                                    }
                                    uppercase={true}
                                />

                                <SubmitButton
                                    title="Salvar"
                                    onPress={handleChangePlate}
                                    disabled={plate == checkinData?.plate}
                                />
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {checkinData && (
                <CheckinDetailsPrintView checkin={checkinData} ref={compRef} />
            )}

            {loading && <LoadingScreen />}
        </>
    );
};

export default Page;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF",
    },
    header: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#ABBED1",
    },
    title: {
        fontSize: 20,
        fontWeight: 600,
        color: "#212121",
        marginTop: 32,
    },
    date: {
        color: "#4D4D4D",
        fontSize: 14,
        marginTop: 4,
    },
    ferryName: {
        fontSize: 16,
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
        paddingBottom: 42,
        borderBottomWidth: 1,
        borderBottomColor: "#ABBED1",
    },
    valueText: {
        fontSize: 15,
        fontWeight: 600,
        color: "#212121",
    },
    info: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#ABBED1",
        gap: 32,
    },
    infoText: {
        fontSize: 14,
        color: "#212121",
    },
    infoTextTitle: {
        fontWeight: 500,
    },
    addValues: {
        padding: 16,
        paddingBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: "#ABBED1",
    },
    addValuesTitle: {
        fontSize: 15,
        fontWeight: 700,
        color: "#4D4D4D",
    },
    actions: {
        paddingVertical: 36,
        flexDirection: "row",
        justifyContent: "center",
        gap: 24,
    },
    action: {
        maxWidth: 86,
        alignItems: "center",
        gap: 10,
    },
    actionIcon: {
        width: 48,
        height: 48,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#E5E5E5",
    },
    actionText: {
        textAlign: "center",
        fontWeight: 500,
        fontSize: 12,
        color: "#717171",
        width: "100%",
    },
    modal: {
        backgroundColor: "rgba(0,0,0,0.3)",
        position: "absolute",
        left: 0,
        top: 0,
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    changePlateForm: {
        width: 286,
        backgroundColor: "#fff",
    },
    changePlateFormTitle: {
        padding: 12,
        borderBottomWidth: 1,
        borderBlockColor: "#ABBED1",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    changePlateFormText: {
        color: "#0A1B22",
        fontSize: 16,
    },
    changePlateFormBody: {
        gap: 24,
        paddingVertical: 36,
        paddingHorizontal: 16,
    },
});
