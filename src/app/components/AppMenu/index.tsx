import React from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";

import MenuIconShip from "@assets/icons/menu-item-ship.svg";
import MenuIconClock from "@assets/icons/menu-item-clock.svg";
import MenuIconReports from "@assets/icons/menu-item-reports.svg";
import { Entypo } from "@expo/vector-icons";

type ComponentProps = {};

const Component = (props: ComponentProps) => {
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
