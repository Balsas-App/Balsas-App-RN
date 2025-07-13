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
import { SafeAreaView } from "react-native-safe-area-context";
import AppHeader from "@components/AppHeader";
import { ScrollView } from "react-native-gesture-handler";
import SelectInput from "@components/SelectInput";

export default function Page() {
    const { authenticated, logout } = useAuth();

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
                        />
                    </View>
                </ScrollView>
                {authenticated ? <Text>Logado</Text> : <Text>Não logado</Text>}
                <TouchableOpacity onPress={async () => logout()}>
                    <Text>Deslogar</Text>
                </TouchableOpacity>
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
});
