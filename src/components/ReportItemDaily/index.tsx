import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import ReportIcon from "@assets/icons/report.svg";
import { Boarding } from "@type/boardings";
import { formatDateLabel } from "../../utils/date";
import { router } from "expo-router";

type ComponentProps = {
    boarding: Boarding;
};

const Component = (props: ComponentProps) => {
    const agentData =
        typeof props.boarding.agent_data == "string"
            ? JSON.parse(props.boarding.agent_data)
            : props.boarding.agent_data;

    const handleGoToDetails = () => {
        router.push({
            pathname: "/boarding-details",
            params: {
                boarding_id: props.boarding.boarding_id,
                from: "reports",
            },
        });
    };

    return (
        <TouchableOpacity style={styles.container} onPress={handleGoToDetails}>
            <View style={styles.header}>
                <ReportIcon color="#000" />
                <Text style={styles.ferryName}>
                    {props.boarding.ferry_name}
                </Text>
                <Text style={styles.day}>
                    {formatDateLabel(props.boarding.time_in)}
                </Text>
            </View>
            <View style={styles.infos}>
                <Text style={styles.infoText}>{props.boarding.route_name}</Text>
                <Text style={styles.infoText}>
                    {new Date(props.boarding.time_in).toLocaleTimeString(
                        "pt-BR",
                        {
                            hour: "2-digit",
                            minute: "2-digit",
                        }
                    )}
                </Text>
            </View>
            <View style={styles.infos}>
                <Text style={styles.infoText}>{agentData.name}</Text>
            </View>
        </TouchableOpacity>
    );
};

export default Component;

const styles = StyleSheet.create({
    container: {
        padding: 16,
        gap: 4,
        borderBottomWidth: 1,
        borderBottomColor: "#ABBED1",
    },
    header: {
        flexDirection: "row",
        gap: 16,
        alignItems: "center",
    },
    ferryName: {
        fontSize: 14,
        fontWeight: 500,
        color: "#212121",
        flex: 1,
    },
    day: {
        fontSize: 14,
        color: "#717171",
    },
    infos: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 16,
        alignItems: "center",
        paddingLeft: 38,
    },
    infoText: {
        fontSize: 12,
        fontWeight: 500,
        color: "#4D4D4D",
    },
});
