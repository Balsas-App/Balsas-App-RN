import React from "react";
import { View, StyleSheet, Text, TouchableOpacity, Alert } from "react-native";

import MenuIconShip from "@assets/icons/menu-item-ship.svg";
import MenuIconClock from "@assets/icons/menu-item-clock.svg";
import MenuIconReports from "@assets/icons/menu-item-reports.svg";
import MenuIconLogout from "@assets/icons/menu-item-logout.svg";
import { AntDesign, Entypo } from "@expo/vector-icons";
import { useAuth } from "@contexts/AuthContext";
import { useApp } from "@contexts/AppContext";
import { useRouter } from "expo-router";
import { usePrinter } from "@contexts/PrinterContext";

type ComponentProps = {};

const Component = (props: ComponentProps) => {
    const { closeMenu } = useApp();
    const { logout } = useAuth();
    const router = useRouter();
    const { openPrinterList } = usePrinter();

    const handleLogout = () => {
        Alert.alert(
            "Deseja mesmo sair?",
            "Você será deslogado do aplicativo.",
            [
                {
                    text: "Cancelar",
                    style: "cancel",
                },
                {
                    text: "Sim",
                    onPress: async () => {
                        await logout();
                        closeMenu();
                    },
                },
            ],
            { cancelable: true }
        );
    };

    const goTo = (route: string) => {
        closeMenu();
        router.push(route);
    };

    return (
        <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem}>
                <MenuIconShip />
                <Text style={styles.menuItemText}>Balsas</Text>
                <Entypo
                    name="chevron-thin-right"
                    size={20}
                    color="rgba(128, 140, 149, 1)"
                />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
                <MenuIconClock />
                <Text style={styles.menuItemText}>Horários</Text>
                <Entypo
                    name="chevron-thin-right"
                    size={20}
                    color="rgba(128, 140, 149, 1)"
                />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
                <MenuIconReports />
                <Text style={styles.menuItemText}>Relatórios</Text>
                <Entypo
                    name="chevron-thin-right"
                    size={20}
                    color="rgba(128, 140, 149, 1)"
                />
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                    closeMenu();
                    openPrinterList();
                }}
            >
                <AntDesign name="printer" size={24} color="#061949" />
                <Text style={styles.menuItemText}>Impressoras</Text>
                <Entypo
                    name="chevron-thin-right"
                    size={20}
                    color="rgba(128, 140, 149, 1)"
                />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                <MenuIconLogout color="#061949" />
                <Text style={styles.menuItemText}>Sair</Text>
            </TouchableOpacity>
        </View>
    );
};

export default Component;

const styles = StyleSheet.create({
    menuContainer: {},
    menuItem: {
        flexDirection: "row",
        width: "100%",
        gap: 12,
        alignItems: "center",
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(223, 225, 231, 1)",
    },
    menuItemText: {
        flex: 1,
    },
});
