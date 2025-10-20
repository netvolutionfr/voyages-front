import { useEffect, useMemo, useState } from "react";
import {
    InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot,
} from "@/components/ui/input-otp";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {readAuth, saveAuth /*, saveAuth*/} from "@/auth/token";
import { authApi } from "@/auth/passkeys";
import {useNavigate} from "react-router-dom";
import {getIdentityFromJwt, setIdentityCache} from "@/auth/session.ts";

export default function OtpPage() {
    const navigate = useNavigate();
    const [otp, setOtp] = useState("");
    const [email, setEmail] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // resend states
    const [resending, setResending] = useState(false);
    const [resendUsed, setResendUsed] = useState(false);
    const [resendMsg, setResendMsg] = useState<string | null>(null);

    // Normalise (supprime espaces, tirets, NBSP, etc.)
    const normalize = (v: string) => v.replace(/\D+/g, "").slice(0, 6);
    const normalizedOtp = useMemo(() => normalize(otp), [otp]);
    const canSubmit = normalizedOtp.length === 6 && !!email && !submitting;

    useEffect(() => {
        const auth = readAuth();
        const token = auth?.accessToken;
        if (!token) return;
        try {
            const [, payloadB64] = token.split(".");
            if (!payloadB64) return;
            const json = atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"));
            const payload = JSON.parse(decodeURIComponent(escape(json)));
            if (payload?.email) setEmail(payload.email);
        } catch {}
    }, []);

    const handleChange = (v: string) => setOtp(normalize(v));

    const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
        const text = e.clipboardData.getData("text") ?? "";
        const clean = normalize(text);
        if (clean) {
            e.preventDefault();
            setOtp(clean);
        }
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!canSubmit) return;
        try {
            setSubmitting(true);
            setError(null);

            const res = await authApi(`/otp/verify`, {
                method: "POST",
                body: JSON.stringify({ email, otp: normalizedOtp }),
            });
            if (!res.ok) {
                const txt = await res.text();
                throw new Error(txt || "Vérification OTP échouée");
            }

            // l'API renvoie un nouveau JWT ACTIVE :
            const data = await res.json();
            saveAuth({
                tokenType: data.token_type,
                accessToken: data.access_token,
                expiresIn: data.expires_in,
                refreshToken: data.refresh_token ?? null,
                refreshTokenExpiresIn: data.refresh_expires_in ?? null
            });
            setIdentityCache(getIdentityFromJwt());

            // rediriger vers l'accueil
            navigate("/", { replace: true });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur inattendue");
        } finally {
            setSubmitting(false);
        }
    };

    const handleResend = async () => {
        if (!email || resending || resendUsed) return;
        try {
            setResending(true);
            setError(null);
            setResendMsg(null);

            const res = await authApi(`/otp/resend`, {
                method: "POST",
                body: JSON.stringify({ email }),
            });
            if (!res.ok) {
                const txt = await res.text();
                throw new Error(txt || "Impossible de renvoyer le code");
            }

            setResendUsed(true); // désactive définitivement ce bouton
            setResendMsg("Nouveau code envoyé.");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erreur lors de l’envoi du code");
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen grid place-items-center p-6">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Vérification du code OTP</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {email && (
                            <p className="text-sm text-muted-foreground">
                                Un code a été envoyé à <span className="font-medium">{email}</span>.
                            </p>
                        )}

                        <div onPaste={handlePaste}>
                            <InputOTP
                                value={otp}
                                onChange={handleChange}
                                maxLength={6}
                                inputMode="numeric"
                                pattern="[0-9]*"
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
                        </div>

                        {error && <p className="text-sm text-red-600">{error}</p>}
                        {resendMsg && <p className="text-sm text-green-700">{resendMsg}</p>}

                        <Button type="submit" className="w-full" disabled={!canSubmit}>
                            {submitting ? "Vérification..." : "Valider"}
                        </Button>

                        <div className="flex items-center justify-center">
                            <Button
                                type="button"
                                variant="link"
                                onClick={handleResend}
                                disabled={!email || resending || resendUsed}
                                className="px-0"
                            >
                                {resendUsed ? "Code renvoyé" : resending ? "Envoi..." : "Renvoyer le code"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}