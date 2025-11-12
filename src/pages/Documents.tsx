import * as React from "react";
import {type HttpError, useOne} from "@refinedev/core";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {CheckCircle2, AlertCircle, FileText, Upload, Clock, ScanSearch, Info} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/auth/api.ts";
import { DocumentPreviewDialog, useDocumentPreview } from "@/components/common/DocumentPreviewDialog.tsx";

/* ==== Types (alignés sur OpenAPI) ==== */
type TripSummaryDTO = { id: number; title: string; countryId: number };
type RequiredByTripsDTO = { tripId: number; label: string };

type DocumentObjectDTO = {
    id: string;
    size: number | null;
    mime: string | null;
    sha256: string | null;
    status: string | null;
    previewable: boolean | null;
};

type DocumentTypeDetailDTO = {
    id: number;
    code: string;
    label: string;
    kind: string; // "FILE" | "FORM"
    acceptedMime: string[];
    maxSizeMb: number | null;
    scope: string; // "TRIP" | "GENERAL"
};

type DocumentWarningDTO = { code: string; message: string };

type DocumentItemDTO = {
    documentType: DocumentTypeDetailDTO;
    required: boolean;
    requiredByTrips: RequiredByTripsDTO[];
    provided: boolean;
    providedAt?: string;
    lastObject?: DocumentObjectDTO | null;
    warnings: DocumentWarningDTO[];
};

type TripMissingDocumentDTO = { tripId: number; missing: number };

type MissingDocumentDTO = {
    totalRequired: number;
    totalMissing: number;
    byTrip: TripMissingDocumentDTO[];
};

type DocumentsDTO = {
    userId: number;
    trip: TripSummaryDTO[];
    items: DocumentItemDTO[];
    missing: MissingDocumentDTO;
};

/* ==== Helpers ==== */
function fmtDateTime(d?: string): string {
    if (!d) return "";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "";
    return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(dt);
}

function bytesToHuman(n?: number | null): string {
    if (n == null) return "—";
    const units = ["o", "Ko", "Mo", "Go", "To"];
    let i = 0;
    let val = n;
    while (val >= 1024 && i < units.length - 1) {
        val /= 1024;
        i++;
    }
    return `${val.toFixed(val < 10 ? 1 : 0)} ${units[i]}`;
}

