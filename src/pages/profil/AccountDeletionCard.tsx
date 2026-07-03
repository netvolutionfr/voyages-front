import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { Label } from "@/components/ui/label.tsx";
import {
    InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot,
} from "@/components/ui/input-otp.tsx";
import { confirmAccountDeletion, requestAccountDeletion } from "@/api/rgpd.ts";
import type { DeletionErrorCode } from "@/type/rgpd.ts";
import { ApiError } from "@/auth/api.ts";
import { clearAuth } from "@/auth/token.ts";
import { getIdentityFromJwt } from "@/auth/session.ts";
import { IconAlertTriangle } from "@tabler/icons-react";

/** Messages front pour les codes d'erreur stables du back. Tout code inconnu
 *  tombe sur le message générique : on n'affiche jamais un corps de réponse brut. */
const DELETION_ERROR_MESSAGES: Record<DeletionErrorCode, string> = {
    invalid_otp:
        "Code invalide, expiré ou déjà utilisé. Vérifiez le code reçu ou demandez-en un nouveau.",
    too_many_requests:
        "Trop de demandes rapprochées. Veuillez patienter avant de redemander un code.",
    student_self_erasure_forbidden:
        "La suppression n'est pas disponible pour les comptes élèves. Contactez l'établissement ou votre parent.",
    last_active_admin:
        "Impossible : vous êtes le dernier administrateur actif de l'application.",
    active_trip_registration:
        "Vous avez une inscription active à un voyage en cours ou à venir. Attendez son terme avant de supprimer votre compte.",
    guardian_of_active_student:
        "Vous êtes le contact responsable d'un élève encore actif. Ce lien doit être levé avant la suppression.",
};

const GENERIC_ERROR = "La suppression n'a pas pu aboutir. Réessayez plus tard ou contactez l'établissement.";

function deletionErrorCode(err: unknown): DeletionErrorCode | null {
    if (err instanceof ApiError) {
        const code = (err.data as { error?: string } | undefined)?.error;
        if (code && code in DELETION_ERROR_MESSAGES) return code as DeletionErrorCode;
    }
    return null;
}

const RESEND_COOLDOWN_S = 60;

const AccountDeletionCard = () => {
    // Rôle lu une fois au montage depuis le JWT ; masquage UI seulement,
    // le back refuse de toute façon (403 student_self_erasure_forbidden).
    const [role] = useState(() => getIdentityFromJwt()?.role);

    const [step, setStep] = useState<"idle" | "otp">("idle");
    const [consented, setConsented] = useState(false);
    const [otp, setOtp] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [cooldown]);

    if (role === "STUDENT") {
        return (
            <Card className="w-full max-w-lg shadow-none border-destructive/30">
                <CardHeader>
                    <CardTitle>Suppression du compte</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        La suppression de compte n'est pas disponible pour les comptes élèves. Contactez
                        l'établissement ou votre parent.
                    </p>
                </CardContent>
            </Card>
        );
    }

    const requestCode = async () => {
        setBusy(true);
        setError(null);
        try {
            await requestAccountDeletion();
            setStep("otp");
            setOtp("");
            setCooldown(RESEND_COOLDOWN_S);
        } catch (err) {
            const code = deletionErrorCode(err);
            setError(code ? DELETION_ERROR_MESSAGES[code] : GENERIC_ERROR);
            if (code === "too_many_requests") setCooldown(RESEND_COOLDOWN_S);
        } finally {
            setBusy(false);
        }
    };

    const confirmDeletion = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (otp.length !== 6 || busy) return;
        setBusy(true);
        setError(null);
        try {
            await confirmAccountDeletion(otp);
            // 204 : le back a supprimé le compte et effacé le cookie refresh_token.
            // Purge locale puis rechargement complet pour détruire tout état applicatif
            // résiduel (caches Refine, identité) — pas de logout Refine, la session n'existe plus.
            clearAuth();
            window.location.assign("/login");
        } catch (err) {
            const code = deletionErrorCode(err);
            setError(code ? DELETION_ERROR_MESSAGES[code] : GENERIC_ERROR);
            setOtp("");
            // Les refus bloquants (403/409) ne se résolvent pas avec un autre code :
            // retour à l'état initial au lieu de laisser croire qu'un retry suffira.
            if (code && code !== "invalid_otp" && code !== "too_many_requests") {
                setStep("idle");
                setConsented(false);
            }
            setBusy(false);
        }
        // Pas de setBusy(false) après succès : la page est en cours de rechargement.
    };

    return (
        <Card className="w-full max-w-lg shadow-none border-destructive/30">
            <CardHeader>
                <CardTitle>Suppression du compte</CardTitle>
                <CardDescription>
                    Droit à l'effacement (RGPD) : supprimez définitivement votre compte et toutes les données
                    associées.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Alert variant="destructive">
                    <IconAlertTriangle />
                    <AlertTitle>Action irréversible</AlertTitle>
                    <AlertDescription>
                        Seront définitivement supprimés : votre profil, vos documents, votre fiche sanitaire, vos
                        inscriptions aux voyages, vos liens familiaux et vos passkeys. Aucune récupération ne sera
                        possible.
                    </AlertDescription>
                </Alert>

                {step === "idle" ? (
                    <>
                        <div className="flex items-start gap-3">
                            <Checkbox
                                id="deletion-consent"
                                checked={consented}
                                onCheckedChange={(v) => setConsented(v === true)}
                            />
                            <Label htmlFor="deletion-consent" className="text-sm font-normal leading-snug">
                                Je comprends que cette action est irréversible et je souhaite supprimer mon compte.
                            </Label>
                        </div>

                        {error && <p className="text-sm text-destructive">{error}</p>}

                        <Button
                            variant="destructive"
                            disabled={!consented || busy || cooldown > 0}
                            onClick={requestCode}
                        >
                            {busy
                                ? "Envoi du code..."
                                : cooldown > 0
                                    ? `Patientez ${cooldown}s`
                                    : "Recevoir un code de confirmation"}
                        </Button>
                    </>
                ) : (
                    <form onSubmit={confirmDeletion} className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Un code à 6 chiffres a été envoyé à votre adresse email (valable ~10 minutes).
                            Saisissez-le pour confirmer définitivement la suppression.
                        </p>

                        <InputOTP
                            value={otp}
                            onChange={(v) => setOtp(v.replace(/\D+/g, "").slice(0, 6))}
                            maxLength={6}
                            inputMode="numeric"
                            pattern="[0-9]*"
                            autoComplete="one-time-code"
                        >
                            <InputOTPGroup>
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                            </InputOTPGroup>
                            <InputOTPSeparator />
                            <InputOTPGroup>
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                            </InputOTPGroup>
                        </InputOTP>

                        {error && <p className="text-sm text-destructive">{error}</p>}

                        <div className="flex items-center gap-3">
                            <Button type="submit" variant="destructive" disabled={otp.length !== 6 || busy}>
                                {busy ? "Suppression..." : "Supprimer définitivement mon compte"}
                            </Button>
                            <Button
                                type="button"
                                variant="link"
                                className="px-0"
                                disabled={busy || cooldown > 0}
                                onClick={requestCode}
                            >
                                {cooldown > 0 ? `Renvoyer le code (${cooldown}s)` : "Renvoyer le code"}
                            </Button>
                        </div>
                    </form>
                )}
            </CardContent>
        </Card>
    );
};

export default AccountDeletionCard;
