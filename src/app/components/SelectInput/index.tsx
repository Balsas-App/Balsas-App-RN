import { Entypo } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Button,
} from "react-native";

type ComponentProps = {
    label?: string;
    placeholder?: string;
    onChange?: (value: string) => void;
};

const Component = (props: ComponentProps) => {
    const [modalVisible, setModalVisible] = useState(false);

    return (
        <View style={styles.inputWrapper}>
            <Text style={styles.label}>{props.label ? props.label : ""}</Text>

            <TouchableOpacity
                style={styles.inputContainer}
                onPress={() => setModalVisible(true)}
            >
                <Text style={styles.placeholder}>{props.placeholder}</Text>
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
                onRequestClose={() => setModalVisible(false)} // Android: botão voltar
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text>Esse é o modal nativo 🧱</Text>
                        <Button
                            title="Fechar"
                            onPress={() => setModalVisible(false)}
                        />
                    </View>
                </View>
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
        height: 48,
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
    },
});
