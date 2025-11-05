import * as React from "react";
import {type HttpError, useOne} from "@refinedev/core";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {CheckCircle2, AlertCircle, FileText, FolderOpen, Clock, ScanSearch} from "lucide-react";
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
    const pendingTypeIdRef = React.useRef<number | null>(null); // mémorise le type pendant l’ouverture du sélecteur
    const [uploadingTypeId, setUploadingTypeId] = React.useState<number | null>(null);
    const [uploadError, setUploadError] = React.useState<string | null>(null);

    /* Tri UX: requis d’abord, puis fournis, puis label */
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
        input.value = ""; // reset (permet re-sélection du même fichier)
        input.accept = accept?.length ? accept.join(",") : "";
        input.click();
    }

    /* === Nouvelle version: upload direct multipart → /api/me/documents/upload === */
    async function handleFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
        try {
            const file = e.target.files?.[0];
            const selectedTypeId = pendingTypeIdRef.current;
            if (!file || selectedTypeId == null) {
                // Annulation (Esc/fermeture) → ne pas bloquer l’UI
                return;
            }

            setUploadingTypeId(selectedTypeId);

            const item = (docs?.items || []).find(i => i.documentType.id === selectedTypeId);
            if (!item) throw new Error("Type de document introuvable.");
            const dt = item.documentType;

            // Validations côté front (côté back fait foi)
            if (dt.acceptedMime?.length && !dt.acceptedMime.includes(file.type)) {
                throw new Error(`Type non accepté. Attendus: ${dt.acceptedMime.join(", ")}`);
            }
            if (dt.maxSizeMb && file.size > dt.maxSizeMb * 1024 * 1024) {
                throw new Error(`Fichier trop volumineux (max ${dt.maxSizeMb} Mo).`);
            }

            // Appel direct multipart
            const fd = new FormData();
            fd.append("documentTypeId", String(dt.id));
            fd.append("file", file, file.name);

            await api.post("/me/documents/upload", fd /* ne pas forcer Content-Type: le navigateur gère la boundary */);

            await refetch();
        } catch (err) {
            setUploadError(err instanceof Error ? err.message : "Téléversement impossible.");
        } finally {
            // reset propre quel que soit le chemin (succès, erreur, annulation)
            pendingTypeIdRef.current = null;
            setUploadingTypeId(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    }

    if (isLoading) {
        return (
            <div className="container mx-auto max-w-5xl p-4 space-y-4">
                <Skeleton className="h-8 w-1/2" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-3">
                        <Skeleton className="h-5 w-2/3" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                    <div className="space-y-3">
                        <Skeleton className="h-28 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (isError || !docs) {
        return (
            <div className="container mx-auto max-w-5xl p-4">
                <Alert variant="destructive">
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
        <div className="container mx-auto max-w-5xl p-4 space-y-6">
            {/* En-tête */}
            <div>
                <h1 className="text-2xl font-semibold">Mes documents</h1>
                <p className="text-sm text-muted-foreground">
                    Ces documents peuvent être requis pour vos voyages en cours/à venir.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Colonne principale */}
                <div className="md:col-span-2 space-y-4">
                    {/* Résumé */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-medium">Résumé</h2>
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary">{totalTrips} voyage(s)</Badge>
                                    <Badge variant={totalMissing > 0 ? "destructive" : "default"}>
                                        {totalMissing}/{totalRequired} manquant(s)
                                    </Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {totalTrips > 0 ? (
                                <>
                                    <div className="text-sm text-muted-foreground">Voyages impactant vos formalités :</div>
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
                                <div className="text-sm text-muted-foreground">Aucun voyage en cours ne requiert de documents.</div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Liste des documents */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-medium">Documents</h2>
                                <div className="text-sm text-muted-foreground">{items.length} élément(s)</div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {items.length === 0 ? (
                                <p className="text-muted-foreground">Aucun document à afficher.</p>
                            ) : (
                                <ul className="space-y-3">
                                    {items.map((it) => {
                                        const dt = it.documentType;
                                        const providedIcon = it.provided ? (
                                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                        ) : (
                                            <AlertCircle className="h-4 w-4 text-amber-600" />
                                        );

                                        const providedText = it.provided
                                            ? `Fourni${it.providedAt ? ` le ${fmtDateTime(it.providedAt)}` : ""}`
                                            : "Non fourni";

                                        const last = it.lastObject ?? null;

                                        return (
                                            <li key={dt.id} className="rounded-lg border p-3">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-start gap-2">
                                                        <FileText className="h-4 w-4 mt-0.5" />
                                                        <div>
                                                            <div className="font-medium leading-snug">{dt.label || dt.code || "Document"}</div>
                                                            <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                                                                {providedIcon}
                                                                <span>{providedText}</span>
                                                                {last?.size != null && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <span>{bytesToHuman(last.size)}</span>
                                                                    </>
                                                                )}
                                                                {last?.mime && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <span>{last.mime}</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap gap-1.5 shrink-0">
                                                        <Badge variant={it.required ? "default" : "secondary"}>
                                                            {it.required ? "Obligatoire" : "Optionnel"}
                                                        </Badge>
                                                        <Badge variant="outline">{dt.kind}</Badge>
                                                        {typeof dt.maxSizeMb === "number" && (
                                                            <Badge variant="outline" className="inline-flex items-center gap-1">
                                                                <Clock className="h-3.5 w-3.5" />
                                                                {dt.maxSizeMb} Mo
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Meta */}
                                                <div className="mt-2 text-xs text-muted-foreground flex flex-wrap gap-3">
                                                    {dt.acceptedMime?.length ? <span>Types acceptés : {dt.acceptedMime.join(", ")}</span> : null}
                                                    {it.requiredByTrips?.length ? (
                                                        <span>Requis pour : {it.requiredByTrips.map((r) => r.label).join(", ")}</span>
                                                    ) : null}
                                                </div>

                                                {/* Actions */}
                                                <div className="mt-3 flex items-center gap-2">
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        className={cn("gap-1")}
                                                        disabled={dt.kind !== "FILE" || uploadingTypeId === dt.id}
                                                        onClick={() => pickFileForType(dt.id, dt.acceptedMime || [])}
                                                    >
                                                        <FolderOpen className="h-4 w-4" />
                                                        {uploadingTypeId === dt.id ? "Envoi…" : it.provided ? "Mettre à jour" : "Téléverser"}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={!last?.previewable}
                                                        onClick={() =>
                                                            preview.open(
                                                                last!.id,
                                                                last!.mime ?? it.documentType?.acceptedMime?.[0],
                                                                it.documentType?.label
                                                            )
                                                        }
                                                    >
                                                        <ScanSearch />
                                                    </Button>
                                                </div>

                                                {/* Avertissements éventuels */}
                                                {it.warnings?.length ? (
                                                    <div className="mt-3 text-xs">
                                                        {it.warnings.map((w) => (
                                                            <div key={w.code} className="text-amber-700">
                                                                • {w.message}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : null}
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </CardContent>
                        <CardFooter className="text-xs text-muted-foreground">
                            Les documents fournis une fois peuvent servir pour plusieurs voyages, sous réserve de validité.
                        </CardFooter>
                    </Card>

                    {/* Erreur d'upload */}
                    {uploadError && (
                        <Alert variant="destructive">
                            <AlertTitle>Erreur d’envoi</AlertTitle>
                            <AlertDescription>{uploadError}</AlertDescription>
                        </Alert>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <h3 className="font-medium">Voyages concernés</h3>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            {docs.trip.length ? (
                                <ul className="space-y-2">
                                    {docs.trip.map((t) => {
                                        const miss = docs.missing?.byTrip?.find((x) => x.tripId === t.id)?.missing ?? 0;
                                        return (
                                            <li key={t.id} className="flex items-center justify-between">
                                                <span className="truncate">{t.title}</span>
                                                <Badge variant={miss > 0 ? "destructive" : "secondary"}>{miss} manquant(s)</Badge>
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <p className="text-muted-foreground">Aucun voyage actif.</p>
                            )}
                        </CardContent>
                    </Card>

                    {totalMissing > 0 && (
                        <Alert>
                            <AlertTitle className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                Documents manquants
                            </AlertTitle>
                            <AlertDescription>{totalMissing} document(s) requis à fournir pour vos voyages.</AlertDescription>
                        </Alert>
                    )}
                </div>
            </div>

            {/* Input de fichier caché (unique) */}
            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChosen}
            />

            {/* Dialog d’aperçu (iframe/img) */}
            <DocumentPreviewDialog state={preview.state} onClose={preview.close} />
        </div>
    );
}