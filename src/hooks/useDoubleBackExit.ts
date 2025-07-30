import { useState, useEffect } from "react";
import { BackHandler, ToastAndroid } from "react-native";

const useDoubleBackExit = () => {
    const [backPressedOnce, setBackPressedOnce] = useState(false);

    useEffect(() => {
        const onBackPress = () => {
            if (backPressedOnce) {
                BackHandler.exitApp(); // Fecha o app
                return true;
            }

            setBackPressedOnce(true);
            ToastAndroid.show(
                "Pressione novamente para sair",
                ToastAndroid.SHORT
            );

            // Resetar o estado após 2 segundos
            setTimeout(() => {
                setBackPressedOnce(false);
            }, 2000);

            return true; // Bloqueia o comportamento padrão do botão voltar
        };

        const subscription = BackHandler.addEventListener(
            "hardwareBackPress",
            onBackPress
        );

        return () => subscription.remove();
    }, [backPressedOnce]);
};

export default useDoubleBackExit;
