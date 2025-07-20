import AppHeader from "@components/AppHeader";
import BoardingHeader from "@components/BoardingHeader";
import TextInput from "@components/TextInput";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    StyleSheet,
    View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";

import PaxIcon from "@assets/icons/input-pax.svg";
import ValueIcon from "@assets/icons/input-value.svg";
import SuperSelectInput from "@components/SuperSelectInput";
import SubmitButton from "@components/SubmitButton";
import LoadingScreen from "@components/LoadingScreen";

type PageProps = {
    ferry: string;
    date: string;
    time: string;
};

const Page = () => {
    const params: PageProps = useLocalSearchParams();
    const [loading, setLoading] = useState(false);
    const [plate, setPlate] = useState("");
    const [pax, setPax] = useState<number>(1);
    const [value, setValue] = useState();
    const [additionalValue, setAdditionalValue] = useState<string>("");
    const [observation, setObservation] = useState("");
    const [vehicle, setVehicle] = useState<{
        name: string;
        value: number;
    }>();

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <AppHeader title={"Embarque"} />

                <ScrollView style={styles.checkIn}>
                    <BoardingHeader
                        ferry={params.ferry}
                        date={params.date}
                        time={params.time}
                    />

                    <View style={styles.form}>
                        <View style={styles.doubleInput}>
                            <View style={{ flex: 1 }}>
                                <TextInput
                                    label="Placa"
                                    placeholder="XYZ9999"
                                    type="text"
                                    value={plate.toUpperCase()}
                                    onChange={(text) =>
                                        setPlate(text.toString().toUpperCase())
                                    }
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <TextInput
                                    label="Qtd Pessoas"
                                    placeholder="1"
                                    type="number"
                                    value={pax}
                                    sufix={<PaxIcon color="#2B3F6C" />}
                                    onChange={(text) =>
                                        setPax(parseInt(text.toString()))
                                    }
                                />
                            </View>
                        </View>

                        <SuperSelectInput
                            label="Tipo de automóvel"
                            placeholder="Selecione um tipo"
                            data={[
                                {
                                    type: "Hatch",
                                    models: [
                                        { name: "Onix", value: 45 },
                                        { name: "Celta", value: 45 },
                                        { name: "Gol", value: 45 },
                                        { name: "Polo", value: 45 },
                                    ],
                                },
                                {
                                    type: "Caminhão",
                                    models: [
                                        { name: "Caminhão ¾", value: 115 },
                                        {
                                            name: "Caminhão ¾ alongado",
                                            value: 130,
                                        },
                                        {
                                            name: "Caminhão ¾ Plataforma",
                                            value: 120,
                                        },
                                    ],
                                },
                                {
                                    type: "Caminhão Toco",
                                    models: [
                                        { name: "Caminhão Toco", value: 130 },
                                        {
                                            name: "Caminhão Toco alongado ",
                                            value: 150,
                                        },
                                        {
                                            name: "Caminhão Toco Baú - colção ou similares até 14mts",
                                            value: 240,
                                        },
                                    ],
                                },
                            ]}
                            onChange={(value) => setVehicle(value)}
                            value={vehicle}
                        />

                        <View style={styles.doubleInput}>
                            <View style={{ flex: 1 }}>
                                <TextInput
                                    label="Valor"
                                    placeholder="0,00"
                                    type="text"
                                    value={
                                        vehicle?.value.toLocaleString("pt-BR", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        }) || "0,00"
                                    }
                                    sufix={<ValueIcon color="#2B3F6C" />}
                                    disabled
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <TextInput
                                    label="Valor adicional"
                                    placeholder="0,00"
                                    type="money"
                                    value={additionalValue}
                                    sufix={<ValueIcon color="#2B3F6C" />}
                                    onChange={(value) =>
                                        setAdditionalValue(value.toString())
                                    }
                                />
                            </View>
                        </View>

                        <TextInput
                            label="Observação"
                            placeholder="Informações complementares"
                            type="textarea"
                            value={observation}
                            onChange={(text) => setObservation(text.toString())}
                        />

                        <View style={{ marginTop: 16 }}>
                            <SubmitButton
                                title="Confirmar Veículo"
                                onPress={() => {
                                    setLoading(true);
                                    setTimeout(() => {
                                        setLoading(false);
                                    }, 1000);
                                }}
                            />
                        </View>
                        <SubmitButton
                            title="Ver resumo"
                            style={{
                                backgroundColor: "#FFFFFF",
                                borderWidth: 1,
                                borderColor: "#898A8D",
                            }}
                            textStyle={{ color: "#000" }}
                        />
                    </View>
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
        backgroundColor: "#F1F1F1",
        justifyContent: "flex-start",
    },
    checkIn: {
        flex: 1,
        paddingBottom: 32,
    },
    form: {
        gap: 20,
        padding: 16,
    },
    doubleInput: {
        flexDirection: "row",
        gap: 20,
    },
});
