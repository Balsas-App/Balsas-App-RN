import LottieView from "lottie-react-native";
import { useRef } from "react";
import { View, StyleSheet } from "react-native";

const Component = () => {
    const animation = useRef<LottieView>(null);

    return (
        <View style={styles.loading}>
            <LottieView
                autoPlay
                ref={animation}
                style={{
                    width: 200,
                    height: 200,
                }}
                source={require("@assets/animations/ship-loading.json")}
            />
        </View>
    );
};

export default Component;

const styles = StyleSheet.create({
    loading: {
        position: "absolute",
        backgroundColor: "rgba(255,255,255,0.8)",
        width: "100%",
        height: "100%",
        left: 0,
        top: 0,
        alignItems: "center",
        justifyContent: "center",
    },
});
