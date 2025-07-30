import AppHeader from "@components/AppHeader";
import BoardingHeader from "@components/BoardingHeader";
import TextInput from "@components/TextInput";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    StyleSheet,
    View,
    Alert,
    Text,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";

import PaxIcon from "@assets/icons/input-pax.svg";
import ValueIcon from "@assets/icons/input-value.svg";
import SuperSelectInput from "@components/SuperSelectInput";
import SubmitButton from "@components/SubmitButton";
import LoadingScreen from "@components/LoadingScreen";
import { getBoarding } from "@services/boarding";
import { VehiclesList } from "@type/vehicles";
import { getVehiclesList } from "@services/vehicles";
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetView,
} from "@gorhom/bottom-sheet";
import DoneCheckin from "@assets/images/done-checkin.svg";
import ErrorCheckin from "@assets/images/error-checkin.svg";
import { createCheckin, getCheckin } from "@services/checkin";
import Toast from "react-native-toast-message";
import FerryIcon from "@assets/icons/ferry-detail.svg";
import CalendarIcon from "@assets/icons/calendar-detail.svg";
import ClockIcon from "@assets/icons/time-detail.svg";

const Page = () => {
    const params = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [boardingData, setBoardingData] = useState<{
        ferry_name: string;
        route_name: string;
        time_in: Date;
        total_checkins: number;
    }>();
    const [plate, setPlate] = useState("");
    const [pax, setPax] = useState<number>(1);
    const [additionalValue, setAdditionalValue] = useState<string>();
    const [additionalValueReason, setAdditionalValueReason] = useState("");
    const [observation, setObservation] = useState("");
    const [vehiclesList, setVehiclesList] = useState<VehiclesList>([]);
    const [vehicle, setVehicle] = useState<{
        id: number;
        name: string;
        value: number;
    }>();
    const [checkinId, setCheckinId] = useState<number | null>(null);
    const doneBottomSheet = useRef<BottomSheet>(null);
    const samePlateBottomSheet = useRef<BottomSheet>(null);
    const [alreadyCheckin, setAlreadyCheckin] = useState<{
        plate: string;
        ferry: string;
        date: string;
        time: string;
    } | null>();

    useEffect(() => {
        const loadData = async () => {
            try {
                const [boarding, vehicles] = await Promise.all([
                    getBoarding(params.boarding_id as unknown as number),
                    getVehiclesList(),
                ]);

                if (!boarding) {
                    Alert.alert(
                        "Ocorreu um erro ao carregar dados do embarque",
                        "Inicie um novo embarque.",
                        [{ text: "Ok", onPress: () => router.back() }],
                        { cancelable: false }
                    );
                    return;
                }

                setBoardingData(boarding);
                setVehiclesList(vehicles);
            } catch (error) {
                Alert.alert(
                    "Erro de rede",
                    "Não foi possível carregar os dados. Tente novamente."
                );
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [params.boarding_id]);

    const renderBackdrop = (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
            {...props}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
            pressBehavior="close" // fecha ao clicar no backdrop
        />
    );

    const openBottomSheet = (sheet: string) => {
        if (sheet == "done") {
            doneBottomSheet.current?.snapToIndex(0);
        } else if (sheet == "plate") {
            samePlateBottomSheet.current?.snapToIndex(0);
        }
    };

    const closeBottomSheet = () => {
        doneBottomSheet.current?.close();
        samePlateBottomSheet.current?.close();
    };

    const handleCheckin = async () => {
        if (!plate || !pax || !vehicle) return;
        setLoading(true);

        const response = await createCheckin(
            params.boarding_id as unknown as number,
            plate,
            pax,
            vehicle.id,
            vehicle.value,
            additionalValue
                ? parseFloat(
                      additionalValue.replace(/\./g, "").replace(",", ".")
                  )
                : 0,
            observation,
            additionalValueReason
        );

        if (response.success) {
            openBottomSheet("done");
            setCheckinId(response.checkin_id);
            setBoardingData((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    total_checkins: prev.total_checkins + 1,
                };
            });
        } else {
            if (response.checkin_id) {
                const checkinData = await getCheckin(response.checkin_id);

                if (checkinData) {
                    setAlreadyCheckin({
                        plate: checkinData.plate,
                        ferry: checkinData.ferry_name,
                        date: new Date(
                            checkinData.date_in
                        ).toLocaleDateString(),
                        time: new Date(
                            checkinData.date_in
                        ).toLocaleTimeString(),
                    });
                    openBottomSheet("plate");
                } else {
                    Toast.show({
                        type: "error",
                        text1: "Ocorreu um erro",
                        text2: response.message,
                        position: "top",
                        topOffset: 100,
                    });
                }
            } else {
                Toast.show({
                    type: "error",
                    text1: "Ocorreu um erro",
                    text2: response.message,
                    position: "top",
                    topOffset: 100,
                });
            }
        }
        setLoading(false);
    };

    const resetAll = () => {
        setPlate("");
        setPax(1);
        setVehicle(undefined);
        setAdditionalValue(undefined);
        setObservation("");
        setAdditionalValue("");
        setCheckinId(null);
        closeBottomSheet();
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === "ios" ? "padding" : "padding"}
            >
                <AppHeader
                    title={
                        boardingData?.total_checkins
                            ? `Embarque (${boardingData.total_checkins})`
                            : `Embarque`
                    }
                />

                <ScrollView style={styles.checkIn}>
                    <BoardingHeader
                        ferry={boardingData?.ferry_name || ""}
                        date={boardingData?.time_in || new Date()}
                    />

                    <View style={styles.form}>
                        <View style={styles.doubleInput}>
                            <View style={{ flex: 1 }}>
                                <TextInput
                                    label="Placa"
                                    placeholder="XYZ9999"
                                    type="text"
                                    value={plate}
                                    onChange={(text) =>
                                        setPlate(text.toString())
                                    }
                                    uppercase={true}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <TextInput
                                    label="Qtd Pessoas"
                                    placeholder="1"
                                    type="number"
                                    value={pax}
                                    sufix={<PaxIcon color="#2B3F6C" />}
                                    onChange={(text) =>
                                        setPax(parseInt(text.toString()))
                                    }
                                />
                            </View>
                        </View>

                        <SuperSelectInput
                            label="Tipo de automóvel"
                            placeholder="Selecione um tipo"
                            data={vehiclesList}
                            onChange={(value) => setVehicle(value)}
                            value={vehicle}
                        />

                        <View style={styles.doubleInput}>
                            <View style={{ flex: 1 }}>
                                <TextInput
                                    label="Valor"
                                    placeholder="0,00"
                                    type="text"
                                    value={
                                        vehicle?.value.toLocaleString("pt-BR", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        }) || "0,00"
                                    }
                                    sufix={<ValueIcon color="#2B3F6C" />}
                                    disabled
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <TextInput
                                    label="Valor adicional"
                                    placeholder="0,00"
                                    type="money"
                                    value={additionalValue}
                                    sufix={<ValueIcon color="#2B3F6C" />}
                                    onChange={(value) =>
                                        setAdditionalValue(value.toString())
                                    }
                                />
                            </View>
                        </View>

                        {additionalValue &&
                            additionalValue?.length > 0 &&
                            additionalValue != "0,00" && (
                                <TextInput
                                    label="Justificativa de valor adicional"
                                    placeholder="Insira a justificativa"
                                    type="textarea"
                                    value={additionalValueReason}
                                    onChange={(text) =>
                                        setAdditionalValueReason(
                                            text.toString()
                                        )
                                    }
                                />
                            )}

                        <TextInput
                            label="Observação"
                            placeholder="Informações complementares"
                            type="textarea"
                            value={observation}
                            onChange={(text) => setObservation(text.toString())}
                        />

                        <View style={{ marginTop: 16 }}>
                            <SubmitButton
                                title="Confirmar Veículo"
                                onPress={handleCheckin}
                                disabled={!plate || !pax || !vehicle}
                            />
                        </View>
                        <SubmitButton
                            title="Ver resumo"
                            style={{
                                backgroundColor: "#FFFFFF",
                                borderWidth: 1,
                                borderColor: "#898A8D",
                            }}
                            textStyle={{ color: "#000" }}
                            onPress={() =>
                                router.push({
                                    pathname: "/boarding-details",
                                    params: {
                                        boarding_id: params.boarding_id,
                                    },
                                })
                            }
                        />
                    </View>
                </ScrollView>

                <BottomSheet
                    ref={doneBottomSheet}
                    backgroundStyle={{
                        borderTopLeftRadius: 16,
                        borderTopRightRadius: 16,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 10 },
                        shadowOpacity: 1,
                        shadowRadius: 50,
                        elevation: 50,
                    }}
                    enablePanDownToClose={true}
                    index={-1}
                    backdropComponent={renderBackdrop}
                >
                    <BottomSheetView style={styles.sheetContainer}>
                        <View style={styles.sheetContent}>
                            <DoneCheckin />
                            <Text style={styles.sheetTitle}>Confirmado!</Text>
                            <Text style={styles.sheetSubtitle}>
                                Ticket emitido com sucesso.
                            </Text>
                            <View style={styles.sheetButtons}>
                                <SubmitButton
                                    title="Continuar"
                                    onPress={resetAll}
                                />

                                {checkinId && (
                                    <SubmitButton
                                        title="Imprimir Comprovante"
                                        style={{
                                            backgroundColor: "#FFFFFF",
                                            borderWidth: 1,
                                            borderColor: "#898A8D",
                                        }}
                                        textStyle={{ color: "#000" }}
                                    />
                                )}
                            </View>
                        </View>
                    </BottomSheetView>
                </BottomSheet>

                <BottomSheet
                    ref={samePlateBottomSheet}
                    backgroundStyle={{
                        borderTopLeftRadius: 16,
                        borderTopRightRadius: 16,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 10 },
                        shadowOpacity: 1,
                        shadowRadius: 50,
                        elevation: 50,
                    }}
                    enablePanDownToClose={true}
                    index={-1}
                    backdropComponent={renderBackdrop}
                >
                    <BottomSheetView style={styles.sheetContainer}>
                        <View style={styles.sheetContent}>
                            <ErrorCheckin />
                            <Text
                                style={[
                                    styles.sheetTitle,
                                    { fontSize: 20, fontWeight: "bold" },
                                ]}
                            >
                                Esta placa já foi registrada!
                            </Text>
                            <View style={styles.samePlateContainer}>
                                <View style={styles.samePlateInfos}>
                                    <View style={styles.samePlateInfoItem}>
                                        <Text
                                            style={[
                                                styles.samePlateInfoItemText,
                                                {
                                                    fontWeight: "bold",
                                                    color: "#4D4D4D",
                                                },
                                            ]}
                                        >
                                            Placa:
                                        </Text>
                                        <Text
                                            style={[
                                                styles.samePlateInfoItemText,
                                                {
                                                    color: "#4D4D4D",
                                                },
                                            ]}
                                        >
                                            {alreadyCheckin?.plate}
                                        </Text>
                                    </View>
                                    <View style={styles.samePlateInfoItem}>
                                        <FerryIcon
                                            width={24}
                                            height={24}
                                            color="#000000"
                                        />
                                        <Text
                                            style={styles.samePlateInfoItemText}
                                        >
                                            {alreadyCheckin?.ferry}
                                        </Text>
                                    </View>
                                    <View style={styles.samePlateInfoItem}>
                                        <CalendarIcon
                                            width={24}
                                            height={24}
                                            color="#717171"
                                        />
                                        <Text
                                            style={styles.samePlateInfoItemText}
                                        >
                                            {alreadyCheckin?.date}
                                        </Text>
                                    </View>
                                    <View style={styles.samePlateInfoItem}>
                                        <ClockIcon
                                            width={24}
                                            height={24}
                                            color="#717171"
                                        />
                                        <Text
                                            style={styles.samePlateInfoItemText}
                                        >
                                            {alreadyCheckin?.time}
                                        </Text>
                                    </View>
                                </View>
                                <Text
                                    style={{
                                        textAlign: "center",
                                        color: "#717171",
                                        fontSize: 16,
                                    }}
                                >
                                    Verifique a lista de veículos em "ver
                                    resumo".
                                </Text>
                            </View>
                        </View>
                    </BottomSheetView>
                </BottomSheet>

                {loading && <LoadingScreen />}
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
};

export default Page;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF",
        justifyContent: "flex-start",
    },
    checkIn: {
        flex: 1,
        paddingBottom: 32,
    },
    form: {
        gap: 20,
        padding: 16,
    },
    doubleInput: {
        flexDirection: "row",
        gap: 20,
    },
    sheetContainer: {
        flex: 1,
        padding: 12,
        paddingBottom: 24,
        alignItems: "center",
    },
    sheetContent: {
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    sheetTitle: {
        color: "#1A1B25",
        fontSize: 32,
        marginTop: 20,
        fontWeight: 600,
        textAlign: "center",
    },
    sheetSubtitle: {
        fontSize: 14,
        color: "#9C9C9C",
        marginBottom: 24,
        textAlign: "center",
    },
    sheetButtons: {
        width: "100%",
        gap: 24,
    },
    samePlateContainer: {
        width: "100%",
    },
    samePlateInfos: {
        width: "100%",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        gap: 6,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderTopColor: "#ABBED1",
        borderBottomColor: "#ABBED1",
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginVertical: 16,
    },
    samePlateInfoItem: {
        flexDirection: "row",
        gap: 8,
        alignItems: "center",
    },
    samePlateInfoItemText: {
        fontSize: 15,
        color: "#717171",
    },
});
