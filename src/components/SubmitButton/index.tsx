import {
    GestureResponderEvent,
    TouchableNativeFeedback,
    View,
    StyleSheet,
    Text,
} from "react-native";

type ComponentProps = {
    title: string;
    onPress?: ((event: GestureResponderEvent) => void) | undefined;
    disabled?: boolean;
};
const Component = (props: ComponentProps) => {
    return (
        <View
            style={{
                borderRadius: 8,
                overflow: "hidden",
            }}
        >
            <TouchableNativeFeedback
                background={TouchableNativeFeedback.Ripple(
                    "rgba(0,0,0,0.2)",
                    false
                )}
                onPress={!props.disabled ? props.onPress : undefined}
            >
                <View
                    style={[
                        styles.submitButton,
                        !props.disabled && styles.submitButtonEnabled,
                    ]}
                >
                    <Text
                        style={[
                            styles.submitButtonText,
                            !props.disabled && styles.submitButtonEnabledText,
                        ]}
                    >
                        {props.title}
                    </Text>
                </View>
            </TouchableNativeFeedback>
        </View>
    );
};

export default Component;

const styles = StyleSheet.create({
    submitButton: {
        backgroundColor: "rgba(234, 246, 255, 1)",
        height: 56,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
    },
    submitButtonEnabled: {
        backgroundColor: "rgba(1, 119, 251, 1)",
    },
    submitButtonText: {
        color: "rgba(164, 172, 185, 1)",
        fontWeight: "bold",
    },
    submitButtonEnabledText: {
        color: "#fff",
    },
});
