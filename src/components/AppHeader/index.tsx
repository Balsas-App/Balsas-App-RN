import { useApp } from "@contexts/AppContext";
import { AntDesign, Feather } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import React, { useRef } from "react";
import { View, StyleSheet, Image, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ComponentProps = {
    title: string;
    showBack?: boolean;
};

const Component = (props: ComponentProps) => {
    const { toggleMenu } = useApp();

    return (
        <SafeAreaView style={styles.header}>
            <>
                {/*
                Temporarily disabled
                <Image
                    source={require("@assets/images/login-background.png")}
                    style={styles.headerBackground}
                /> */}
                <View style={styles.headerContent}>
                    {props.showBack ? (
                        <TouchableOpacity
                            style={styles.bottomSheetsToggle}
                            onPress={() => router.back()}
                        >
                            <AntDesign
                                name="arrowleft"
                                size={24}
                                color="#fff"
                            />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={styles.bottomSheetsToggle}
                            onPress={toggleMenu}
                        >
                            <Feather name="menu" size={24} color="#fff" />
                        </TouchableOpacity>
                    )}

                    <Text style={styles.title}>{props.title}</Text>
                </View>
            </>
        </SafeAreaView>
    );
};

export default Component;

const styles = StyleSheet.create({
    header: {
        backgroundColor: "#061949",
        height: 120,
        overflow: "hidden",
        justifyContent: "center",
    },
    headerBackground: {
        position: "absolute",
        right: "-50%",
        top: -130,
    },
    headerContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingRight: 16,
    },
    bottomSheetsToggle: {
        padding: 16,
    },
    title: {
        fontSize: 14,
        fontWeight: 700,
        color: "#fff",
    },
    sheetContainer: {
        flex: 1,
        padding: 36,
        alignItems: "center",
    },
});
