import {
    StyleSheet,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
    Keyboard,
    Platform,
    TouchableOpacity,
    View,
    Text,
    Modal,
} from "react-native";
import AppHeader from "@components/AppHeader";
import { ScrollView } from "react-native-gesture-handler";
import { useEffect, useState } from "react";
import LoadingScreen from "@components/LoadingScreen";
import ReportItemDaily from "@components/ReportItemDaily";
import { getBoardings } from "@services/boarding";
import { Boarding } from "@type/boardings";

import CloseModal from "@assets/icons/close-modal.svg";
import CalendarIcon from "@assets/icons/calendar-detail.svg";
import ArrowRight from "@assets/icons/accordion-arrow.svg";
import DateInput from "@components/DateInput";
import { formatDateLabel } from "../../../utils/date";

export default function Page() {
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<1 | 7>(1);
    const [data, setData] = useState<Boarding[]>([]);
    const [individualDate, setIndividualDate] = useState(new Date());
    const [availableDates, setAvailableDates] = useState<string[]>([]);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        const loadPageData = async () => {
            try {
                const today = new Date();
                const sevenDaysBefore = new Date(today);
                sevenDaysBefore.setDate(today.getDate() - 7);

                const reportsData = await getBoardings(
                    sevenDaysBefore,
                    today,
                    true
                );
                setData(reportsData);

                const uniqueDatesSet = new Set(
                    reportsData.map((item) => item.time_in.split(" ")[0])
                );
                const uniqueDates = Array.from(uniqueDatesSet).map(
                    (date) => `${date} 00:00:00`
                );
                setAvailableDates(uniqueDates);
                setLoading(false);
            } catch (err) {
                console.error("Erro ao carregar dados", err);
            }
        };

        setLoading(true);
        loadPageData();
    }, []);

    const openModalOnDate = (date: string) => {
        setModalVisible(true);
        setIndividualDate(new Date(date));
    };

    const today = new Date().toISOString().split("T")[0];

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <AppHeader title={"Relatórios"} showBack />

                <View style={styles.tabs}>
                    <TouchableOpacity
                        style={[
                            styles.tabOption,
                            mode === 1 && styles.tabOptionSelected,
                        ]}
                        onPress={() => setMode(1)}
                    >
                        <Text style={styles.tabOptionText}>
                            Relatórios do dia
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.tabOption,
                            mode === 7 && styles.tabOptionSelected,
                        ]}
                        onPress={() => setMode(7)}
                    >
                        <Text style={styles.tabOptionText}>
                            Relatórios da semana
                        </Text>
                    </TouchableOpacity>
                </View>
                {mode === 1 && data.length ? (
                    <ScrollView style={styles.pageContainer}>
                        {data
                            .filter((item) => item.time_in.startsWith(today))
                            .map((item, key) => (
                                <ReportItemDaily key={key} boarding={item} />
                            ))}
                    </ScrollView>
                ) : (
                    <ScrollView style={styles.pageContainer}>
                        {availableDates.length > 0 &&
                            availableDates.map((date, key) => (
                                <TouchableOpacity
                                    key={key}
                                    style={styles.dateOption}
                                    onPress={() => openModalOnDate(date)}
                                >
                                    <CalendarIcon
                                        width={24}
                                        height={24}
                                        color="#1A1A1A"
                                    />
                                    <Text style={styles.dateOptionText}>
                                        {formatDateLabel(date)}
                                    </Text>
                                    <ArrowRight color="#666D80" />
                                </TouchableOpacity>
                            ))}
                    </ScrollView>
                )}

                <Modal
                    style={styles.modal}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalHeader}>
                        <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                        >
                            <CloseModal />
                        </TouchableOpacity>
                        <DateInput
                            value={individualDate}
                            onChange={(value) =>
                                value && setIndividualDate(value)
                            }
                        />
                    </View>
                    <ScrollView style={styles.pageContainer}>
                        {data
                            .filter((item) =>
                                item.time_in.startsWith(
                                    individualDate.toISOString().split("T")[0]
                                )
                            )
                            .map((item, key) => (
                                <ReportItemDaily key={key} boarding={item} />
                            ))}
                    </ScrollView>
                </Modal>

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
    modal: {
        backgroundColor: "#fff",
        position: "absolute",
        left: 0,
        top: 0,
        width: "100%",
        height: "100%",
    },
    modalHeader: {
        padding: 16,
    },
    dateOption: {
        paddingHorizontal: 16,
        paddingVertical: 24,
        borderBottomWidth: 1,
        borderBottomColor: "#ABBED1",
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    dateOptionText: {
        fontWeight: 500,
        fontSize: 16,
        flex: 1,
    },
});
