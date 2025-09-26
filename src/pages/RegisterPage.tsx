import { useState } from "react";
import { useGo } from "@refinedev/core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {authApi} from "@/auth/passkeys.ts";

export default function RegisterPage() {
    const [email, setEmail] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const go = useGo();


    const handleRegister = async (): Promise<void> => {
        if (!email) { alert("Merci d’indiquer un email"); return; }
        try {
            setLoading(true);
            const res = await authApi(`/api/auth/register-request`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });
            if (res.status === 400) {
                const text = await res.statusText;
                throw new Error(text || `Erreur ${res.status}`);
            }
            // Option: le backend peut retourner {message:"ok"} ou {emailSent:true}
            alert("Si l'email existe, un lien d’activation vient de lui être envoyé. Pensez à vérifier vos spams.");
            go({ to: "/", type: "path" });
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Échec de la demande d'inscription";
            alert(msg);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen grid place-items-center p-6">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Créer un compte</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nom@domaine.fr" type="email" autoComplete="email" />
                    </div>
                    <Button onClick={handleRegister} disabled={loading} className="w-full">
                        {loading ? "Envoi…" : "Envoyer le lien d’activation"}
                    </Button>
                    <p className="text-sm text-muted-foreground">
                        Nous vous enverrons un lien d’activation. Vous créerez votre passkey après avoir cliqué sur ce lien.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
