import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import { Shadow } from "react-native-shadow-2";
import ShowPasswordIcon from "@assets/icons/show-password.svg";
import HidePasswordIcon from "@assets/icons/hide-password.svg";

type InputProps = {
    label?: string;
    type: "text" | "password";
    placeholder?: string;
    onChange?: (value: string) => void;
    onBlur?: () => void;
    onFocus?: () => void;
    value?: string;
    icon?: React.ReactNode;
};

const LoginInput = (props: InputProps) => {
    const [isFocused, setIsFocused] = useState(false);
    const [value, setValue] = useState(props.value ? props.value : "");
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (props.onChange) {
            props.onChange(value);
        }
    }, [value]);

    return (
        <View style={styles.inputWrapper}>
            <Text style={styles.label}>{props.label ? props.label : ""}</Text>

            <Shadow
                distance={isFocused ? 8 : 0}
                startColor={
                    isFocused
                        ? "rgba(1, 119, 251, 0.05)"
                        : "rgba(1, 119, 251, 0)"
                }
                offset={[0, 0]}
                // Remove radius se der erro
                containerStyle={{ borderRadius: 8 }}
            >
                <View
                    style={[
                        styles.inputContainer,
                        isFocused && {
                            borderColor: "rgba(63, 161, 252, 1)",
                        },
                    ]}
                >
                    {props.icon}
                    <TextInput
                        style={styles.input}
                        placeholder={props.placeholder ? props.placeholder : ""}
                        placeholderTextColor="rgba(164, 172, 185, 1)"
                        onFocus={() => {
                            if (props.onFocus) props.onFocus();
                            setIsFocused(true);
                        }}
                        onBlur={() => {
                            if (props.onBlur) props.onBlur();
                            setIsFocused(false);
                        }}
                        onChangeText={(text) => setValue(text)}
                        secureTextEntry={
                            props.type == "password"
                                ? showPassword
                                    ? false
                                    : true
                                : false
                        }
                    />
                    {props.type == "password" && (
                        <TouchableOpacity
                            onPress={() => setShowPassword((prev) => !prev)}
                        >
                            {showPassword ? (
                                <HidePasswordIcon />
                            ) : (
                                <ShowPasswordIcon />
                            )}
                        </TouchableOpacity>
                    )}
                </View>
            </Shadow>
        </View>
    );
};

export default LoginInput;

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
        paddingHorizontal: 14,
        height: 48,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "rgba(193, 199, 208, 1)",
        backgroundColor: "rgba(248, 250, 251, 1)",
        width: "100%",
    },
    input: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
        color: "#000",
    },
});
