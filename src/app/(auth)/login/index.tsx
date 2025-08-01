import { StatusBar } from "expo-status-bar";
import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
    Keyboard,
    Platform,
    TouchableNativeFeedback,
    ActivityIndicator,
} from "react-native";
import EmailIcon from "@assets/icons/email-input.svg";
import PasswordIcon from "@assets/icons/password-input.svg";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import LoginInput from "@components/LoginInput";
import { useAuth } from "@contexts/AuthContext";
import { router } from "expo-router";
import LottieView from "lottie-react-native";
import Toast, { ErrorToast } from "react-native-toast-message";

export default function Page() {
    const { login, authenticated, isLoading, isCheckingAuth } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [canSubmit, setCanSubmit] = useState(false);
    const animation = useRef<LottieView>(null);
    const [loginResponse, setLoginResponse] = useState<{
        success: boolean;
        message: string;
    } | null>(null);

    useEffect(() => {
        setCanSubmit(email.length > 0 && password.length > 0);
    }, [email, password]);

    const handleSubmit = () => {
        const doLogin = async () => {
            const loginResponse = await login(email, password);
            setLoginResponse(loginResponse);
        };

        if (canSubmit) {
            doLogin();
        }
    };

    useEffect(() => {
        if (loginResponse && !loginResponse.success) {
            Toast.show({
                type: "error",
                text1: "Credenciais inválidas.",
                position: "top",
                topOffset: 100,
            });
        }
    }, [loginResponse]);

    useLayoutEffect(() => {
        if (authenticated) {
            router.replace("/home");
        }
    }, [authenticated]);

    if (isCheckingAuth || authenticated) {
        return (
            <View
                style={{
                    flex: 1,
                    backgroundColor: "#061949",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <StatusBar style="light" />
                <ActivityIndicator size="large" color="#fff" />
            </View>
        );
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <View style={styles.header}></View>
                <Text style={styles.title}>Login</Text>
                <View style={styles.loginForm}>
                    <Text style={styles.loginFormTitle}>Bem vindo</Text>
                    <Text style={styles.loginFormDescription}>
                        Sistema de emissão de Ticktes
                    </Text>

                    <View style={styles.formBody}>
                        <LoginInput
                            type="text"
                            label="Email"
                            placeholder="Email"
                            onChange={(text) => setEmail(text)}
                            icon={<EmailIcon />}
                            value={email}
                        />

                        <LoginInput
                            type="password"
                            label="Senha"
                            placeholder="Senha"
                            onChange={(text) => setPassword(text)}
                            icon={<PasswordIcon />}
                            value={password}
                        />

                        <TouchableNativeFeedback
                            background={TouchableNativeFeedback.Ripple(
                                "rgba(0,0,0,0.2)",
                                false
                            )}
                            onPress={handleSubmit}
                        >
                            <View
                                style={[
                                    styles.submitButton,
                                    canSubmit && styles.submitButtonEnabled,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.submitButtonText,
                                        canSubmit &&
                                            styles.submitButtonEnabledText,
                                    ]}
                                >
                                    Entrar
                                </Text>
                            </View>
                        </TouchableNativeFeedback>
                    </View>

                    <View style={styles.version}>
                        <Text style={styles.versionText}>Balsas v1.0.0</Text>
                    </View>
                </View>
                {isLoading && (
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
                )}
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#061949",
        justifyContent: "flex-start",
    },
    header: {
        alignItems: "flex-end",
        justifyContent: "center",
        height: 120,
        marginBottom: -80,
    },
    title: {
        fontSize: 20,
        color: "#fff",
        padding: 32,
        fontWeight: "bold",
    },
    loading: {
        position: "absolute",
        backgroundColor: "rgba(255,255,255,0.8)",
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    loginForm: {
        flex: 1,
        width: "100%",
        backgroundColor: "#fff",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingHorizontal: 20,
        paddingVertical: 32,
    },
    loginFormTitle: {
        color: "rgba(13, 13, 18, 1)",
        fontSize: 18,
        fontWeight: 600,
    },
    loginFormDescription: {
        color: "rgba(129, 136, 152, 1)",
        fontSize: 14,
        fontWeight: 400,
    },
    formBody: {
        paddingVertical: 32,
        gap: 16,
    },
    submitButton: {
        backgroundColor: "rgba(234, 246, 255, 1)",
        height: 56,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
        marginTop: 16,
    },
    submitButtonEnabled: {
        backgroundColor: "#061949",
    },
    submitButtonText: {
        color: "rgba(164, 172, 185, 1)",
        fontWeight: "bold",
    },
    submitButtonEnabledText: {
        color: "#fff",
    },
    version: {
        flex: 1,
        justifyContent: "flex-end",
        alignItems: "center",
    },
    versionText: {
        color: "rgba(0,0,0,0.2)",
    },
});
