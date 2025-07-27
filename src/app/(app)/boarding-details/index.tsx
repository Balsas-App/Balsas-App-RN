import AppHeader from "@components/AppHeader";
import BoardingHeader from "@components/BoardingHeader";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    StyleSheet,
    View,
    Alert,
    Text,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import LoadingScreen from "@components/LoadingScreen";
import { CheckinInfos } from "@type/checkins";
import { getBoarding } from "@services/boarding";
import { getVehiclesList } from "@services/vehicles";
import { VehiclesList } from "@type/vehicles";
import { getBoardingCheckins } from "@services/checkin";
import CheckinDetailsRow from "@components/CheckinDetailsRow";
import React from "react";

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
    }>();
    const [checkinsData, setCheckinsData] = useState<GroupedCheckins[]>([]);
    const [loading, setLoading] = useState(true);
    const [vehicles, setVehiclesList] = useState<VehiclesList>([]);

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
            const data = await getBoarding(
                params.boarding_id as unknown as number
            );

            if (data) {
                setBoardingData(data);

                const vehicles = await getVehiclesList();
                setVehiclesList(vehicles);

                const checkins = await getBoardingCheckins(
                    params.boarding_id as unknown as number
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
        };

        loadBoarding();
    }, [params.boarding_id]);

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === "ios" ? "padding" : "padding"}
            >
                <AppHeader title={"Relatórios"} />

                <ScrollView
                    style={styles.checkinList}
                    stickyHeaderIndices={[2]}
                >
                    <BoardingHeader
                        ferry={boardingData?.ferry_name || ""}
                        date={boardingData?.time_in || new Date()}
                    />
                    <View style={{ height: 16 }}></View>
                    <CheckinDetailsRow
                        checkin={{
                            col1: "Placa",
                            col2: "Veículos",
                            col3: "Pax",
                            col4: "Pago",
                        }}
                        isHeader={true}
                    />
                    {checkinsData.length > 0 &&
                        checkinsData.map((group, key) => (
                            <View key={key}>
                                <Text style={styles.categoryTitle}>
                                    {group.vehicle_type}
                                </Text>
                                {group.checkins.length > 0 &&
                                    group.checkins.map((checkin, subkey) => (
                                        <React.Fragment key={subkey}>
                                            <CheckinDetailsRow
                                                checkin={checkin}
                                            />
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
                                                                    currency:
                                                                        "BRL",
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
                </ScrollView>

                {loading && <LoadingScreen />}
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
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
    },
    categoryTitle: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        fontSize: 12,
        fontWeight: "bold",
        marginTop: 8,
    },
});
