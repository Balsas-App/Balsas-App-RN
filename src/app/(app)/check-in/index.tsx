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
import { createCheckin } from "@services/checkin";
import Toast from "react-native-toast-message";

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

    useEffect(() => {
        const loadBoarding = async () => {
            const data = await getBoarding(
                params.boarding_id as unknown as number
            );

            if (data) {
                setBoardingData(data);

                const vehicles = await getVehiclesList();
                setVehiclesList(vehicles);

                setLoading(false);
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
        };

        loadBoarding();
    }, [params.boarding_id]);

    const renderBackdrop = (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
            {...props}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
            pressBehavior="close" // fecha ao clicar no backdrop
        />
    );

    const openBottomSheet = () => {
        doneBottomSheet.current?.snapToIndex(0);
    };

    const closeBottomSheet = () => {
        doneBottomSheet.current?.close();
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
            openBottomSheet();
            setCheckinId(response.checkin_id);
            setBoardingData((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    total_checkins: prev.total_checkins + 1,
                };
            });
        } else {
            Toast.show({
                type: "error",
                text1: "Ocorreu um erro",
                text2: response.message,
                position: "top",
                topOffset: 100,
            });
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

    if (!boardingData) {
        return <LoadingScreen />;
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <AppHeader
                    title={
                        boardingData.total_checkins
                            ? `Embarque (${boardingData.total_checkins})`
                            : `Embarque`
                    }
                />

                <ScrollView style={styles.checkIn}>
                    <BoardingHeader
                        ferry={boardingData.ferry_name}
                        date={boardingData.time_in}
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

                {loading && <LoadingScreen />}
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
};

export default Page;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F1F1F1",
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
    },
    sheetSubtitle: {
        fontSize: 14,
        color: "#9C9C9C",
        marginBottom: 24,
    },
    sheetButtons: {
        width: "100%",
        gap: 24,
    },
});
