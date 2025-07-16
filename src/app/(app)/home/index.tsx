import {
    StyleSheet,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
    Keyboard,
    Platform,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useAuth } from "@contexts/AuthContext";
import AppHeader from "@components/AppHeader";
import { ScrollView } from "react-native-gesture-handler";
import SelectInput from "@components/SelectInput";
import { useRef, useState } from "react";
import DateInput from "@components/DateInput";
import TimeInput from "@components/TimeInput";
import SubmitButton from "@components/SubmitButton";
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetView,
} from "@gorhom/bottom-sheet";
import Toast from "react-native-toast-message";

export default function Page() {
    const boardingBottomSheet = useRef<BottomSheet>(null);
    const [isBottomSheetOpen, setBottomSheetOpen] = useState(false);
    const { authenticated, logout } = useAuth();
    const [ferrie, setFerrie] = useState<string | null>(null);
    const [segment, setSegment] = useState<string | null>(null);
    const [date, setDate] = useState(new Date());
    const [time, setTime] = useState("");

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
        setBottomSheetOpen(true);
    };

    const closeBoardingBottomSheet = () => {
        boardingBottomSheet.current?.close();
        setBottomSheetOpen(false);
    };

    const handleStartBoarding = () => {
        if (!ferrie) {
            Toast.show({
                type: "error",
                text1: "Selecione uma balsa.",
                position: "top",
                topOffset: 100,
            });
            return;
        }

        if (!segment) {
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
                            options={["balsa 1", "balsa 2"]}
                            value={ferrie}
                            onChange={(value) => setFerrie(value)}
                        />

                        <SelectInput
                            label="Trecho"
                            placeholder="Selecione um trecho"
                            options={["Ceasa - Careiro", "Careiro -  Ceasa"]}
                            value={segment}
                            onChange={(value) => setSegment(value)}
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
                    onClose={() => setBottomSheetOpen(false)}
                    backdropComponent={renderBackdrop}
                >
                    <BottomSheetView style={styles.sheetContainer}>
                        <Text style={styles.boardingTitle}>
                            CONFIRMAR EMBARQUE
                        </Text>
                    </BottomSheetView>
                </BottomSheet>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
}

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
    },
});
