import { View, StyleSheet, Text } from "react-native";
import FerryIcon from "@assets/icons/ferry-detail.svg";
import CalendarIcon from "@assets/icons/calendar-detail.svg";
import ClockIcon from "@assets/icons/time-detail.svg";

type ComponentProps = {
    ferry: string;
    date: Date;
};

const Component = (props: ComponentProps) => {
    const date = new Date(props.date);

    return (
        <View style={styles.container}>
            <View style={styles.ferryName}>
                <FerryIcon width={32} height={32} color="#212121" />
                <Text style={styles.ferryNameText}>{props.ferry}</Text>
            </View>
            <View style={styles.infos}>
                <View style={styles.infoItem}>
                    <CalendarIcon width={32} height={32} color="#717171" />
                    <Text style={styles.infoItemText}>
                        {date.toLocaleDateString()}
                    </Text>
                </View>
                <View style={styles.infoItem}>
                    <ClockIcon width={32} height={32} color="#717171" />
                    <Text style={styles.infoItemText}>
                        {date.toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                        })}
                    </Text>
                </View>
            </View>
        </View>
    );
};

export default Component;

const styles = StyleSheet.create({
    container: {
        padding: 16,
        paddingHorizontal: 0,
        borderBottomWidth: 1,
        borderBottomColor: "#ABBED1",
        gap: 12,
    },
    ferryName: {
        flexDirection: "row",
        gap: 8,
        alignItems: "center",
    },
    ferryNameText: {
        fontWeight: "bold",
        fontSize: 18,
        color: "#212121",
    },
    infos: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    infoItem: {
        flexDirection: "row",
        gap: 8,
        alignItems: "center",
    },
    infoItemText: {
        fontSize: 18,
        color: "#717171",
    },
});
