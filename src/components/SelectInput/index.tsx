import { Entypo } from "@expo/vector-icons";
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

type ComponentProps = {
    label?: string;
    placeholder?: string;
    value?: string | null;
    options: string[];
    onChange?: (value: string) => void;
};

const Component = (props: ComponentProps) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [value, setValue] = useState(props.value ? props.value : "");

    useEffect(() => {
        setModalVisible(false);
        if (props.onChange) props.onChange(value);
    }, [value]);

    return (
        <View style={styles.inputWrapper}>
            <Text style={styles.label}>{props.label ? props.label : ""}</Text>

            <TouchableOpacity
                style={styles.inputContainer}
                onPress={() => setModalVisible(true)}
            >
                {value ? (
                    <Text style={styles.value}>{value}</Text>
                ) : (
                    <Text style={styles.placeholder}>{props.placeholder}</Text>
                )}
                <Entypo
                    name="chevron-thin-down"
                    size={20}
                    color="rgba(102, 109, 128, 1)"
                />
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableWithoutFeedback
                    onPress={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback onPress={() => {}}>
                            <View style={styles.modalContent}>
                                {props.options.map((option, index) => (
                                    <TouchableNativeFeedback
                                        key={index}
                                        background={TouchableNativeFeedback.Ripple(
                                            "rgba(0,0,0,0.2)",
                                            false
                                        )}
                                        onPress={() => setValue(option)}
                                    >
                                        <View
                                            style={[
                                                styles.option,
                                                index ==
                                                    props.options.length -
                                                        1 && {
                                                    borderBottomWidth: 0,
                                                }, // Sem borda no ultimo item
                                            ]}
                                        >
                                            <Text style={styles.optionText}>
                                                {option}
                                            </Text>
                                        </View>
                                    </TouchableNativeFeedback>
                                ))}
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
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
