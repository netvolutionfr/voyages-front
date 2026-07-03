import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import { Button } from "@/components/ui/button.tsx";
import LoadingSpinner from "@/components/common/LoadingSpinner.tsx";
import { fetchDataExport } from "@/api/rgpd.ts";
import AccountDeletionCard from "@/pages/profil/AccountDeletionCard.tsx";
import { IconDownload, IconInfoCircle } from "@tabler/icons-react";

/** Déclenche le téléchargement d'un JSON en mémoire, sans jamais naviguer sur le blob
 *  (un blob same-origin ouvert dans un onglet peut être interprété comme du HTML). */
function downloadJson(data: unknown, filename: string) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

const MesDonnees = () => {
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState<{
        registrations: number;
        documents: number;
        hasHealthForm: boolean;
    } | null>(null);

    const handleExport = async () => {
        setLoading(true);
        try {
            const data = await fetchDataExport();
            downloadJson(data, `voyages-export-${data.profile.publicId}.json`);
            setSummary({
                registrations: data.trips.registrations.length,
                documents: data.documents.length,
                hasHealthForm: data.healthForm !== null,
            });
            toast.success("Export téléchargé");
        } catch {
            toast.error("Impossible de générer l'export pour le moment");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-lg space-y-6">
        <Card className="shadow-none">
            <CardHeader>
                <CardTitle>Mes données</CardTitle>
                <CardDescription>
                    Téléchargez une copie de toutes les données vous concernant, conformément au droit d'accès du RGPD.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Alert>
                    <IconInfoCircle />
                    <AlertTitle>Contenu de l'export</AlertTitle>
                    <AlertDescription>
                        Cet export inclut l'identité (nom, email) de vos contacts familiaux enregistrés (parent
                        responsable ou enfants liés). Les fichiers de documents ne sont pas inclus : seules leurs
                        métadonnées le sont — téléchargez-les individuellement depuis la page Documents.
                    </AlertDescription>
                </Alert>

                <Button onClick={handleExport} disabled={loading}>
                    {loading ? <LoadingSpinner /> : (
                        <>
                            <IconDownload className="mr-2" />
                            Télécharger mes données (JSON)
                        </>
                    )}
                </Button>

                {summary && (
                    <p className="text-sm text-muted-foreground">
                        Export généré : {summary.registrations} inscription(s), {summary.documents} document(s)
                        {summary.hasHealthForm ? ", fiche sanitaire incluse" : ""}.
                    </p>
                )}
            </CardContent>
        </Card>

        <AccountDeletionCard />

        <p className="text-xs text-muted-foreground">
            Pour en savoir plus sur vos droits et leur exercice, consultez les{" "}
            <Link to="/mentions-legales" className="underline">
                mentions légales et la politique de protection des données
            </Link>
            .
        </p>
        </div>
    );
};

export default MesDonnees;
