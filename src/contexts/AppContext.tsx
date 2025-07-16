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
import { StyleSheet, Text } from "react-native";
import Toast, { ErrorToast } from "react-native-toast-message";

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
            {children}

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
                    <AppMenu />
                </BottomSheetView>
            </BottomSheet>
            <Toast
                config={{
                    error: (props: any) => (
                        <ErrorToast
                            {...props}
                            style={{
                                borderLeftColor: "red",
                                backgroundColor: "#ffe6e6",
                                width: "auto",
                                marginHorizontal: 20,
                            }}
                            text1Style={{
                                fontSize: 16,
                                fontWeight: "bold",
                                color: "#1a1a1a",
                            }}
                            text2Style={{
                                fontSize: 14,
                                color: "#333",
                            }}
                        />
                    ),
                }}
            />
        </AppContext.Provider>
    );
};

const styles = StyleSheet.create({
    sheetContainer: {
        flex: 1,
        padding: 12,
        paddingBottom: 24,
        alignItems: "center",
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
