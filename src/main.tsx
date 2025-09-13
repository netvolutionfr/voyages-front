import './index.css'
import App from './App.tsx'
import {BrowserRouter} from "react-router-dom";
import React, {useEffect, useState} from 'react';
import ReactDOM from 'react-dom/client';
import {keycloak} from "@/providers/authProvider.ts";
import LoadingSpinner from "@/components/common/LoadingSpinner.tsx";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

const AppWithKeycloak = () => {
    const [ready, setReady] = useState(false);
    useEffect(() => {
        const initKeycloak = async () => {
            try {
                await keycloak.init({
                    onLoad: "check-sso",       // ✨ jamais de redirection auto
                    pkceMethod: "S256",
                    checkLoginIframe: false,
                    silentCheckSsoRedirectUri: window.location.origin + "/silent-check-sso.html",
                });
                setReady(true);
            } catch (error) {
                console.error("Échec init Keycloak", error);
            }
        };
        initKeycloak();
    }, []);

    if (!ready) {
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
