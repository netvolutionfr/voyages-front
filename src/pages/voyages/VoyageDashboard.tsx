// src/pages/voyages/VoyageDashboard.tsx
import * as React from "react";
import { useParams } from "react-router-dom";
import {
    useOne,
    useList,
} from "@refinedev/core";
import {
    Card, CardHeader, CardTitle, CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {DocumentPreviewDialog, useDocumentPreview} from "@/components/common/DocumentPreviewDialog.tsx";
import {FileUser, ScanSearch} from "lucide-react";
import HealthFormView from "@/components/HealthFormView.tsx";

// ---- Types (reprennent ceux du provider) ----
type DateRangeDTO = { from: string; to: string };
type CountryDTO = { id: number; name: string };
type SectionMiniDTO = { id: number; label: string };
type UserMiniDTO = {
    publicId: string;
    firstName: string;
    lastName: string;
    email?: string;
    telephone?: string;
    section?: SectionMiniDTO;
};
type DocumentsSummaryDTO = { required: number; provided: number; missing: number };
type TripRegistrationAdminViewDTO = {
    registrationId: number;
    registeredAt: string;
    status: string;
    user: UserMiniDTO;
    documentsSummary?: DocumentsSummaryDTO;
};
type TripDetailDTO = {
    id: number;
    title: string;
    description?: string;
    destination?: string;
    country?: CountryDTO;
    tripDates: DateRangeDTO;
    minParticipants?: number;
    maxParticipants?: number;
    coverPhotoUrl?: string;
};
type DocumentsAdminDTO = {
    userId: number;
    tripId: number;
    summary: DocumentsSummaryDTO;
    items: Array<{
        documentType: { id: number; code?: string; label: string };
        required: boolean;
        provided: boolean;
        providedAt?: string;
        lastObject?: { id: string; size: number; mime: string; previewable: boolean };
    }>;
};
type HealthFormAdminDTO = { exists: boolean; content?: string };

// ---- Utils ----
const formatDate = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString("fr-FR", { year: "numeric", month: "2-digit", day: "2-digit" });
};
const fullName = (u: UserMiniDTO) => `${u.lastName?.toUpperCase() ?? ""} ${u.firstName ?? ""}`.trim();
const statusColor = (status: string): string => {
    switch (status) {
        case "CONFIRMED":
        case "VALIDATED":
            return "bg-emerald-600";
        case "ENROLLED":
            return "bg-blue-600";
        case "PENDING":
            return "bg-amber-600";
        case "REJECTED":
        case "CANCELED":
            return "bg-rose-600";
        default:
            return "bg-slate-600";
    }
};

