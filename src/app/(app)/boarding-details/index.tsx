import AppHeader from "@components/AppHeader";
import BoardingHeader from "@components/BoardingHeader";
import {
    router,
    useFocusEffect,
    useLocalSearchParams,
    useNavigation,
} from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    StyleSheet,
    View,
    Alert,
    Text,
    ScrollView,
    BackHandler,
} from "react-native";
import LoadingScreen from "@components/LoadingScreen";
import { CheckinInfos } from "@type/checkins";
import { finishBoarding, getBoarding } from "@services/boarding";
import { getVehiclesList } from "@services/vehicles";
import { VehiclesList } from "@type/vehicles";
import { getBoardingCheckins } from "@services/checkin";
import CheckinDetailsRow from "@components/CheckinDetailsRow";
import React from "react";
import SubmitButton from "@components/SubmitButton";
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetView,
} from "@gorhom/bottom-sheet";
import WarningIcon from "@assets/images/warning-checkin.svg";
import Toast from "react-native-toast-message";

type GroupedCheckins = {
    vehicle_type: string;
    checkins: CheckinInfos[];
};

const Page = () => {
    const params = useLocalSearchParams();
    const [boardingData, setBoardingData] = useState<{
        ferry_name: string;
        route_name: string;
        time_in: Date;
        total_checkins: number;
        closed: 0 | 1;
    }>();
    const [checkinsData, setCheckinsData] = useState<GroupedCheckins[]>([]);
    const [loading, setLoading] = useState(true);
    const [vehicles, setVehiclesList] = useState<VehiclesList>([]);
    const [partialValue, setPartialValue] = useState(0);
    const [totalValue, setTotalValue] = useState(0);
    const boardingBottomSheet = useRef<BottomSheet>(null);
    const navigation = useNavigation();

    useFocusEffect(() => {
        const onBackPress = () => {
            if (boardingData?.closed) {
                router.dismissTo("/home");
                return true;
            }
        };

        const subscription = BackHandler.addEventListener(
            "hardwareBackPress",
            onBackPress
        );

        return () => {
            subscription.remove();
        };
    });

    const sumCategoryVehicleValues = (vehicles: CheckinInfos[]) => {
        return vehicles.reduce((sum, vehicle) => sum + vehicle.value, 0);
    };

    const groupCheckins = (data: CheckinInfos[]) => {
        const grouped: Record<string, CheckinInfos[]> = data.reduce(
            (acc, item) => {
                const type = item.vehicle_category_name;
                if (!acc[type]) {
                    acc[type] = [];
                }
                acc[type].push(item);
                return acc;
            },
            {} as Record<string, CheckinInfos[]>
        );

        const result: GroupedCheckins[] = Object.entries(grouped)
            .map(([vehicle_type, checkins]) => {
                checkins.sort(
                    (a, b) =>
                        new Date(b.date_in).getTime() -
                        new Date(a.date_in).getTime()
                );
                return {
                    vehicle_type: vehicle_type,
                    checkins,
                };
            })
            .sort((a, b) => {
                const dateA = new Date(a.checkins[0].date_in).getTime();
                const dateB = new Date(b.checkins[0].date_in).getTime();
                return dateB - dateA;
            });

        return result;
    };

    useEffect(() => {
        const loadBoarding = async () => {
            try {
                const [data, vehicles] = await Promise.all([
                    getBoarding(params.boarding_id as unknown as number),
                    getVehiclesList(),
                ]);

                if (data) {
                    setBoardingData(data);
                    setVehiclesList(vehicles);

                    const checkins = await getBoardingCheckins(
                        params.boarding_id as unknown as number
                    );

                    setPartialValue(
                        checkins.reduce(
                            (sum, checkin) => sum + checkin.value,
                            0
                        )
                    );

                    setTotalValue(
                        checkins.reduce(
                            (sum, checkin) =>
                                sum + checkin.value + checkin.add_value,
                            0
                        )
                    );
                    setCheckinsData(groupCheckins(checkins));
                } else {
                    Alert.alert(
                        "Ocorreu um erro ao carregar dados do embarque",
                        "Inicie um novo embarque.",
                        [
                            {
                                text: "Ok",
                                onPress: () => router.back(),
                            },
                        ],
                        { cancelable: false }
                    );
                }

                setLoading(false);
            } catch (err) {
                console.log("error", err);
            }
        };

        loadBoarding();
    }, [params.boarding_id]);

    const openBoardingBottomSheet = () => {
        boardingBottomSheet.current?.snapToIndex(0);
    };

    const closeBoardingBottomSheet = () => {
        boardingBottomSheet.current?.close();
    };

    const renderBackdrop = (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
            {...props}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
            pressBehavior="close" // fecha ao clicar no backdrop
        />
    );

    const handleFinishBoarding = async () => {
        setLoading(true);

        const finish = await finishBoarding(
            params.boarding_id as unknown as number
        );

        if (finish) {
            setBoardingData((prev) => (prev ? { ...prev, closed: 1 } : prev));
            closeBoardingBottomSheet();
        } else {
            Toast.show({
                type: "error",
                text1: "Não foi possível encerrar o embarque",
                text2: "Tente novamente mais tarde.",
                position: "top",
                topOffset: 100,
            });
        }
        setLoading(false);
    };

    return (
        <>
            <AppHeader title={"Relatórios"} showBack={!boardingData?.closed} />

            <ScrollView style={styles.checkinList} stickyHeaderIndices={[2]}>
                <BoardingHeader
                    ferry={boardingData?.ferry_name || ""}
                    date={boardingData?.time_in || new Date()}
                />
                <View style={{ height: 16 }}></View>
                <View style={{ backgroundColor: "#fff" }}>
                    <CheckinDetailsRow
                        checkin={{
                            col1: "Placa",
                            col2: "Veículos",
                            col3: "Pax",
                            col4: "Pago",
                        }}
                        isHeader={true}
                    />
                </View>
                {checkinsData.length > 0 &&
                    checkinsData.map((group, key) => (
                        <View key={key}>
                            <Text style={styles.categoryTitle}>
                                {group.vehicle_type}
                            </Text>
                            {group.checkins.length > 0 &&
                                group.checkins.map((checkin, subkey) => (
                                    <React.Fragment key={subkey}>
                                        <CheckinDetailsRow checkin={checkin} />
                                        {subkey ==
                                            group.checkins.length - 1 && (
                                            <>
                                                <View
                                                    style={{ height: 8 }}
                                                ></View>
                                                <CheckinDetailsRow
                                                    checkin={{
                                                        col1: "",
                                                        col2: "Valor Categoria",
                                                        col3: "",
                                                        col4: new Intl.NumberFormat(
                                                            "pt-BR",
                                                            {
                                                                style: "currency",
                                                                currency: "BRL",
                                                            }
                                                        ).format(
                                                            sumCategoryVehicleValues(
                                                                group.checkins
                                                            )
                                                        ),
                                                    }}
                                                    isFooter={true}
                                                />
                                            </>
                                        )}
                                    </React.Fragment>
                                ))}
                        </View>
                    ))}

                <View style={styles.partialValueHeader}>
                    <Text style={styles.partialValueHeaderText}>
                        Total parcial
                    </Text>
                    <Text style={styles.partialValueHeaderText}>
                        {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                        }).format(partialValue)}
                    </Text>
                </View>

                {checkinsData.length > 0 &&
                    checkinsData.map((group) =>
                        group.checkins.filter(
                            (checkin) => checkin.add_value > 0
                        )
                    ) && (
                        <Text style={styles.categoryTitle}>
                            Valores adicionais
                        </Text>
                    )}

                {checkinsData.length > 0 &&
                    checkinsData.map((group, key) => (
                        <View key={key}>
                            {group.checkins.length > 0 &&
                                group.checkins
                                    .filter((checkin) => checkin.add_value > 0)
                                    .map((checkin, subkey) => {
                                        return (
                                            <React.Fragment key={subkey}>
                                                <CheckinDetailsRow
                                                    checkin={{
                                                        ...checkin,
                                                        value: checkin.add_value,
                                                    }}
                                                    showReason={true}
                                                />
                                            </React.Fragment>
                                        );
                                    })}
                        </View>
                    ))}

                <View
                    style={[styles.partialValueHeader, { borderTopWidth: 0 }]}
                >
                    <Text style={styles.partialValueHeaderText}>
                        Total total
                    </Text>
                    <Text style={styles.partialValueHeaderText}>
                        {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                        }).format(totalValue)}
                    </Text>
                </View>

                <View style={styles.actions}>
                    {!boardingData?.closed ? (
                        <SubmitButton
                            title="Finalizar embarque"
                            onPress={openBoardingBottomSheet}
                        />
                    ) : (
                        <SubmitButton
                            title="Enviar relatório"
                            onPress={openBoardingBottomSheet}
                        />
                    )}

                    <SubmitButton
                        title="Imprimir"
                        style={{
                            backgroundColor: "#FFFFFF",
                            borderWidth: 1,
                            borderColor: "#898A8D",
                        }}
                        textStyle={{ color: "#000" }}
                        onPress={() => {}}
                    />
                </View>
            </ScrollView>

            <BottomSheet
                ref={boardingBottomSheet}
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
                backdropComponent={renderBackdrop}
            >
                <BottomSheetView style={styles.sheetContainer}>
                    <WarningIcon />

                    <Text style={styles.boardingTitle}>
                        Finalizar o Embarque
                    </Text>

                    <View style={styles.confirmBoarding}>
                        <View style={styles.confirmBoardingButton}>
                            <SubmitButton
                                title="Não"
                                style={{
                                    backgroundColor: "#E01507",
                                    paddingHorizontal: 40,
                                }}
                                onPress={() => closeBoardingBottomSheet()}
                            />
                        </View>

                        <View style={styles.confirmBoardingButton}>
                            <SubmitButton
                                title="Sim"
                                style={{
                                    backgroundColor: "#FFF",
                                    borderWidth: 1,
                                    borderColor: "#061949",
                                    paddingHorizontal: 40,
                                }}
                                textStyle={{
                                    color: "#061949",
                                }}
                                onPress={handleFinishBoarding}
                            />
                        </View>
                    </View>
                </BottomSheetView>
            </BottomSheet>

            {loading && <LoadingScreen />}
        </>
    );
};

export default Page;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF",
        justifyContent: "flex-start",
    },
    checkinList: {
        flex: 1,
        backgroundColor: "#fff",
    },
    categoryTitle: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        fontSize: 12,
        fontWeight: "bold",
        marginTop: 8,
    },
    partialValueHeader: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        justifyContent: "space-between",
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: "#ABBED1",
        marginTop: 24,
    },
    partialValueHeaderText: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#212121",
    },
    actions: {
        padding: 16,
        gap: 24,
    },
    sheetContainer: {
        flex: 1,
        padding: 12,
        paddingBottom: 24,
        alignItems: "center",
    },
    boardingTitle: {
        fontWeight: 700,
        textAlign: "center",
        fontSize: 20,
        marginBottom: 12,
        marginTop: 12,
    },
    boardingDetails: {
        gap: 6,
        width: "100%",
        paddingHorizontal: 16,
    },
    confirmBoarding: {
        flexDirection: "row",
        gap: 18,
        paddingHorizontal: 18,
        marginTop: 32,
        paddingBottom: 32,
    },
    confirmBoardingButton: {
        flex: 1,
    },
});
