import { useEffect } from "react";
import userService from "../services/userService.ts";
import { notification } from "antd";
import { updateToken } from '../config/axiosConfig';


const useTokenRefresh = () => {

    const [api, contextHolder] = notification.useNotification();


    const openNotificationWithIcon = (type, title, message) => {
        api[type]({
            message: title,
            description: message,
        });
    };


    /*|--------------------------------------------------------------------------
   |  Handle Refresh JWT token
   |-------------------------------------------------------------------------- */
    const refreshToken = async ()  => {
        try {
            const response = await userService.refreshToken();
            console.log(response.status)
            if (response.status === 'success') {
                localStorage.setItem("TOKEN", response.token);
                updateToken(response.token);
                openNotificationWithIcon("success", "Succès", "Token rafraîchi avec succès.");
            }
        } catch (error) {
            openNotificationWithIcon("error", "Erreur", "Le rafraîchissement du token a échoué.");
        }
    };



    /*|--------------------------------------------------------------------------
    |  Refresh JWT token every 3000000 ms = 50 Minutes
    |-------------------------------------------------------------------------- */
    useEffect(() => {
        const interval = setInterval(() => {
            refreshToken();
        }, 3000000);
        return () => clearInterval(interval);
    }, []);

    return { contextHolder };
};

export default useTokenRefresh;