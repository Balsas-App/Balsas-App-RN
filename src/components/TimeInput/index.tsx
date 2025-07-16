import { Entypo } from "@expo/vector-icons";
import RNDateTimePicker, {
    DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    TouchableWithoutFeedback,
    TouchableNativeFeedback,
} from "react-native";

import DateIcon from "@assets/icons/date-input.svg";
import { formatDate, formatTime, timeToDate } from "../../utils/date";

type ComponentProps = {
    label?: string;
    value?: string;
    onChange?: (value: string | null) => void;
};

const Component = (props: ComponentProps) => {
    const [value, setValue] = useState<Date>(
        timeToDate(props.value || formatTime(new Date()))
    );

    useEffect(() => {
        if (props.onChange) props.onChange(formatTime(value));
    }, [value]);

    return (
        <View style={styles.inputWrapper}>
            <Text style={styles.label}>{props.label ? props.label : ""}</Text>

            <TouchableOpacity
                style={styles.inputContainer}
                onPress={() =>
                    DateTimePickerAndroid.open({
                        value: value,
                        onChange: (_e, date) => {
                            date && setValue(date);
                        },
                        mode: "time",
                        is24Hour: true,
                    })
                }
            >
                <Text style={styles.value}>{formatTime(value)}</Text>
            </TouchableOpacity>
        </View>
    );
};

export default Component;

const styles = StyleSheet.create({
    inputWrapper: {
        gap: 6,
    },
    label: {
        fontSize: 14,
        color: "#0D0D12",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 14,
        height: 56,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "rgba(193, 199, 208, 1)",
        backgroundColor: "rgba(248, 250, 251, 1)",
        width: "100%",
    },
    placeholder: {
        color: "rgba(129, 136, 152, 1)",
        fontSize: 16,
    },
    value: {
        color: "rgba(10, 27, 34, 1)",
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "white",
        borderRadius: 4,
        minWidth: "90%",
        elevation: 10, // sombra Android
        shadowColor: "#000", // sombra iOS
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        paddingVertical: 16,
    },
    option: {
        paddingHorizontal: 40,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBlockColor: "rgba(233, 236, 242, 1)",
    },
    optionText: {
        fontSize: 16,
    },
});
