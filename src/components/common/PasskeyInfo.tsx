import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lightbulb } from "lucide-react";

/**
 * PasskeyInfo — bloc d'information avec texte fluide
 */
export default function PasskeyInfo() {
    return (
        <Alert
            role="status"
            aria-live="polite"
            className="flex items-start gap-3 border-l-4 border-l-amber-500 bg-amber-50 dark:bg-amber-950/30"
        >
            <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div className="flex-1">
                <AlertTitle className="font-semibold text-amber-800">Astuce</AlertTitle>
                <AlertDescription>
                    Une passkey vous permet de vous connecter sans mot de passe. Elle utilise la sécurité
                    de votre téléphone ou ordinateur (empreinte digitale, Face ID, etc.).
                </AlertDescription>
            </div>
        </Alert>
    );
}