import AppMenu from "@components/AppMenu";
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetView,
} from "@gorhom/bottom-sheet";
import { BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import React, {
    createContext,
    useContext,
    ReactNode,
    useRef,
    useState,
} from "react";
import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    View,
} from "react-native";
import Toast, { BaseToastProps, ErrorToast } from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";

import ToastErrorIcon from "@assets/icons/toast-error.svg";
import ToastWarningIcon from "@assets/icons/toast-warning.svg";
import ToastSuccessIcon from "@assets/icons/toast-success.svg";

type AppContextType = {
    menuBottomSheet: React.RefObject<BottomSheetMethods | null>;
    toggleMenu: () => void;
    closeMenu: () => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

type AppProviderProps = {
    children: ReactNode;
};

export const AppProvider = ({ children }: AppProviderProps) => {
    const [isBottomSheetOpen, setBottomSheetOpen] = useState(false);
    const menuBottomSheet = useRef<BottomSheet>(null);

    const toggleMenu = () => {
        if (isBottomSheetOpen) {
            menuBottomSheet.current?.close();
        } else {
            menuBottomSheet.current?.snapToIndex(0); // ou outro snapPoint
        }
        setBottomSheetOpen(!isBottomSheetOpen);
    };

    const closeMenu = () => {
        menuBottomSheet.current?.close();
        setBottomSheetOpen(!isBottomSheetOpen);
    };

    const CustomErrorToast = ({ text1, text2, ...rest }: BaseToastProps) => (
        <View style={styles.toastContainer}>
            <ToastErrorIcon />
            <View style={styles.toastTextContainer}>
                {text1 ? <Text style={styles.toastText1}>{text1}</Text> : null}
                {text2 ? <Text style={styles.toastText2}>{text2}</Text> : null}
            </View>
        </View>
    );
    const CustomSuccessToast = ({ text1, text2, ...rest }: BaseToastProps) => (
        <View style={styles.toastContainer}>
            <ToastSuccessIcon />
            <View style={styles.toastTextContainer}>
                {text1 ? <Text style={styles.toastText1}>{text1}</Text> : null}
                {text2 ? <Text style={styles.toastText2}>{text2}</Text> : null}
            </View>
        </View>
    );
    const CustomWarningToast = ({ text1, text2, ...rest }: BaseToastProps) => (
        <View style={styles.toastContainer}>
            <ToastWarningIcon />
            <View style={styles.toastTextContainer}>
                {text1 ? <Text style={styles.toastText1}>{text1}</Text> : null}
                {text2 ? <Text style={styles.toastText2}>{text2}</Text> : null}
            </View>
        </View>
    );

    const renderBackdrop = (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
            {...props}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
            pressBehavior="close" // fecha ao clicar no backdrop
        />
    );

    return (
        <AppContext.Provider
            value={{
                menuBottomSheet,
                toggleMenu,
                closeMenu,
            }}
        >
            <SafeAreaView style={styles.appView}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    enabled
                    keyboardVerticalOffset={Platform.select({
                        ios: 80,
                        android: 500,
                    })}
                >
                    {children}
                </KeyboardAvoidingView>

                <BottomSheet
                    ref={menuBottomSheet}
                    backgroundStyle={{
                        borderTopLeftRadius: 16,
                        borderTopRightRadius: 16,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 10 },
                        shadowOpacity: 1,
                        shadowRadius: 50,
                        elevation: 50,
                    }}
                    enablePanDownToClose={true}
                    index={-1}
                    onClose={() => setBottomSheetOpen(false)}
                    backdropComponent={renderBackdrop}
                >
                    <BottomSheetView style={styles.sheetContainer}>
                        <SafeAreaView
                            style={styles.sheetSafeView}
                            edges={["left", "right", "bottom"]}
                        >
                            <AppMenu />
                        </SafeAreaView>
                    </BottomSheetView>
                </BottomSheet>
                <Toast
                    config={{
                        error: (props) => <CustomErrorToast {...props} />,
                        success: (props) => <CustomSuccessToast {...props} />,
                        info: (props) => <CustomWarningToast {...props} />,
                    }}
                />
            </SafeAreaView>
        </AppContext.Provider>
    );
};

const styles = StyleSheet.create({
    appView: {
        flex: 1,
        backgroundColor: "#061949",
    },
    sheetContainer: {
        flex: 1,
        padding: 12,
        paddingBottom: 24,
        alignItems: "center",
    },
    sheetSafeView: {
        flex: 1,
        alignItems: "center",
    },
    toastContainer: {
        flexDirection: "row",
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E9ECF2",
        borderRadius: 4,
        padding: 12,
        marginHorizontal: 20,
        alignItems: "center",
        gap: 16,
    },
    toastTextContainer: {
        flex: 1,
    },
    toastText1: {
        fontSize: 14,
        color: "#171A26",
    },
    toastText2: {
        fontSize: 12,
        color: "#333",
        marginTop: 2,
    },
});

// Hook pra usar contexto mais fácil
export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useApp deve ser usado dentro do AppProvider");
    }
    return context;
};
