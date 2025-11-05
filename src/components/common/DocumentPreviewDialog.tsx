import * as React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import {apiFetch} from "@/auth/http.ts";

type PreviewState = {
    open: boolean;
    url?: string;      // /api/... ou URL présignée
    mime?: string;     // ex: image/png, application/pdf
    title?: string;
};

// eslint-disable-next-line react-refresh/only-export-components
export function useDocumentPreview() {
    const [state, setState] = React.useState<PreviewState>({ open: false });

    const open = (docPublicId: string, mime?: string, title?: string) => {
        const url = `/documents/${encodeURIComponent(docPublicId)}/preview`;
        setState({ open: true, url, mime, title });
    };

    const close = () => setState((s) => ({ ...s, open: false }));

    return { state, open, close };
}

export function DocumentPreviewDialog({ state, onClose }: { state: PreviewState; onClose: () => void }) {
    const [blobUrl, setBlobUrl] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [resolvedMime, setResolvedMime] = React.useState<string | undefined>(state.mime);

    const isImage = resolvedMime?.startsWith("image/");
    const isPdf = resolvedMime === "application/pdf";

    // Nettoyage du blob à la fermeture/changement
    React.useEffect(() => {
        return () => {
            if (blobUrl) {
                URL.revokeObjectURL(blobUrl);
            }
        };
    }, [blobUrl]);

    // Charge le blob quand on ouvre / quand l’URL change
    React.useEffect(() => {
        let cancelled = false;

        async function fetchBlob() {
            if (!state.open || !state.url) return;
            setLoading(true);
            setError(null);

            // nettoie l’ancien blob si on relance
            if (blobUrl) {
                URL.revokeObjectURL(blobUrl);
                setBlobUrl(null);
            }

            try {
                const resp: Response = await apiFetch(state.url);
                if (resp && resp.ok) {
                    const blob = await resp.blob();
                    if (cancelled) return;
                    const url = URL.createObjectURL(blob);
                    setBlobUrl(url);
                    if (!state.mime) {
                        setResolvedMime(blob.type || resp.headers.get("Content-Type") || "application/octet-stream");
                    } else {
                        setResolvedMime(state.mime);
                    }
                    setLoading(false);
                    return;
                }

                // Si aucun des deux modes n’est supporté par ton client, on tente une erreur explicite
                throw new Error("Ton client API ne supporte pas encore le mode blob (ajoute responseType: 'blob' ou getRaw).");
            } catch (e) {
                if (cancelled) return;
                setError(e instanceof Error ? e.message : "Impossible de récupérer le document.");
                setLoading(false);
            }
        }

        fetchBlob();

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.open, state.url]);

    // bouton "Ouvrir dans un onglet" : on réutilise le blobUrl pour ouvrir sans auth header
    const handleOpenInTab = () => {
        if (blobUrl) {
            window.open(blobUrl, "_blank", "noreferrer");
        }
    };

    // Reset MIME si on ferme le dialog (pour que la prochaine ouverture recalcule)
    React.useEffect(() => {
        if (!state.open) {
            setResolvedMime(state.mime);
            if (blobUrl) {
                URL.revokeObjectURL(blobUrl);
                setBlobUrl(null);
            }
            setLoading(false);
            setError(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.open]);

    return (
        <Dialog open={state.open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-[95vw] md:max-w-5xl h-[85vh] p-0 overflow-hidden">
                <DialogHeader className="px-4 py-3">
                    <DialogTitle className="truncate">
                        {state.title ?? "Aperçu du document"}
                    </DialogTitle>

                    {/* Keep DialogDescription as plain text only */}
                    <DialogDescription className="truncate">
                        {resolvedMime ?? "—"}
                    </DialogDescription>

                    {/* Actions row (separate container, not inside DialogDescription) */}
                    <div className="mt-2 flex items-center justify-end">
                        <Button variant="ghost" size="sm" onClick={handleOpenInTab} disabled={!blobUrl}>
                            Ouvrir dans un onglet <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="w-full h-[calc(85vh-96px)] bg-muted/30 flex items-center justify-center">
                    {!state.url ? (
                        <div className="text-sm text-muted-foreground p-6">Aucune ressource à afficher.</div>
                    ) : loading ? (
                        <div className="text-sm text-muted-foreground p-6">Chargement…</div>
                    ) : error ? (
                        <div className="text-sm text-red-600 p-6">Erreur de prévisualisation : {error}</div>
                    ) : !blobUrl ? (
                        <div className="text-sm text-muted-foreground p-6">Document indisponible.</div>
                    ) : isImage ? (
                        <img
                            src={blobUrl}
                            alt={state.title ?? "aperçu"}
                            className="max-w-full max-h-full object-contain"
                        />
                    ) : isPdf ? (
                        <embed
                            src={blobUrl}
                            type={resolvedMime || "application/pdf"}
                            className="w-full h-full"
                        />
                    ) : (
                        <div className="text-sm text-muted-foreground p-6">
                            Type non pris en charge pour l’aperçu.
                            <Button variant="link" className="pl-2" onClick={handleOpenInTab} disabled={!blobUrl}>
                                Télécharger / ouvrir
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}