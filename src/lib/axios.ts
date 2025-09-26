import axios, { AxiosError, type AxiosInstance } from "axios";

export const api: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true, // ⬅️ très important pour envoyer le cookie httpOnly
    headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest", // utile côté Spring pour différencier AJAX
    },
});

// (Optionnel) Si tu as un cookie CSRF (ex: "XSRF-TOKEN") posé par le backend :
api.defaults.xsrfCookieName = "XSRF-TOKEN";
api.defaults.xsrfHeaderName = "X-XSRF-TOKEN";

// Interceptor de réponse : si 401 → redirige vers /login
api.interceptors.response.use(
    (res) => res,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Option : ne redirige pas si déjà sur /login
            if (window.location.pathname !== "/login") {
                window.location.assign("/login");
            }
        }
        return Promise.reject(error);
    },
);
