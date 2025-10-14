import { useEffect, useRef, useState } from "react";
import { useGo } from "@refinedev/core";
import { beginAuthentication } from "@/auth/passkeys";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {RegisterPasskeyFlow} from "@/components/common/RegisterPasskeyFlow.tsx";

export default function LoginPage() {
    const [supported, setSupported] = useState<boolean | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const go = useGo();
    const abortRef = useRef<AbortController | null>(null);

    // 1) Détection support + auto sign-in (Conditional UI)
    useEffect(() => {
        let mounted = true;
        (async () => {
            const webauthnOK =
                "PublicKeyCredential" in window &&
                (await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable().catch(() => false));
            if (!mounted) return;
            setSupported(!!webauthnOK);

            if (webauthnOK) {
                abortRef.current?.abort();
                const ac = new AbortController();
                abortRef.current = ac;

                // Lancement silencieux : affichera la feuille/suggestion si une passkey existe
                beginAuthentication({ conditional: true, signal: ac.signal })
                    .then(() => {
                        if (!mounted) return;
                        go({ to: "/", type: "path" });
                    })
                    .catch((err) => {
                        // Ne pas alerter ici : l’utilisateur a pu juste ignorer la suggestion
                        console.debug("Conditional UI: pas de connexion automatique", err?.message ?? err);
                    });
            }
        })();

        return () => {
            mounted = false;
            abortRef.current?.abort();
        };
    }, [go]);

    // 2) Bouton explicite (mediation: "required")
    const handlePasskeyLogin = async (): Promise<void> => {
        try {
            setLoading(true);
            await beginAuthentication({ conditional: false });
            go({ to: "/", type: "path" });
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Échec de l’authentification";
            alert("1 " + msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid place-items-center p-6">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Connexion</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button onClick={handlePasskeyLogin} disabled={supported === false || loading} className="w-full">
                        {loading ? "Connexion..." : "Se connecter avec une passkey"}
                    </Button>

                    <div className="text-center text-xs text-muted-foreground">— ou —</div>

                    <RegisterPasskeyFlow
                        disabled={supported === false}
                        onSuccess={() => go({ to: "/", type: "path" })}
                    />

                    {supported === false && (
                        <p className="text-sm text-muted-foreground">Passkeys non prises en charge sur cet appareil/navigateur.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );}