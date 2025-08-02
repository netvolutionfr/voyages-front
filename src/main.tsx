import './index.css'
import App from './App.tsx'
import {BrowserRouter} from "react-router-dom";
import React, {useEffect, useState} from 'react';
import ReactDOM from 'react-dom/client';
import {keycloak} from "@/providers/authProvider.ts";
import LoadingSpinner from "@/components/common/LoadingSpinner.tsx";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

const AppWithKeycloak = () => {
    const [keycloakInitialized, setKeycloakInitialized] = useState(false);

    useEffect(() => {
        const initKeycloak = async () => {
            try {
                await keycloak.init({
                    onLoad: 'login-required', // C'est ici que vous forcez la connexion
                    silentCheckSsoRedirectUri: window.location.origin + "/silent-check-sso.html",
                });
                setKeycloakInitialized(true);
            } catch (error) {
                console.error("Échec de l'initialisation de Keycloak", error);
            }
        };
        initKeycloak();
    }, []);

    if (!keycloakInitialized) {
        // Affiche un écran de chargement tant que Keycloak n'est pas initialisé
        return <LoadingSpinner />;
    }

    return (
        <React.StrictMode>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </React.StrictMode>
    );
};
export default AppWithKeycloak;

root.render(<AppWithKeycloak />);