/* ==== Composant principal ==== */
export default function Documents() {
    const { data, isLoading, isError, error, refetch } = useOne<DocumentsDTO, HttpError>({
        resource: "me/documents",
        id: "current",
    });
    const docs = data?.data;

    const preview = useDocumentPreview();

    /* Téléversement: état + input caché */
    const fileInputRef = React.useRef<HTMLInputElement | null>(null);
    const pendingTypeIdRef = React.useRef<number | null>(null);
    const [uploadingTypeId, setUploadingTypeId] = React.useState<number | null>(null);
    const [uploadError, setUploadError] = React.useState<string | null>(null);

    /* Tri UX: requis d'abord, puis fournis, puis label */
    const items = React.useMemo(() => {
        const list = docs?.items ?? [];
        return [...list].sort((a, b) => {
            if (a.required !== b.required) return a.required ? -1 : 1;
            if (a.provided !== b.provided) return a.provided ? -1 : 1;
            const la = a.documentType.label?.toLocaleLowerCase?.("fr-FR") ?? "";
            const lb = b.documentType.label?.toLocaleLowerCase?.("fr-FR") ?? "";
            return la.localeCompare(lb);
        });
    }, [docs]);

    /* Ouvre le sélecteur de fichier pour un type donné */
    function pickFileForType(typeId: number, accept: string[]) {
        setUploadError(null);
        pendingTypeIdRef.current = typeId;
        const input = fileInputRef.current;
        if (!input) return;
        input.value = "";
        input.accept = accept?.length ? accept.join(",") : "";
        input.click();
    }

    /* Upload direct multipart */
    async function handleFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
        try {
            const file = e.target.files?.[0];
            const selectedTypeId = pendingTypeIdRef.current;
            if (!file || selectedTypeId == null) {
                return;
            }

            setUploadingTypeId(selectedTypeId);

            const item = (docs?.items || []).find(i => i.documentType.id === selectedTypeId);
            if (!item) throw new Error("Type de document introuvable.");
            const dt = item.documentType;

            if (dt.acceptedMime?.length && !dt.acceptedMime.includes(file.type)) {
                throw new Error(`Type non accepté. Attendus: ${dt.acceptedMime.join(", ")}`);
            }
            if (dt.maxSizeMb && file.size > dt.maxSizeMb * 1024 * 1024) {
                throw new Error(`Fichier trop volumineux (max ${dt.maxSizeMb} Mo).`);
            }

            const fd = new FormData();
            fd.append("documentTypeId", String(dt.id));
            fd.append("file", file, file.name);

            await api.post("/me/documents/upload", fd);
            await refetch();
        } catch (err) {
            setUploadError(err instanceof Error ? err.message : "Téléversement impossible.");
        } finally {
            pendingTypeIdRef.current = null;
            setUploadingTypeId(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    }

    if (isLoading) {
        return (
            <div className="container mx-auto max-w-6xl p-4 py-8 space-y-6">
                <div className="space-y-2">
                    <Skeleton className="h-9 w-64" />
                    <Skeleton className="h-20 w-full" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-40 w-full" />
                        <Skeleton className="h-96 w-full" />
                    </div>
                    <div className="space-y-6">
                        <Skeleton className="h-64 w-full" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (isError || !docs) {
        return (
            <div className="container mx-auto max-w-6xl p-4 py-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Erreur</AlertTitle>
                    <AlertDescription>
                        {(error as HttpError)?.message ?? "Impossible de charger vos documents."}
                    </AlertDescription>
                </Alert>
                <div className="mt-4">
                    <Button variant="secondary" onClick={() => refetch()}>
                        Réessayer
                    </Button>
                </div>
            </div>
        );
    }

    const totalTrips = docs.trip.length;
    const totalRequired = docs.missing?.totalRequired ?? 0;
    const totalMissing = docs.missing?.totalMissing ?? 0;

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto max-w-6xl p-4 py-8 space-y-6">
                {/* En-tête */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Mes documents</h1>
                    <div className="flex gap-3 rounded-lg border bg-muted/50 p-4">
                        <Info className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Ces documents peuvent être requis pour vos voyages en cours ou à venir. Assurez-vous de les téléverser avant les dates limites.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Colonne principale */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Résumé */}
                        <div className="rounded-lg border bg-card shadow-sm">
                            <div className="border-b bg-muted/50 px-6 py-4">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <h2 className="text-lg font-semibold">Vue d'ensemble</h2>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Badge variant="secondary">{totalTrips} voyage(s)</Badge>
                                        <Badge variant={totalMissing > 0 ? "destructive" : "default"}>
                                            {totalMissing}/{totalRequired} manquant(s)
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                {totalTrips > 0 ? (
                                    <>
                                        <p className="text-sm text-muted-foreground">Voyages concernés par vos formalités :</p>
                                        <div className="flex flex-wrap gap-2">
                                            {docs.trip.map((t) => {
                                                const miss = docs.missing?.byTrip?.find((x) => x.tripId === t.id)?.missing ?? 0;
                                                return (
                                                    <Badge key={t.id} variant={miss > 0 ? "destructive" : "secondary"}>
                                                        {t.title} {miss > 0 ? `• ${miss} manquant(s)` : ""}
                                                    </Badge>
                                                );
                                            })}
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-sm text-muted-foreground">Aucun voyage en cours ne requiert de documents.</p>
                                )}
                            </div>
                        </div>

                        {/* Liste des documents */}
                        <div className="rounded-lg border bg-card shadow-sm">
                            <div className="border-b bg-muted/50 px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold">Documents</h2>
                                    <span className="text-sm text-muted-foreground">{items.length} élément(s)</span>
                                </div>
                            </div>
                            <div className="p-6">
                                {items.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">Aucun document à afficher.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {items.map((it) => {
                                            const dt = it.documentType;
                                            const last = it.lastObject ?? null;

                                            return (
                                                <div key={dt.id} className="rounded-lg border bg-card p-4 space-y-3">
                                                    {/* En-tête */}
                                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                                            <FileText className="h-5 w-5 mt-0.5 text-muted-foreground flex-shrink-0" />
                                                            <div className="flex-1 min-w-0">
                                                                <h3 className="font-medium leading-tight">{dt.label || dt.code || "Document"}</h3>
                                                                <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground flex-wrap">
                                                                    {it.provided ? (
                                                                        <>
                                                                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                                                            <span>Fourni{it.providedAt ? ` le ${fmtDateTime(it.providedAt)}` : ""}</span>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                                                                            <span>Non fourni</span>
                                                                        </>
                                                                    )}
                                                                    {last?.size != null && (
                                                                        <>
                                                                            <span>•</span>
                                                                            <span>{bytesToHuman(last.size)}</span>
                                                                        </>
                                                                    )}
                                                                    {last?.mime && (
                                                                        <>
                                                                            <span>•</span>
                                                                            <span>{last.mime.split('/')[1]?.toUpperCase()}</span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Badges */}
                                                        <div className="flex flex-wrap gap-1.5 items-start sm:items-center sm:justify-end">
                                                            <Badge variant={it.required ? "default" : "secondary"}>
                                                                {it.required ? "Obligatoire" : "Optionnel"}
                                                            </Badge>
                                                            <Badge variant="outline">{dt.kind}</Badge>
                                                            {typeof dt.maxSizeMb === "number" && (
                                                                <Badge variant="outline" className="inline-flex items-center gap-1">
                                                                    <Clock className="h-3 w-3" />
                                                                    {dt.maxSizeMb} Mo
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Métadonnées */}
                                                    {(dt.acceptedMime?.length > 0 || it.requiredByTrips?.length > 0) && (
                                                        <div className="text-xs text-muted-foreground space-y-1 pl-8">
                                                            {dt.acceptedMime?.length ? <div>Types acceptés : {dt.acceptedMime.join(", ")}</div> : null}
                                                            {it.requiredByTrips?.length ? (
                                                                <div>Requis pour : {it.requiredByTrips.map((r) => r.label).join(", ")}</div>
                                                            ) : null}
                                                        </div>
                                                    )}

                                                    {/* Actions */}
                                                    <div className="flex items-center gap-2 pl-8">
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            className={cn("gap-2")}
                                                            disabled={dt.kind !== "FILE" || uploadingTypeId === dt.id}
                                                            onClick={() => pickFileForType(dt.id, dt.acceptedMime || [])}
                                                        >
                                                            <Upload className="h-4 w-4" />
                                                            {uploadingTypeId === dt.id ? "Envoi…" : it.provided ? "Mettre à jour" : "Téléverser"}
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="gap-2"
                                                            disabled={!last?.previewable}
                                                            onClick={() =>
                                                                preview.open(
                                                                    last!.id,
                                                                    last!.mime ?? it.documentType?.acceptedMime?.[0],
                                                                    it.documentType?.label
                                                                )
                                                            }
                                                        >
                                                            <ScanSearch className="h-4 w-4" />
                                                            Aperçu
                                                        </Button>
                                                    </div>

                                                    {/* Avertissements */}
                                                    {it.warnings?.length ? (
                                                        <div className="pl-8 space-y-1">
                                                            {it.warnings.map((w) => (
                                                                <div key={w.code} className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-500">
                                                                    <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                                                                    <span>{w.message}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : null}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                <p className="text-xs text-muted-foreground mt-4 pt-4 border-t">
                                    Les documents fournis une fois peuvent servir pour plusieurs voyages, sous réserve de validité.
                                </p>
                            </div>
                        </div>

                        {/* Erreur d'upload */}
                        {uploadError && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Erreur d'envoi</AlertTitle>
                                <AlertDescription>{uploadError}</AlertDescription>
                            </Alert>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Voyages concernés */}
                        <div className="rounded-lg border bg-card shadow-sm">
                            <div className="border-b bg-muted/50 px-6 py-4">
                                <h3 className="font-semibold">Voyages concernés</h3>
                            </div>
                            <div className="p-6">
                                {docs.trip.length ? (
                                    <div className="space-y-3">
                                        {docs.trip.map((t) => {
                                            const miss = docs.missing?.byTrip?.find((x) => x.tripId === t.id)?.missing ?? 0;
                                            return (
                                                <div key={t.id} className="flex items-center justify-between gap-3">
                                                    <span className="text-sm truncate flex-1">{t.title}</span>
                                                    <Badge variant={miss > 0 ? "destructive" : "secondary"}>
                                                        {miss} manquant(s)
                                                    </Badge>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">Aucun voyage actif</p>
                                )}
                            </div>
                        </div>

                        {/* Alerte documents manquants */}
                        {totalMissing > 0 && (
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Documents manquants</AlertTitle>
                                <AlertDescription>
                                    {totalMissing} document(s) requis à fournir pour vos voyages.
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Info pratique */}
                        <div className="rounded-lg border bg-muted/30 p-4">
                            <div className="flex gap-3">
                                <Info className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <p className="font-medium text-foreground">Besoin d'aide ?</p>
                                    <p>Contactez l'administration si vous avez des questions sur les documents requis.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Input de fichier caché */}
            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChosen}
            />

            {/* Dialog d'aperçu */}
            <DocumentPreviewDialog state={preview.state} onClose={preview.close} />
        </div>
    );
}