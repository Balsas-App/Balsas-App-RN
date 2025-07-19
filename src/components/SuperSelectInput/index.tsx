import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import SearchIcon from "@assets/icons/super-select-search.svg";

type SelectItem = {
    name: string;
    value: number;
};

type SelectCategory = {
    type: string;
    models: SelectItem[];
};

type ComponentProps = {
    label?: string;
    placeholder?: string;
    onChange?: (value: SelectItem | undefined) => void;
    data: SelectCategory[];
    value?: SelectItem;
};

const Component = (props: ComponentProps) => {
    const [isFocused, setIsFocused] = useState(false);
    const [value, setValue] = useState<SelectItem | undefined>();

    useEffect(() => {
        if (props.onChange) {
            props.onChange(value);
        }
    }, [value]);

    return (
        <View style={styles.inputWrapper}>
            <Text style={styles.label}>{props.label ? props.label : ""}</Text>
            <TouchableOpacity style={styles.selectButton}>
                <SearchIcon color="#4C596A" width={20} height={20} />
                <Text
                    style={[
                        styles.selectText,
                        !props.value && styles.selectPlaceholder,
                    ]}
                >
                    {props.value ? props.value.name : props.placeholder}
                </Text>
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
    selectButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "#F8FAFB",
        borderWidth: 1,
        borderColor: "#DFE1E7",
        borderRadius: 8,
        height: 56,
        paddingHorizontal: 12,
    },
    selectText: {
        fontSize: 16,
        color: "#212121",
    },
    selectPlaceholder: {
        color: "#A4ACB9",
    },
});
