import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { IconBulb } from "@tabler/icons-react";

/**
 * PasskeyInfo — bloc d'information avec texte fluide
 */
export default function PasskeyInfo() {
    return (
        <Alert role="status" aria-live="polite" className="bg-muted/50">
            <IconBulb />
            <AlertTitle>Astuce</AlertTitle>
            <AlertDescription>
                Une passkey vous permet de vous connecter sans mot de passe. Elle utilise la sécurité
                de votre téléphone ou ordinateur (empreinte digitale, Face ID, etc.).
            </AlertDescription>
        </Alert>
    );
}
