import { useEffect } from "react";
import { keycloak } from "@/providers/authProvider";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function AfterFirstLogin() {
    useEffect(() => {
        // Lancer le login (redirection vers Keycloak, puis retour sur l’URL courante)
        keycloak.login({ redirectUri: window.location.origin + "/" });
    }, []);

    return (
        <div className="bg-muted flex min-h-svh items-center justify-center p-6">
            <Card className="max-w-sm">
                <CardHeader>
                    <CardTitle>Activation terminée</CardTitle>
                </CardHeader>
                <CardContent>
                    Connexion en cours...
                </CardContent>
            </Card>
        </div>
    );
}