// ---- Composant principal ----
export default function VoyageDashboard() {
    const { id } = useParams<{ id: string }>();
    const tripId = Number(id);

    // Trip details
    const { data: tripOne, isLoading: tripLoading } = useOne<TripDetailDTO>({
        resource: "trips",
        id: tripId,
    });
    const trip = tripOne?.data;

    // Filtres UI
    const [q, setQ] = React.useState<string>("");
    const [status, setStatus] = React.useState<string>("ALL");
    const [sectionId, setSectionId] = React.useState<string>("ALL");

    // Sections (pour filtre)
    const { data: sectionsList } = useList<{ id: number; label: string }>({
        resource: "sections",
        pagination: { current: 1, pageSize: 200 },
        meta: {
            query: {
                activeOnly: true,
                sortKey: "yearLabel",
            },
        },
    });
    const sections = sectionsList?.data ?? [];

    // Inscriptions (server-side pagination simple; adapte si tu veux paginer dans l’UI)
    const { data: regsList, isLoading: regsLoading } = useList<TripRegistrationAdminViewDTO>({
        resource: "admin-registrations",
        pagination: { current: 1, pageSize: 200 },
        meta: {
            query: {
                includeDocSummary: true,
                tripId, // nécessite le support côté back ; sinon supprime-le et mets q=`trip:${tripId}`
                status: status === "ALL" ? undefined : status,
                sectionId: sectionId === "ALL" ? undefined : Number(sectionId),
                q: q.trim() || undefined,
            },
        },
    });
    const registrations = regsList?.data ?? [];

    return (
        <div className="space-y-6">
            <Header trip={trip} loading={tripLoading} />

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Inscrits / documents</CardTitle>
                    <div className="flex items-center gap-2">
                        <Input
                            placeholder="Rechercher nom, email..."
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            className="w-64"
                        />
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="w-44">
                                <SelectValue placeholder="Statut" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Tous statuts</SelectItem>
                                <SelectItem value="PENDING">En attente</SelectItem>
                                <SelectItem value="VALIDATED">Validé</SelectItem>
                                <SelectItem value="ENROLLED">Inscrit</SelectItem>
                                <SelectItem value="CONFIRMED">Confirmé</SelectItem>
                                <SelectItem value="REJECTED">Rejeté</SelectItem>
                                <SelectItem value="CANCELED">Annulé</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={sectionId} onValueChange={setSectionId}>
                            <SelectTrigger className="w-56">
                                <SelectValue placeholder="Section" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Toutes sections</SelectItem>
                                {sections.map((s) => (
                                    <SelectItem key={s.id} value={String(s.id)}>{s.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>

                <CardContent>
                    {regsLoading ? <RegistrationsSkeleton /> : (
                        <RegistrationsTable tripId={tripId} registrations={registrations} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

// ---- Header voyage ----
function Header({ trip, loading }: { trip?: TripDetailDTO; loading: boolean }) {
    return (
        <Card>
            <CardContent className="p-6">
                {loading || !trip ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-6 w-1/2" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <h1 className="text-2xl font-semibold">{trip.title}</h1>
                            <div className="text-sm text-muted-foreground">
                                {trip.destination} {trip.country ? `• ${trip.country.name}` : ""}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm font-medium">Dates</div>
                            <div>{formatDate(trip.tripDates?.from)} → {formatDate(trip.tripDates?.to)}</div>
                        </div>
                        <div>
                            <div className="text-sm font-medium">Participants</div>
                            <div>Min {trip.minParticipants ?? "-"} • Max {trip.maxParticipants ?? "-"}</div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// ---- Tableau des inscriptions ----
function RegistrationsTable({
                                tripId,
                                registrations,
                            }: {
    tripId: number;
    registrations: TripRegistrationAdminViewDTO[];
}) {
    const [selected, setSelected] = React.useState<TripRegistrationAdminViewDTO | null>(null);

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Élève</TableHead>
                        <TableHead>Section</TableHead>
                        <TableHead>Inscription</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Documents</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {registrations.map((r) => {
                        const docs = r.documentsSummary;
                        const pct = docs && docs.required > 0
                            ? Math.round((docs.provided / docs.required) * 100)
                            : 0;

                        return (
                            <TableRow key={r.registrationId}>
                                <TableCell className="font-medium">
                                    {fullName(r.user)}
                                    <div className="text-xs text-muted-foreground">{r.user.email}</div>
                                </TableCell>
                                <TableCell>{r.user.section?.label ?? "-"}</TableCell>
                                <TableCell>{formatDate(r.registeredAt)}</TableCell>
                                <TableCell>
                  <span className={cn("text-xs text-white px-2 py-1 rounded", statusColor(r.status))}>
                    {r.status}
                  </span>
                                </TableCell>
                                <TableCell>
                                    {docs ? (
                                        <div className="min-w-[200px]">
                                            <div className="flex items-center justify-between text-xs mb-1">
                                                <span>{docs.provided}/{docs.required}</span>
                                                <span>{pct}%</span>
                                            </div>
                                            <Progress value={pct} />
                                        </div>
                                    ) : (
                                        <span className="text-xs text-muted-foreground">-</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button size="sm" variant="outline" onClick={() => setSelected(r)}>
                                        <FileUser />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                    {registrations.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                Aucun inscrit pour le moment.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            <StudentSheet
                tripId={tripId}
                registration={selected}
                onOpenChange={(open) => !open && setSelected(null)}
            />
        </>
    );
}

function RegistrationsSkeleton() {
    return (
        <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="grid grid-cols-6 gap-3 items-center">
                    <Skeleton className="h-5" />
                    <Skeleton className="h-5" />
                    <Skeleton className="h-5" />
                    <Skeleton className="h-5" />
                    <Skeleton className="h-5" />
                    <Skeleton className="h-8 justify-self-end w-20" />
                </div>
            ))}
        </div>
    );
}

// ---- Panneau latéral Élève ----
function StudentSheet({
                          tripId,
                          registration,
                          onOpenChange,
                      }: {
    tripId: number;
    registration: TripRegistrationAdminViewDTO | null;
    onOpenChange: (open: boolean) => void;
}) {
    const open = Boolean(registration);
    const user = registration?.user;

    // Documents
    const { data: docsOne, isLoading: docsLoading } = useOne<DocumentsAdminDTO>({
        resource: "admin-user-documents",
        id: user?.publicId ?? "0",
        queryOptions: { enabled: open && Boolean(user) },
        meta: { tripId },
    });

    // Fiche sanitaire
    const { data: healthOne, isLoading: healthLoading } = useOne<HealthFormAdminDTO>({
        resource: "admin-user-health",
        id: user?.publicId ?? "0",
        queryOptions: { enabled: open && Boolean(user) },
        meta: { tripId },
    });

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="w-[96vw] sm:max-w-5xl overflow-y-auto p-0 sm:p-0"
            >
                <SheetHeader>
                    <SheetTitle>{!registration || !user ? ("Aucune donnée") : (fullName(user))}</SheetTitle>
                </SheetHeader>

                {!registration || !user ? (
                    <div className="p-4 mt-6">Aucune donnée.</div>
                ) : (
                    <div className="p-4 sm:p-x-6 space-y-4">
                        {/* Infos élève */}
                        <Card>
                            <CardContent className="space-y-1">
                                <div className="text-sm text-muted-foreground">Section : {user.section?.label ?? "-"}</div>
                                <div className="text-sm text-muted-foreground">Email : {user.email ?? "-"}</div>
                                <div className="text-sm text-muted-foreground">Téléphone : {user.telephone ?? "-"}</div>
                                <div className="text-sm text-muted-foreground">Inscription : {formatDate(registration.registeredAt)}</div>
                                <div className="pt-2">
                  <span className={cn("text-xs text-white px-2 py-1 rounded", statusColor(registration.status))}>
                    {registration.status}
                  </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Onglets */}
                        <Tabs defaultValue="docs">
                            <TabsList>
                                <TabsTrigger value="docs">Documents</TabsTrigger>
                                <TabsTrigger value="health">Fiche sanitaire</TabsTrigger>
                            </TabsList>

                            <TabsContent value="docs" className="mt-4">
                                {docsLoading ? <Skeleton className="h-24" /> : (
                                    <DocumentsList data={docsOne?.data} />
                                )}
                            </TabsContent>

                            <TabsContent value="health" className="mt-4">
                                {healthLoading ? <Skeleton className="h-24" /> : (
                                    <HealthFormView data={healthOne?.data} />
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}

function DocumentsList({ data }: { data?: DocumentsAdminDTO }) {
    const preview = useDocumentPreview();

    return (
        <>
            <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                    Synthèse : {data?.summary?.provided ?? 0} / {data?.summary?.required ?? 0} fournis — manquants : {data?.summary?.missing ?? 0}
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Requis</TableHead>
                            <TableHead>Fourni</TableHead>
                            <TableHead>Dernier objet</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {(data?.items ?? [])
                            .filter((it) => it.required)
                            .map((it) => (
                            <TableRow key={it.documentType.id}>
                                <TableCell className="font-medium">{it.documentType.label}</TableCell>
                                <TableCell>{it.required ? <Badge variant="secondary">Oui</Badge> : "—"}</TableCell>
                                <TableCell>
                                    {it.provided ? (
                                        <Badge className="bg-emerald-600">Fourni</Badge>
                                    ) : (
                                        <Badge className="bg-rose-600">Manquant</Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {it.lastObject ? `${Math.round(it.lastObject.size / 1024)} Ko • ${it.lastObject.mime}` : "—"}
                                </TableCell>
                                <TableCell className="text-right">
                                    {it.lastObject?.previewable && it.lastObject.id ? (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => preview.open(it.lastObject!.id, it.lastObject!.mime, it.documentType.label)}
                                        >
                                            <ScanSearch />
                                        </Button>
                                    ) : (
                                        <span className="text-xs text-muted-foreground">—</span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                        {(data?.items ?? []).length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                    Aucun document.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <DocumentPreviewDialog state={preview.state} onClose={preview.close} />
        </>
    );
}
