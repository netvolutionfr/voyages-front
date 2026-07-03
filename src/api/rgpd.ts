// Endpoints RGPD (droit d'accès, de rectification, d'effacement).
// Authentifiés via le header Authorization (token en mémoire) : pas de surface CSRF ici,
// contrairement aux endpoints cookie-backed (refresh/logout/WebAuthn) qui utilisent xsrfHeader().
import { api } from "@/auth/api.ts";
import type {
    AdminRectificationRequest,
    DataExport,
    ProfilePatch,
    RectificationField,
    RectificationRequest,
} from "@/type/rgpd.ts";

/** Récupère l'export JSON complet des données de l'utilisateur connecté.
 *  Volontairement un fetch + parse JSON (pas de navigation directe sur l'URL) :
 *  l'endpoint est protégé par Authorization, absent d'un cookie de session. */
export function fetchDataExport(): Promise<DataExport> {
    return api.get<DataExport>("/me/data-export");
}

export function patchMyProfile(patch: ProfilePatch) {
    return api.patch("/me/profile", patch);
}

export function createRectificationRequest(payload: {
    field: RectificationField;
    requestedValue: string;
    reason?: string;
}): Promise<RectificationRequest> {
    return api.post<RectificationRequest>("/me/rectification-request", payload);
}

export function requestAccountDeletion(): Promise<{ message: string }> {
    return api.post<{ message: string }>("/me/delete-request");
}

export function confirmAccountDeletion(otp: string): Promise<void> {
    return api.delete<void>("/me", { otp });
}

export type RectificationRequestsPage = {
    content: AdminRectificationRequest[];
    page: { totalElements: number };
};

export function patchRectificationRequest(
    id: string,
    payload: { status: "APPLIED" | "REJECTED"; adminComment?: string }
) {
    return api.patch(`/users/rectification-requests/${encodeURIComponent(id)}`, payload);
}
