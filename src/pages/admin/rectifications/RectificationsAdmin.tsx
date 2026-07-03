import { useState } from "react";
import { useList } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import type { AdminRectificationRequest, RectificationStatus } from "@/type/rgpd.ts";
import ProcessRectificationDialog from "@/pages/admin/rectifications/ProcessRectificationDialog.tsx";

const FIELD_LABELS: Record<AdminRectificationRequest["field"], string> = {
    FIRST_NAME: "Prénom",
    LAST_NAME: "Nom",
    BIRTH_DATE: "Date de naissance",
    EMAIL: "Email",
};

const STATUS_VARIANT: Record<RectificationStatus, "secondary" | "default" | "destructive"> = {
    PENDING: "secondary",
    APPLIED: "default",
    REJECTED: "destructive",
};

const STATUS_LABELS: Record<RectificationStatus, string> = {
    PENDING: "En attente",
    APPLIED: "Appliquée",
    REJECTED: "Rejetée",
};

const formatDate = (iso?: string) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("fr-FR", { year: "numeric", month: "2-digit", day: "2-digit" });
};

const PAGE_SIZE = 20;

const RectificationsAdmin = () => {
    const [status, setStatus] = useState<RectificationStatus | "ALL">("PENDING");
    const [page, setPage] = useState(1);

    const { result, query } = useList<AdminRectificationRequest>({
        resource: "admin-rectification-requests",
        pagination: { currentPage: page, pageSize: PAGE_SIZE },
        meta: {
            query: { status: status === "ALL" ? undefined : status },
        },
    });

    const requests = result?.data ?? [];
    const total = result?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    const handleStatusChange = (value: string) => {
        setStatus(value as RectificationStatus | "ALL");
        setPage(1);
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Demandes de rectification</CardTitle>
                <Select value={status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-48">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Tous statuts</SelectItem>
                        <SelectItem value="PENDING">En attente</SelectItem>
                        <SelectItem value="APPLIED">Appliquée</SelectItem>
                        <SelectItem value="REJECTED">Rejetée</SelectItem>
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent className="space-y-4">
                {query.isLoading ? (
                    <div className="space-y-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="h-10 w-full" />
                        ))}
                    </div>
                ) : (
                    <>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Demandeur</TableHead>
                                    <TableHead>Champ</TableHead>
                                    <TableHead>Valeur demandée</TableHead>
                                    <TableHead>Motif</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {requests.map((r) => (
                                    <TableRow key={r.id}>
                                        <TableCell className="font-medium">
                                            {r.userFullName}
                                            <div className="text-xs text-muted-foreground">{r.userEmail}</div>
                                        </TableCell>
                                        <TableCell>{FIELD_LABELS[r.field]}</TableCell>
                                        <TableCell>{r.requestedValue}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {r.reason || "—"}
                                        </TableCell>
                                        <TableCell>{formatDate(r.createdAt)}</TableCell>
                                        <TableCell>
                                            <Badge variant={STATUS_VARIANT[r.status]}>
                                                {STATUS_LABELS[r.status]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {r.status === "PENDING" ? (
                                                <ProcessRectificationDialog
                                                    request={r}
                                                    onProcessed={() => query.refetch()}
                                                />
                                            ) : (
                                                <span className="text-xs text-muted-foreground">—</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {requests.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                            Aucune demande.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Page {page} sur {totalPages} ({total} demande{total > 1 ? "s" : ""})
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page <= 1}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                >
                                    Précédent
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page >= totalPages}
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                >
                                    Suivant
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default RectificationsAdmin;
