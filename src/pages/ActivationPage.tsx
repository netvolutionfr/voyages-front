import { useEffect, useState } from "react";
import { useGo } from "@refinedev/core";
import { useSearchParams } from "react-router-dom";
import { beginRegistration } from "@/auth/passkeys";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ActivationPage() {
    const go = useGo();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [info, setInfo] = useState<string | null>(null);


    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) setError("Lien d'activation invalide : token manquant.");
    }, [token]);


    const handleBegin = async () => {
        if (!token) return;
        try {
            setLoading(true);
            setError(null);
            await beginRegistration(token); // helper front doit appeler: GET /webauthn/register/options?token=... puis POST /api/webauthn/register/finish
            setInfo("Passkey créée avec succès. Vous pouvez maintenant vous connecter.");
            setTimeout(() => go({ to: "/login", type: "path" }), 900);
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Échec de la création de la passkey";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen grid place-items-center p-6">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Activation du compte</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertTitle>Erreur</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}


                    {info && (
                        <Alert>
                            <AlertTitle>Succès</AlertTitle>
                            <AlertDescription>{info}</AlertDescription>
                        </Alert>
                    )}


                    <Button onClick={handleBegin} disabled={!token || loading} className="w-full">
                        {loading ? "Création de la passkey…" : "Créer ma passkey"}
                    </Button>


                    <p className="text-sm text-muted-foreground">
                        En cliquant ci-dessus, une boîte de dialogue système s’ouvrira pour enregistrer votre Passkey (Face ID / Touch ID / Windows Hello / clé FIDO2).
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
