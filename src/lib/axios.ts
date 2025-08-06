import axios from "axios";
import {keycloak} from "@/providers/authProvider.ts";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL
});

axiosInstance.interceptors.request.use(async (config) => {
    if (keycloak?.token) {
        if (keycloak.isTokenExpired?.()) {
            try {
                await keycloak.updateToken(10);
            } catch (err) {
                console.error("Erreur lors du rafraîchissement du token", err);
            }
        }

        config.headers.Authorization = `Bearer ${keycloak.token}`;
    }

    return config;
});

export default axiosInstance;
