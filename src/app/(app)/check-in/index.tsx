import AppHeader from "@components/AppHeader";
import BoardingHeader from "@components/BoardingHeader";
import { useLocalSearchParams } from "expo-router";
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    StyleSheet,
} from "react-native";

type PageProps = {
    ferry: string;
    date: string;
    time: string;
};

const Page = () => {
    const params: PageProps = useLocalSearchParams();

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <AppHeader title={"Embarque"} />
                <BoardingHeader
                    ferry={params.ferry}
                    date={params.date}
                    time={params.time}
                />
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
});
