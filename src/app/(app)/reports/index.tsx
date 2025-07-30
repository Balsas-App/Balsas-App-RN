import {
    StyleSheet,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
    Keyboard,
    Platform,
    TouchableOpacity,
    View,
    Text,
} from "react-native";
import AppHeader from "@components/AppHeader";
import { ScrollView } from "react-native-gesture-handler";
import { useEffect, useState } from "react";
import LoadingScreen from "@components/LoadingScreen";

export default function Page() {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadPageData = async () => {
            setLoading(true);
            try {
            } catch (err) {
                console.error("Erro ao carregar dados", err);
            } finally {
                setLoading(false);
            }
        };

        loadPageData();
    }, []);

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <AppHeader title={"Relatórios"} showBack />

                <View style={styles.tabs}>
                    <TouchableOpacity
                        style={[styles.tabOption, styles.tabOptionSelected]}
                    >
                        <Text style={styles.tabOptionText}>
                            Relatórios do dia
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.tabOption]}>
                        <Text style={styles.tabOptionText}>
                            Relatórios da semana
                        </Text>
                    </TouchableOpacity>
                </View>
                <ScrollView style={styles.pageContainer}></ScrollView>

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
    tabs: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#ABBED1",
    },
    tabOption: {
        flex: 1,
        padding: 16,
        opacity: 0.3,
    },
    tabOptionSelected: {
        opacity: 1,
    },
    tabOptionText: {
        fontSize: 16,
        color: "#212121",
        textAlign: "center",
        fontWeight: 600,
    },
});
