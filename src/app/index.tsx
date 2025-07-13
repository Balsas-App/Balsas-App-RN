import { Link, Redirect, useNavigation } from "expo-router";
import { useLayoutEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Logo from "@assets/images/logo.svg";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "@contexts/AuthContext";

export default function Page() {
    const navigation = useNavigation();

    const { isCheckingAuth, authenticated } = useAuth();

    useLayoutEffect(() => {
        navigation.setOptions({
            tabBarStyle: { display: "none" }, // oculta a tab
        });
    }, [navigation]);

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <Logo width={120} height={120} />

            {!isCheckingAuth && authenticated ? (
                <Redirect href={"/home"} />
            ) : (
                <Redirect href={"/login"} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "rgba(50, 107, 254, 1)",
        alignItems: "center",
        justifyContent: "center",
    },
});
