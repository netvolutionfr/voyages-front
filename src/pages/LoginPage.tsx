import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {RegisterPasskeyFlow} from "@/components/common/RegisterPasskeyFlow.tsx";
import PasskeyInfo from "@/components/common/PasskeyInfo.tsx";
import {LoginPasskeyFlow} from "@/components/common/LoginPasskeyFlow.tsx";
import type {FinishResult} from "@/lib/credentials.ts";
import {useNavigate} from "react-router-dom";

export default function LoginPage() {
    const [supported, setSupported] = useState<boolean | null>(null);
    const navigate = useNavigate();


    const handleSuccess = async (r: FinishResult) => {
        console.log("register success", r);
        if (r.status === "PENDING") {
            navigate("/otp", { replace: true });
        } else {
            navigate("/", { replace: true });
        }
    };

    useEffect(() => {
        (async () => {
            const webauthnOK =
                "PublicKeyCredential" in window &&
                (await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable().catch(() => false));
            setSupported(webauthnOK);
        })();
    }, []);

    return (
        <div className="min-h-screen grid place-items-center p-6">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Connexion</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <LoginPasskeyFlow
                        disabled={supported === false}
                        onSuccess={handleSuccess}
                    />

                    <div className="text-center text-xs text-muted-foreground">— ou —</div>

                    <RegisterPasskeyFlow
                        disabled={supported === false}
                        onSuccess={handleSuccess}
                    />

                    {supported === false && (
                        <p className="text-sm text-muted-foreground">
                            Passkeys non prises en charge sur cet appareil ou navigateur.
                        </p>
                    )}

                    <PasskeyInfo />
                </CardContent>
            </Card>
        </div>
    );
}