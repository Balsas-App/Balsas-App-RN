import { useAuth } from "@contexts/AuthContext";
import { Stack, useRouter } from "expo-router";
import React, { useLayoutEffect } from "react";

const RootLayout = () => {
    const { authenticated, isCheckingAuth } = useAuth();
    const router = useRouter();

    useLayoutEffect(() => {
        if (!isCheckingAuth && !authenticated) {
            router.replace("/login");
        }
    }, [authenticated, isCheckingAuth]);

    return (
        <React.Fragment>
            <Stack
                screenOptions={{
                    headerShown: false,
                }}
            />
        </React.Fragment>
    );
};

export default RootLayout;
