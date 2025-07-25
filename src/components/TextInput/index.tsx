import React, { useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { Shadow } from "react-native-shadow-2";

type BaseInput = {
    label?: string;
    placeholder?: string;
    onChange?: (value: string | number) => void;
    onBlur?: () => void;
    onFocus?: () => void;
    prefix?: React.ReactNode;
    sufix?: React.ReactNode;
    disabled?: boolean;
    numberOfLines?: number;
    uppercase?: boolean;
};

type ComponentProps =
    | (BaseInput & { type: "text" | "textarea" | "money"; value?: string })
    | (BaseInput & { type: "number"; value?: number });

const Component = (props: ComponentProps) => {
    const [isFocused, setIsFocused] = useState(false);
    const [value, setValue] = useState<number | string>(
        props.value ? props.value : ""
    );

    useEffect(() => {
        if (props.value) {
            setValue(props.value);
        }
    }, [props.value]);

    function formatMoney(value: string): string {
        const digits = value.replace(/\D/g, "");

        // Se não tem dígitos, retorna vazio ou 0,00
        if (digits.length === 0) {
            return "";
        }

        // Converte os últimos dois dígitos em centavos
        const numberValue = parseInt(digits, 10);

        // Divide por 100 para formar o valor real com centavos
        const reais = Math.floor(numberValue / 100);
        const cents = numberValue % 100;

        // Formata reais com ponto como separador de milhar
        const formatted = reais
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ".");

        // Centavos com dois dígitos
        const formatedCents = cents.toString().padStart(2, "0");

        return `${formatted},${formatedCents}`;
    }

    useEffect(() => {
        if (props.onChange) {
            props.onChange(value);
        }
    }, [value]);

    return (
        <View style={styles.inputWrapper}>
            {props.label && <Text style={styles.label}>{props.label}</Text>}

            <Shadow
                distance={isFocused ? 8 : 0}
                startColor={
                    isFocused
                        ? "rgba(1, 119, 251, 0.05)"
                        : "rgba(1, 119, 251, 0)"
                }
                offset={[0, 0]}
                containerStyle={{ borderRadius: 8 }}
            >
                <View
                    style={[
                        styles.inputContainer,
                        isFocused && {
                            borderColor: "rgba(63, 161, 252, 1)",
                        },
                        props.disabled && {
                            backgroundColor: "#F0F2F4",
                        },
                    ]}
                >
                    {props.prefix}
                    <TextInput
                        style={styles.input}
                        placeholder={props.placeholder ? props.placeholder : ""}
                        placeholderTextColor="#A4ACB9"
                        value={
                            value !== undefined
                                ? props.uppercase
                                    ? value.toString().toUpperCase()
                                    : value.toString()
                                : ""
                        }
                        onFocus={() => {
                            if (props.onFocus) props.onFocus();
                            setIsFocused(true);
                        }}
                        onBlur={() => {
                            if (props.onBlur) props.onBlur();
                            setIsFocused(false);
                        }}
                        onChangeText={(text) => {
                            setValue(
                                props.type == "number"
                                    ? text.replace(/[^0-9]/g, "")
                                    : props.type == "money"
                                    ? formatMoney(text)
                                    : text
                            );
                        }}
                        keyboardType={
                            props.type == "number" || props.type == "money"
                                ? "numeric"
                                : "default"
                        }
                        editable={!props.disabled}
                        multiline={props.type == "textarea"}
                        numberOfLines={props.numberOfLines}
                    />
                    {props.sufix}
                </View>
            </Shadow>
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
        paddingHorizontal: 12,
        height: 56,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "rgba(193, 199, 208, 1)",
        backgroundColor: "rgba(248, 250, 251, 1)",
        width: "100%",
        gap: 8,
    },
    prefixOrSufix: {},
    input: {
        flex: 1,
        fontSize: 16,
        color: "#000",
    },
});
