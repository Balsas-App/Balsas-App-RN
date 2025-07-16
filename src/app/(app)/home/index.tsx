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
import { useState } from "react";
import DateInput from "@components/DateInput";
import TimeInput from "@components/TimeInput";
import SubmitButton from "@components/SubmitButton";

export default function Page() {
    const { authenticated, logout } = useAuth();
    const [ferrie, setFerrie] = useState<string | null>(null);
    const [segment, setSegment] = useState<string | null>(null);
    const [date, setDate] = useState(new Date());
    const [time, setTime] = useState("");

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

                        <SubmitButton title="Iniciar embarque" />
                    </View>
                </ScrollView>
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
});
