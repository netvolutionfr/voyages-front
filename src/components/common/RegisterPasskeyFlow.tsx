// RegisterPasskeyFlow.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    beginRegistrationOneStep,
    type CredentialCreationResponse,
    finishRegistrationOneStep,
    type RegistrationOptionsPayload
} from "@/auth/passkeys";

type Phase = "idle" | "creating" | "email" | "finishing";

export function RegisterPasskeyFlow({
                                        disabled,
                                        onSuccess,
                                    }: {
    disabled?: boolean;
    onSuccess: () => void;
}) {
    const [phase, setPhase] = useState<Phase>("idle");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [credResponse, setCredResponse ] = useState<CredentialCreationResponse | null>(null);
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | null>(null);

    const start = async () => {
        try {
            setError(null);
            setPhase("creating");
            // 1) Create passkey immediately (no dialog yet)
            const cred: CredentialCreationResponse = await beginRegistrationOneStep();
            setCredResponse(cred);
            // 2) Open dialog ONLY AFTER creation to collect email
            setPhase("email");
            setDialogOpen(true);
        } catch (e) {
            setPhase("idle");
            setError(e instanceof Error ? e.message : "Échec de la création de la passkey");
        }
    };

    const finish = async () => {
        if (!credResponse) return;
        try {
            setError(null);
            setPhase("finishing");
            const registrationRequest = {
                username: email,
                userId: credResponse.rawId,
                credential: credResponse
            }
            await finishRegistrationOneStep({ email, displayName: null, registrationRequest} as RegistrationOptionsPayload);
            setDialogOpen(false);
            setPhase("idle");
            setEmail("");
            setCredResponse(null);
            onSuccess();
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
            setCredResponse(null);
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
                            La passkey est créée sur cet appareil. Entrez votre e-mail pour lier votre compte.
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
                            {phase === "finishing" ? "Association…" : "Associer"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Optional non-blocking inline error for the initial creation step */}
            {error && phase === "idle" && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </>
    );
}