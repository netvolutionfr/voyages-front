import React from "react";
import type {ColumnDef} from "@tanstack/react-table";
import {useTable} from "@refinedev/react-table";
import {Link, useList} from "@refinedev/core";
import {DataTable} from "@/components/ui/data-table.tsx";
import type {IVoyage} from "@/pages/voyages/IVoyage.ts";
import {voyagesColumns} from "@/pages/voyages/VoyagesColumns.tsx";
import {keycloak} from "@/providers/authProvider.ts";
import { Button } from "@/components/ui/button";
import {cn, formatCurrencyFromCents} from "@/lib/utils.ts";
import {Card, CardContent, CardFooter, CardHeader} from "@/components/ui/card.tsx";
import {Skeleton} from "@/components/ui/skeleton.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import LoadingSpinner from "@/components/common/LoadingSpinner.tsx";

function getCoverUrl(coverPhotoUrl?: string | null): string | undefined {
    if (!coverPhotoUrl) return undefined;
    if (/^https?:\/\//i.test(coverPhotoUrl)) return coverPhotoUrl;
    // Sinon : c'est une clé → base publique (ex : https://s3.voyages.siovision.fr/voyages/<key>)
    const base = import.meta.env.VITE_FILES_BASE || "";
    const sep = base.endsWith("/") ? "" : "/";
    return `${base}${sep}${coverPhotoUrl}`;
}

function formatDateRange(from?: Date, to?: Date) {
    if (!from || !to) return "";
    const f = new Date(from);
    const t = new Date(to);
    const fmt = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
    return `${fmt.format(f)} → ${fmt.format(t)}`;
}

const Voyages = () => {


    const columns =
        React.useMemo <ColumnDef <IVoyage>[]> (() => voyagesColumns, []);

    const userRoles: string[] = keycloak.tokenParsed?.realm_access?.roles || [];
    const isAdminOrTeacher = userRoles.includes("admin") || userRoles.includes("teacher");

    // Admin view: keep the existing management table
    const tableInstance = useTable({
        columns,
        refineCoreProps: {
            resource: "voyages",
        },
    });

    // Student view: list voyages open for registration (current date within the inscription window)
    const { data, isLoading: isLoadingList } = useList<IVoyage>({
        resource: "voyages",
        pagination: { pageSize: 12 },
        sorters: [{ field: "dateDepart", order: "asc" }],
    });

    const isLoading = isAdminOrTeacher
        ? tableInstance.refineCore.tableQuery?.isLoading
        : isLoadingList;

    if (isLoading) {
        if (isAdminOrTeacher) {
            return (<LoadingSpinner />)
        } else {
            return (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i} className="overflow-hidden">
                            <Skeleton className="h-40 w-full" />
                            <CardHeader className="space-y-2">
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-4 w-full mb-2" />
                                <Skeleton className="h-4 w-2/3" />
                            </CardContent>
                            <CardFooter>
                                <Skeleton className="h-9 w-24" />
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            );
        }
    }

    if (!isAdminOrTeacher) {
        // const voyagesOuverts = (data?.data || []).filter((v) => {
        //     const debut = new Date(v.datesInscription.from + 'T00:00:00Z');
        //     const fin = new Date(v.datesInscription.to + 'T23:59:59Z');
        //     return today >= debut && today <= fin;
        // });
        const voyages = data?.data || [];

        return (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {voyages.map((v) => {
                    const cover = getCoverUrl(v.coverPhotoUrl);
                    const prixFamilles = typeof v.participationDesFamilles === "number"
                        ? formatCurrencyFromCents(v.participationDesFamilles)
                        : "—";
                    const dateRange = formatDateRange(v.datesVoyage?.from, v.datesVoyage?.to);

                    return (
                        <Card key={v.id} className="overflow-hidden group hover:shadow-lg transition-shadow py-0">
                            {/* Image de couverture */}
                                {cover ? (
                                    <img
                                        src={cover}
                                        alt={`Couverture ${v.nom}`}
                                        className={cn(
                                            "h-full w-full object-cover transition-transform rounded-t-lg",
                                            "group-hover:scale-[1.02]"
                                        )}
                                        loading="lazy"
                                        style={{ aspectRatio: "500/300", objectFit: "cover" }}
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                        Pas d’image
                                    </div>
                                )}

                            {/* En-tête */}
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between gap-2">
                                    <h3 className="text-lg font-semibold leading-snug line-clamp-2">
                                        {v.nom}
                                    </h3>
                                    {v.pays?.nom && (
                                        <Badge variant="secondary" className="shrink-0">
                                            {v.pays.nom}
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {v.destination}
                                </p>
                            </CardHeader>

                            {/* Contenu */}
                            <CardContent className="space-y-2">
                                {dateRange && (
                                    <div className="text-sm">
                                        <span className="text-muted-foreground">Dates:&nbsp;</span>
                                        <span className="font-medium">{dateRange}</span>
                                    </div>
                                )}
                                <div className="text-sm">
                                    <span className="text-muted-foreground">Participation familles:&nbsp;</span>
                                    <span className="font-medium">{prixFamilles}</span>
                                </div>

                                {/* Badges secteurs */}
                                {Array.isArray(v.secteurs) && v.secteurs.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {v.secteurs.map((s) => (
                                            <Badge key={s} variant="outline" className="text-[11px]">
                                                {s === "CYCLE_BAC" ? "Cycle bac" : s === "CYCLE_POST_BAC" ? "Post-bac" : s}
                                            </Badge>
                                        ))}
                                    </div>
                                )}

                                {/* Badges sections */}
                                {Array.isArray(v.sections) && v.sections.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5">
                                        {v.sections.slice(0, 3).map((s) => (
                                            <Badge key={s.id} variant="secondary" className="text-[11px]">
                                                {s.libelle}
                                            </Badge>
                                        ))}
                                        {v.sections.length > 3 && (
                                            <Badge variant="outline" className="text-[11px]">
                                                +{v.sections.length - 3}
                                            </Badge>
                                        )}
                                    </div>
                                )}
                            </CardContent>

                            {/* Footer / Actions */}
                            <CardFooter className="flex items-center justify-between">
                                <div className="text-xs text-muted-foreground">
                                    Min: {v.nombreMinParticipants} • Max: {v.nombreMaxParticipants}
                                </div>
                                <Button size="sm" asChild>
                                    <Link to={`/voyages/${v.id}`}>Voir</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold">Gestion des voyages</h1>
            <DataTable columns={voyagesColumns} table={tableInstance} entity="voyages" filter="nom" />
        </div>
    );
}
export default Voyages;
