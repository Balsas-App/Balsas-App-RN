import { AppProvider } from "@contexts/AppContext";
import { AuthProvider } from "@contexts/AuthContext";
import { PrinterProvider } from "@contexts/PrinterContext";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const RootLayout = () => {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <PrinterProvider>
                <AuthProvider>
                    <AppProvider>
                        <React.Fragment>
                            <StatusBar style="light" />
                            <Stack
                                screenOptions={{
                                    headerShown: false,
                                }}
                            />
                        </React.Fragment>
                    </AppProvider>
                </AuthProvider>
            </PrinterProvider>
        </GestureHandlerRootView>
    );
};

export default RootLayout;
