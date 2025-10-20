import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    beginAuthenticationOneStep,
    finishAuthenticationOneStep,
    type CredentialRequestResponse,
} from "@/auth/passkeys";
import type {FinishResult} from "@/lib/credentials.ts";
import {saveAuth} from "@/auth/token.ts";
import {getIdentityFromJwt, setIdentityCache} from "@/auth/session.ts";

type Phase = "idle" | "authenticating" | "finishing";

export function LoginPasskeyFlow({
                                     disabled,
                                     onSuccess,
                                 }: {
    disabled?: boolean;
    onSuccess: (r: FinishResult) => void;
}) {
    const [phase, setPhase] = useState<Phase>("idle");
    const [error, setError] = useState<string | null>(null);

    const login = async () => {
        try {
            setError(null);
            setPhase("authenticating");

            const cred: CredentialRequestResponse = await beginAuthenticationOneStep();

            setPhase("finishing");
            const result = await finishAuthenticationOneStep(cred);

            saveAuth({
                tokenType: result.tokenType,
                accessToken: result.accessToken,
                expiresIn: result.expiresIn,
                refreshToken: result.refreshToken,
                refreshTokenExpiresIn: result.refreshExpiresIn
            });
            setIdentityCache(getIdentityFromJwt());

            onSuccess({
                email: result.user.email,
                status: result.user.status as "ACTIVE" | "PENDING",
            });

            setPhase("idle");
        } catch (e) {
            setPhase("idle");
            setError(e instanceof Error ? e.message : "Échec de la connexion par passkey");
        }
    };

    return (
        <div className="space-y-2">
            <Button
                onClick={login}
                disabled={disabled || phase !== "idle"}
                className="w-full"
            >
                {phase === "authenticating"
                    ? "Vérification…"
                    : phase === "finishing"
                        ? "Connexion…"
                        : "Se connecter avec une passkey"}
            </Button>

            {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
    );
}