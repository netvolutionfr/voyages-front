import { useEffect, useState } from "react";
import { useGo } from "@refinedev/core";
import { beginAuthentication } from "@/auth/passkeys";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
    const [email, setEmail] = useState<string>("");
    const [supported, setSupported] = useState<boolean | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const go = useGo();

    useEffect(() => {
        (async () => {
            const available = "PublicKeyCredential" in window
                ? await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
                : false;
            setSupported(available);
        })();
    }, []);

    const handlePasskeyLogin = async (): Promise<void> => {
        try {
            setLoading(true);
            await beginAuthentication(email || undefined);
            go({ to: "/", type: "path" });
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Échec de l’authentification";
            alert(msg);
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
                    <div className="space-y-2">
                        <Label htmlFor="email">Email (optionnel)</Label>
                        <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nom@domaine.fr" />
                    </div>
                    <Button onClick={handlePasskeyLogin} disabled={supported === false || loading}>
                        {loading ? "Connexion..." : "Se connecter avec une passkey"}
                    </Button>
                    {supported === false && (
                        <p className="text-sm text-muted-foreground">
                            Passkeys non prises en charge sur cet appareil/navigateur.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
