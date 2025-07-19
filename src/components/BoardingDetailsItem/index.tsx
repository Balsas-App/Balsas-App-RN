import { StyleSheet, View, Text } from "react-native";

type BoardingDetailsItemProps = {
    icon?: React.ReactNode;
    label: string;
    bold?: boolean;
};

const BoardingDetailsItem = (props: BoardingDetailsItemProps) => {
    return (
        <View style={styles.boardingDetailsItem}>
            {props.icon}
            <Text
                style={[
                    styles.boardingDetailsItemText,
                    props?.bold && { fontWeight: "bold" },
                ]}
            >
                {props.label}
            </Text>
        </View>
    );
};

export default BoardingDetailsItem;

const styles = StyleSheet.create({
    boardingDetailsItem: {
        flexDirection: "row",
        gap: 8,
        alignItems: "center",
    },
    boardingDetailsItemText: {
        fontSize: 15,
        color: "#717171",
    },
});
