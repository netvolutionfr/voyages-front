// RegisterPasskeyFlow.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    beginRegistration,
    finishRegistrationOneStep,
} from "@/auth/passkeys";
import type {
    CredentialCreationResponse,
    FinishOneStepResponse,
    FinishResult,
    RegistrationOptionsPayload
} from "@/lib/credentials.ts";
import {saveAuth} from "@/auth/token.ts";
import {getIdentityFromJwt, setIdentityCache} from "@/auth/session.ts";

type Phase = "idle" | "creating" | "email" | "finishing";

export function RegisterPasskeyFlow({
                                        disabled,
                                        onSuccess,
                                    }: {
    disabled?: boolean;
    onSuccess: (r: FinishResult) => void;
}) {
    const [phase, setPhase] = useState<Phase>("idle");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | null>(null);

    const start = async () => {
        try {
            setError(null);
            setPhase("creating");
            setPhase("email");
            setDialogOpen(true);
        } catch (e) {
            setPhase("idle");
            setError(e instanceof Error ? e.message : "Échec de la création de la passkey");
        }
    };

    const finish = async () => {
        try {
            setError(null);
            setPhase("finishing");

            // 1) Création de la passkey côté device
            const cred: CredentialCreationResponse = await beginRegistration(email);

            // 2) Payload pour le backend
            const registrationRequest = {
                username: email,
                userId: cred.rawId,
                credential: cred
            }

            // 3) Finish one-step
            const res: FinishOneStepResponse = await finishRegistrationOneStep({
                email,
                displayName: null,
                registrationRequest,
            } as RegistrationOptionsPayload);

            // 4) Stocker le JWT
            saveAuth({
                tokenType: res.tokenType,
                accessToken: res.accessToken,
                expiresIn: res.expiresIn
            });
            setIdentityCache(getIdentityFromJwt());

            // 5) Nettoyage UI puis remonter le statut
            setDialogOpen(false);
            setPhase("idle");
            const savedEmail = email;
            setEmail("");

            onSuccess({
                email: savedEmail,
                status: res.user.status as "PENDING" | "ACTIVE",
            });
        } catch (e) {
            setPhase("email");
            setError(e instanceof Error ? e.message : "Échec de la finalisation");
        }
    };

    const resetIfClosed = (open: boolean) => {
        setDialogOpen(open);
        if (!open) {
            setPhase("idle");
            setEmail("");
            setError(null);
        }
    };

    return (
        <>
            <Button onClick={start} disabled={disabled || phase === "creating"} className="w-full" variant="outline">
                {phase === "creating" ? "Création de la passkey…" : "Créer un compte avec une passkey"}
            </Button>

            {/* Email dialog opens only after passkey creation */}
            <Dialog open={dialogOpen} onOpenChange={resetIfClosed}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Associer votre e-mail</DialogTitle>
                        <DialogDescription>
                            La passkey va être créée sur cet appareil. Entrez votre e-mail pour lier votre compte.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3">
                        <div className="space-y-1">
                            <Label htmlFor="email">E-mail</Label>
                            <Input
                                id="email"
                                type="email"
                                autoComplete="email"
                                placeholder="nom@domaine.fr"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={phase === "finishing"}
                            />
                        </div>
                        {error && <p className="text-sm text-red-600">{error}</p>}
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => resetIfClosed(false)} disabled={phase === "finishing"}>
                            Annuler
                        </Button>
                        <Button onClick={finish} disabled={!email || phase === "finishing"}>
                            {phase === "finishing" ? "Création en cours…" : "Créer la passkey"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Optional non-blocking inline error for the initial creation step */}
            {error && phase === "idle" && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </>
    );
}