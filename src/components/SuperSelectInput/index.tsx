import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import SearchIcon from "@assets/icons/super-select-search.svg";
import CloseIcon from "@assets/icons/close-modal.svg";
import AccordionArrow from "@assets/icons/accordion-arrow.svg";
import TextInput from "@components/TextInput";

type SelectItem = {
    id: number;
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
    const [modalVisible, setModalVisible] = useState(false);
    const [value, setValue] = useState<SelectItem | undefined>();
    const [currentAccordionType, setCurrentAccordionType] = useState<
        string | null
    >(null);
    const [searchText, setSearchText] = useState("");
    const [filteredData, setFilteredData] = useState(props.data);

    const filterTypes = (
        data: SelectCategory[],
        query: string
    ): SelectCategory[] => {
        const normalizedQuery = query.toLowerCase();

        return data
            .map((item) => {
                const typeMatch = item.type
                    .toLowerCase()
                    .includes(normalizedQuery);

                if (typeMatch) {
                    return item; // retorna tudo se o tipo bater
                }

                const filteredModels = item.models.filter((model) =>
                    model.name.toLowerCase().includes(normalizedQuery)
                );

                if (filteredModels.length > 0) {
                    return {
                        type: item.type,
                        models: filteredModels, // retorna só os models que bateram
                    };
                }

                return null; // nada encontrado
            })
            .filter(Boolean) as SelectCategory[]; // remove nulls
    };

    useEffect(() => {
        if (props.onChange) {
            props.onChange(value);
        }
    }, [value]);

    useEffect(() => {
        if (!searchText) {
            if (Array.isArray(props.data)) {
                setFilteredData(props.data);
            }
        } else {
            const filtered = filterTypes(props.data || [], searchText) || [];
            setFilteredData(filtered);

            if (filtered.length == 1) {
                setCurrentAccordionType(filtered[0].type);
            } else if (filtered.length > 1) {
                setCurrentAccordionType(null);
            }
        }
    }, [searchText, props.data]);

    useEffect(() => {
        setCurrentAccordionType(null);
    }, [modalVisible]);

    const handleSelect = (item: SelectItem) => {
        setValue(item);
        setModalVisible(false);
    };

    return (
        <View style={styles.inputWrapper}>
            <Text style={styles.label}>{props.label ? props.label : ""}</Text>
            <TouchableOpacity
                style={styles.selectButton}
                onPress={() => setModalVisible(true)}
            >
                <SearchIcon color="#4C596A" width={20} height={20} />
                <Text
                    style={[
                        styles.selectText,
                        !props.value && styles.selectPlaceholder,
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {props.value ? props.value.name : props.placeholder}
                </Text>
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalBody}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                        >
                            <CloseIcon color="#0D0D12" width={24} height={24} />
                        </TouchableOpacity>
                        <Text style={styles.modalHeaderTitle}>
                            {props.label}
                        </Text>
                    </View>
                    <View style={styles.searchContainer}>
                        <TextInput
                            type="text"
                            placeholder="Pesquisar"
                            prefix={
                                <SearchIcon
                                    color="#4C596A"
                                    width={20}
                                    height={20}
                                />
                            }
                            value={searchText}
                            onChange={(text) => setSearchText(text.toString())}
                        />
                    </View>
                    <View style={styles.categoriesContainer}>
                        {filteredData &&
                            filteredData.map((category, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => {
                                        if (
                                            category.models.length == 1 &&
                                            category.type ==
                                                category.models[0].name
                                        ) {
                                            handleSelect(category.models[0]);
                                        } else {
                                            setCurrentAccordionType((prev) =>
                                                prev == category.type
                                                    ? null
                                                    : category.type
                                            );
                                        }
                                    }}
                                    style={styles.accordionItem}
                                >
                                    <View style={styles.accordionTitle}>
                                        <Text style={styles.accordionTitleText}>
                                            {category.type}
                                        </Text>
                                        {category.models.length == 1 &&
                                        category.type ==
                                            category.models[0].name ? (
                                            <Text
                                                style={
                                                    styles.accordionOptionText
                                                }
                                            >
                                                {new Intl.NumberFormat(
                                                    "pt-BR",
                                                    {
                                                        style: "currency",
                                                        currency: "BRL",
                                                    }
                                                ).format(
                                                    category.models[0].value
                                                )}
                                            </Text>
                                        ) : (
                                            <View
                                                style={
                                                    currentAccordionType ==
                                                        category.type && {
                                                        transform:
                                                            "rotate(90deg)",
                                                    }
                                                }
                                            >
                                                <AccordionArrow
                                                    color="#666D80"
                                                    width={15}
                                                    height={15}
                                                />
                                            </View>
                                        )}
                                    </View>
                                    {(category.models.length != 1 ||
                                        category.type !=
                                            category.models[0].name) &&
                                        currentAccordionType ==
                                            category.type && (
                                            <View
                                                style={styles.accordionOptions}
                                            >
                                                {category.models.map(
                                                    (item, index) => (
                                                        <TouchableOpacity
                                                            key={index}
                                                            style={[
                                                                styles.accordionOption,
                                                                index ==
                                                                    category
                                                                        .models
                                                                        .length -
                                                                        1 && {
                                                                    borderBottomWidth: 0,
                                                                },
                                                            ]}
                                                            onPress={() =>
                                                                handleSelect(
                                                                    item
                                                                )
                                                            }
                                                        >
                                                            <Text
                                                                style={[
                                                                    styles.accordionOptionText,
                                                                    { flex: 1 },
                                                                ]}
                                                            >
                                                                {item.name}
                                                            </Text>
                                                            <Text
                                                                style={
                                                                    styles.accordionOptionText
                                                                }
                                                            >
                                                                {new Intl.NumberFormat(
                                                                    "pt-BR",
                                                                    {
                                                                        style: "currency",
                                                                        currency:
                                                                            "BRL",
                                                                    }
                                                                ).format(
                                                                    item.value
                                                                )}
                                                            </Text>
                                                        </TouchableOpacity>
                                                    )
                                                )}
                                            </View>
                                        )}
                                </TouchableOpacity>
                            ))}
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
        flex: 1,
        flexShrink: 1,
    },
    selectPlaceholder: {
        color: "#A4ACB9",
    },
    modalBody: {
        backgroundColor: "#fff",
        flex: 1,
    },
    modalHeader: {
        padding: 16,
        gap: 24,
        borderBottomWidth: 1,
        borderBottomColor: "#CCDEF0",
    },
    modalHeaderTitle: {
        color: "#212121",
        fontSize: 16,
        lineHeight: 28,
    },
    searchContainer: {
        padding: 16,
    },
    categoriesContainer: {},
    accordionItem: {
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#ABBED1",
    },
    accordionTitle: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
    },
    accordionTitleText: {
        fontSize: 16,
        fontWeight: 500,
    },
    accordionOptions: {},
    accordionOption: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#DFEBF7",
        flexDirection: "row",
        justifyContent: "space-between",
        flexWrap: "wrap",
    },
    accordionOptionText: {
        color: "#717171",
        fontSize: 14,
        flexShrink: 1,
    },
});
