import { View, StyleSheet, Text } from "react-native";
import { CheckinInfos } from "@type/checkins";

type HeaderContent = {
    col1: string;
    col2: string;
    col3: string;
    col4: string;
};

type ComponentProps = {
    checkin: CheckinInfos | HeaderContent;
    showReason?: boolean;
    isHeader?: boolean;
    isFooter?: boolean;
};

const Component = (props: ComponentProps) => {
    return (
        <View
            style={[
                styles.container,
                !props.isHeader && {
                    paddingHorizontal: 0,
                    marginHorizontal: 0,
                },
            ]}
        >
            <View style={[styles.column, { width: "20%" }]}>
                <Text
                    style={[
                        styles.content,
                        props.isHeader && styles.contentHeader,
                        props.isFooter && styles.contentFooter,
                    ]}
                >
                    {"plate" in props.checkin
                        ? props.checkin.plate
                        : props.checkin.col1}
                </Text>
            </View>
            <View style={[styles.column, { width: "46%" }]}>
                <Text
                    style={[
                        styles.content,
                        props.isHeader && styles.contentHeader,
                        props.isFooter && styles.contentFooter,
                    ]}
                >
                    {"vehicle_name" in props.checkin
                        ? props.checkin.vehicle_name
                        : props.checkin.col2}
                </Text>
            </View>
            <View style={[styles.column, { width: "10%" }]}>
                <Text
                    style={[
                        styles.content,
                        { textAlign: "center" },
                        props.isHeader && styles.contentHeader,
                        props.isFooter && styles.contentFooter,
                    ]}
                >
                    {"pax" in props.checkin
                        ? props.checkin.pax
                        : props.checkin.col3}
                </Text>
            </View>
            <View style={[styles.column, { width: "24%" }]}>
                <Text
                    style={[
                        styles.content,
                        { textAlign: "right" },
                        props.isHeader && styles.contentHeader,
                        props.isFooter && styles.contentFooter,
                    ]}
                    numberOfLines={1}
                >
                    {"value" in props.checkin
                        ? new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                          }).format(props.checkin.value)
                        : props.checkin.col4}
                </Text>
            </View>

            {!!props.showReason &&
                !props.isHeader &&
                !props.isFooter &&
                "add_value_reason" in props.checkin && (
                    <Text style={styles.addValueDescription}>
                        {props.checkin.add_value_reason}
                    </Text>
                )}
        </View>
    );
};

export default Component;

const styles = StyleSheet.create({
    container: {
        paddingVertical: 4,
        gap: 0,
        flexDirection: "row",
        paddingHorizontal: 0,
        flexWrap: "wrap",
    },
    column: {},
    content: {
        color: "#212121",
        fontSize: 18,
    },
    contentHeader: {
        fontWeight: 500,
        fontSize: 20,
        paddingBottom: 4,
    },
    contentFooter: {
        fontWeight: 500,
        paddingVertical: 4,
    },
    addValueDescription: {
        fontSize: 16,
        color: "#212121",
        marginTop: 3,
    },
});
