import {
    StyleSheet,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
    Keyboard,
    Platform,
    Text,
    TouchableOpacity,
    View,
    Alert,
} from "react-native";
import { useAuth } from "@contexts/AuthContext";
import AppHeader from "@components/AppHeader";
import { ScrollView } from "react-native-gesture-handler";
import SelectInput from "@components/SelectInput";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import DateInput from "@components/DateInput";
import TimeInput from "@components/TimeInput";
import SubmitButton from "@components/SubmitButton";
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetView,
} from "@gorhom/bottom-sheet";
import Toast from "react-native-toast-message";
import BoardingDetailsItem from "@components/BoardingDetailsItem";

import FerryIcon from "@assets/icons/ferry-detail.svg";
import CalendarIcon from "@assets/icons/calendar-detail.svg";
import ClockIcon from "@assets/icons/time-detail.svg";
import { router } from "expo-router";
import { getFerries, getFerryRoutes, initBoarding } from "@services/boarding";
import { FerryItem, FerryRoute } from "@type/ferries";
import LoadingScreen from "@components/LoadingScreen";

export default function Page() {
    const boardingBottomSheet = useRef<BottomSheet>(null);
    const [loading, setLoading] = useState(false);
    const [ferriesList, setFerriesList] = useState<FerryItem[]>([]);
    const [routesList, setRoutesList] = useState<FerryRoute[]>([]);
    const [ferry, setFerrie] = useState<string | null>(null);
    const [route, setRoute] = useState<string | null>(null);
    const [date, setDate] = useState(new Date());
    const [time, setTime] = useState("");

    useEffect(() => {
        const loadPageData = async () => {
            setLoading(true);
            try {
                const ferries = await getFerries();
                setFerriesList(ferries);

                const routes = await getFerryRoutes();
                setRoutesList(routes);
            } catch (err) {
                console.error("Erro ao carregar dados", err);
            } finally {
                setLoading(false);
            }
        };
        loadPageData();
    }, []);

    const renderBackdrop = (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
            {...props}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
            pressBehavior="close" // fecha ao clicar no backdrop
        />
    );

    const openBoardingBottomSheet = () => {
        boardingBottomSheet.current?.snapToIndex(0);
    };

    const closeBoardingBottomSheet = () => {
        boardingBottomSheet.current?.close();
    };

    const handleStartBoarding = () => {
        if (!ferry) {
            Toast.show({
                type: "error",
                text1: "Selecione uma balsa.",
                position: "top",
                topOffset: 100,
            });
            return;
        }

        if (!route) {
            Toast.show({
                type: "error",
                text1: "Selecione um trecho.",
                position: "top",
                topOffset: 100,
            });
            return;
        }

        if (!date || !time) {
            Toast.show({
                type: "error",
                text1: "Preencha a data e horário corretamente.",
                position: "top",
                topOffset: 100,
            });
            return;
        }

        openBoardingBottomSheet();
    };

    const startBoarding = async () => {
        const ferryObj = ferriesList.find((item) => ferry == item.name);
        const routeObj = routesList.find((item) => route == item.route);
        const date_in = new Date();

        if (!ferryObj || !routeObj) {
            return;
        }

        const boarding = await initBoarding(ferryObj.id, routeObj.id, date_in);

        if (boarding.success && boarding.continue) {
            Alert.alert(
                "Um embarque com esta balsa está em andamento",
                "Deseja continuar o embarque?",
                [
                    {
                        text: "Cancelar",
                        style: "cancel",
                        onPress: () => console.log("Cancelado"),
                    },
                    {
                        text: "Continuar",
                        onPress: () => {
                            router.push({
                                pathname: "/check-in",
                                params: {
                                    boarding_id: boarding.boarding_id,
                                },
                            });
                        },
                    },
                ],
                { cancelable: false }
            );
        } else if (boarding.success && !boarding.continue) {
            router.push({
                pathname: "/check-in",
                params: {
                    boarding_id: boarding.boarding_id,
                },
            });
        } else {
            Alert.alert(
                "Ocorreu um erro ao iniciar embarque.",
                boarding.message || "Tente novamente mais tarde."
            );
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <AppHeader title={"Embarque"} />

                <ScrollView style={styles.pageContainer}>
                    <Text style={styles.pageTitle}>Embarque</Text>

                    <View style={styles.formBody}>
                        <SelectInput
                            label="Balsa"
                            placeholder="Selecione uma balsa"
                            options={ferriesList.map((ferry) => ferry.name)}
                            value={ferry}
                            onChange={(value) => setFerrie(value)}
                        />

                        <SelectInput
                            label="Trecho"
                            placeholder="Selecione um trecho"
                            options={routesList.map((route) => route.route)}
                            value={route}
                            onChange={(value) => setRoute(value)}
                        />

                        <View style={styles.dateTime}>
                            <View style={{ flex: 1 }}>
                                <DateInput
                                    label="Data"
                                    value={date}
                                    onChange={(value) =>
                                        value && setDate(value)
                                    }
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <TimeInput
                                    label="Hora"
                                    value={time}
                                    onChange={(value) =>
                                        value && setTime(value)
                                    }
                                />
                            </View>
                        </View>

                        <SubmitButton
                            title="Iniciar embarque"
                            onPress={handleStartBoarding}
                        />
                    </View>
                </ScrollView>

                <BottomSheet
                    ref={boardingBottomSheet}
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
                        <Text style={styles.boardingTitle}>
                            CONFIRMAR EMBARQUE
                        </Text>

                        <View style={styles.boardingDetails}>
                            <BoardingDetailsItem
                                label={ferry || ""}
                                bold={true}
                                icon={<FerryIcon width={20} height={20} />}
                            />
                            <BoardingDetailsItem
                                label={`Saída: ${date.toLocaleDateString()}`}
                                icon={<CalendarIcon width={20} height={20} />}
                            />
                            <BoardingDetailsItem
                                label={time}
                                icon={<ClockIcon width={20} height={20} />}
                            />
                        </View>

                        <View style={styles.confirmBoarding}>
                            <View style={styles.confirmBoardingButton}>
                                <SubmitButton
                                    title="Não"
                                    style={{
                                        backgroundColor: "#E01507",
                                        paddingHorizontal: 40,
                                    }}
                                    onPress={() => closeBoardingBottomSheet()}
                                />
                            </View>

                            <View style={styles.confirmBoardingButton}>
                                <SubmitButton
                                    title="Sim"
                                    style={{
                                        backgroundColor: "#FFF",
                                        borderWidth: 1,
                                        borderColor: "#061949",
                                        paddingHorizontal: 40,
                                    }}
                                    textStyle={{
                                        color: "#061949",
                                    }}
                                    onPress={startBoarding}
                                />
                            </View>
                        </View>
                    </BottomSheetView>
                </BottomSheet>

                {loading && <LoadingScreen />}
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF",
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
    dateTime: {
        flexDirection: "row",
        gap: 16,
        marginBottom: 24,
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
    },
    boardingDetails: {
        gap: 6,
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
