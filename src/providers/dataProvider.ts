import type {
    BaseRecord,
    CreateParams, CreateResponse,
    DataProvider, DeleteOneParams, DeleteOneResponse,
    GetListParams, GetListResponse,
    GetOneParams, GetOneResponse,
    UpdateParams, UpdateResponse,
} from "@refinedev/core";
import { api } from "@/auth/api.ts";

/**
 * Construit les params Spring standards :
 * - Pagination: page (0-based), size
 * - Tri: ?sort=field,asc&sort=other,desc
 * - Filtres usuels: q (contains), field= (eq), field.gte, field.lte, field.in=v1,v2
 * + Merge d'un objet "extra" (pour des flags comme includeDocSummary, tripId, sortKey, activeOnly, etc.)
 */
function buildListParams(params: GetListParams, extra?: Record<string, unknown>) {
    const { pagination, sorters, filters } = params;
    const search = new URLSearchParams();

    // Pagination (Refine est 1-based, Spring est 0-based)
    const current = pagination?.current ?? 1;
    const pageSize = pagination?.pageSize ?? 10;
    search.set("page", String(current - 1));
    search.set("size", String(pageSize));

    // Tri multi-colonnes
    (sorters ?? []).forEach((s) => {
        const order = s.order?.toLowerCase() === "desc" ? "desc" : "asc";
        search.append("sort", `${s.field},${order}`);
    });

    // Filtres usuels
    (filters ?? []).forEach((s) => {
        if (s.operator === "contains" && s.value) {
            search.set("q", String(s.value));
        }
        if (s.operator === "eq" && s.value !== undefined && s.value !== null && s.value !== "") {
            search.set(s.field, String(s.value));
        }
        if (s.operator === "gte" && s.value !== undefined && s.value !== null && s.value !== "") {
            search.set(`${s.field}.gte`, String(s.value));
        }
        if (s.operator === "lte" && s.value !== undefined && s.value !== null && s.value !== "") {
            search.set(`${s.field}.lte`, String(s.value));
        }
        if (s.operator === "in" && Array.isArray(s.value) && s.value.length > 0) {
            search.set(`${s.field}.in`, (s.value as (string | number)[]).join(","));
        }
    });

    // Extra (flags et paramètres spécifiques)
    if (extra) {
        Object.entries(extra).forEach(([k, v]) => {
            if (v === undefined || v === null || v === "") return;
            // Les booléens/numériques/strings passent en string
            search.set(k, String(v));
        });
    }

    return search;
}

// --- Types utiles pour sérialiser les réponses paginées connues ---
type PageMeta = { totalElements: number };

type PagedResponse<T> = {
    content: T[];
    page: PageMeta;
};

// Types API (extraits de ton OpenAPI)
type SectionMiniDTO = { id: number; label: string };
type DocumentsSummaryDTO = { required: number; provided: number; missing: number };
type UserMiniDTO = {
    publicId: string;
    firstName: string;
    lastName: string;
    email?: string;
    telephone?: string;
    section?: SectionMiniDTO;
};
export type TripRegistrationAdminViewDTO = {
    registrationId: number;
    registeredAt: string;
    status: string;
    user: UserMiniDTO;
    documentsSummary?: DocumentsSummaryDTO;
};
export type DocumentsAdminDTO = {
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
export type HealthFormAdminDTO = {
    exists: boolean;
    content?: string;
};

export const voyagesDataProvider: DataProvider = {
    // GET /:resource/:id  (+ cas spéciaux)
    getOne: async <TData extends BaseRecord = BaseRecord>(
        { resource, id, meta }: GetOneParams
    ): Promise<GetOneResponse<TData>> => {
        try {
            // Cas spéciaux simples déjà en place
            if (resource === "me") {
                const data = await api.get<TData>("/me");
                return { data };
            }
            if (resource === "me/health-form") {
                const data = await api.get<TData>("/me/health-form");
                return { data };
            }
            if (resource === "me/documents") {
                const data = await api.get<TData>("/me/documents");
                return { data };
            }

            // --- Nouveaux cas pour le dashboard ---
            // Documents par user pour un voyage : /users/{userId}/documents?tripId=...
            if (resource === "admin-user-documents") {
                const tripId = meta?.tripId;
                const qs = new URLSearchParams();
                if (tripId !== undefined) qs.set("tripId", String(tripId));
                const data = await api.get<TData>(`/users/${id}/documents?${qs.toString()}`);
                return { data };
            }

            // Fiche sanitaire : /users/{userId}/health-form?tripId=...
            if (resource === "admin-user-health") {
                const tripId = meta?.tripId;
                const qs = new URLSearchParams();
                if (tripId !== undefined) qs.set("tripId", String(tripId));
                const data = await api.get<TData>(`/users/${id}/health-form?${qs.toString()}`);
                return { data };
            }

            // URL de prévisualisation document : /users/documents/{docId}/preview-url
            if (resource === "admin-document-preview-url") {
                const data = await api.get<TData>(`/users/documents/${id}/preview-url`);
                return { data };
            }

            // Fallback générique
            const data = await api.get<TData>(`/${resource}/${id}`);
            return { data };
        } catch (error) {
            return Promise.reject(error);
        }
    },

    // POST /:resource
    create: async <TData extends BaseRecord = BaseRecord, TVariables = unknown>(
        { resource, variables }: CreateParams<TVariables>
    ): Promise<CreateResponse<TData>> => {
        try {
            const data = await api.post<TData>(`/${resource}`, variables);
            return { data };
        } catch (error) {
            return Promise.reject(error);
        }
    },

    // PUT/POST /:resource/:id  (+ cas spéciaux /me, /trip-preferences/:id)
    update: async <TData extends BaseRecord = BaseRecord, TVariables = unknown>(
        { resource, id, variables }: UpdateParams<TVariables>
    ): Promise<UpdateResponse<TData>> => {
        try {
            if (resource === "me") {
                const data = await api.post<TData>("/me", variables);
                return { data };
            }
            if (resource === "trip-preferences") {
                const data = await api.post<TData>(`/trip-preferences/${id}`, variables);
                return { data };
            }
            const data = await api.put<TData>(`/${resource}/${id}`, variables);
            return { data };
        } catch (error) {
            return Promise.reject(error);
        }
    },

    // GET /:resource?…  (Spring Pageable: { content, page.totalElements })
    getList: async <TData extends BaseRecord = BaseRecord>(
        params: GetListParams
    ): Promise<GetListResponse<TData>> => {
        try {
            const { resource, pagination, sorters, filters, meta } = params;

            // --- Liste des inscriptions admin ---
            // Endpoint: /trips/registrations
            // Filtres supportés: status, q, sectionId, includeDocSummary (bool), tripId (si dispo côté back)
            if (resource === "admin-registrations") {
                // includeDocSummary par défaut à true (utile pour le dashboard)
                const extra: Record<string, unknown> = {
                    includeDocSummary: meta?.includeDocSummary ?? true,
                };

                // On laisse passer d’éventuels flags/valeurs depuis meta.query
                if (meta?.query && typeof meta.query === "object") {
                    Object.assign(extra, meta.query);
                }

                // Et on traduit quelques filtres “classiques” si fournis via `filters`
                // - status (eq)
                // - sectionId (eq)
                // - tripId (eq)
                // - q (contains)
                (filters ?? []).forEach((f) => {
                    if (f.operator === "eq" && f.value !== undefined && f.value !== null && f.value !== "") {
                        if (["status", "sectionId", "tripId"].includes(f.field)) {
                            extra[f.field] = f.value;
                        }
                    }
                    if (f.operator === "contains" && f.value) {
                        extra["q"] = String(f.value);
                    }
                });

                const qs = buildListParams({ resource, pagination, sorters, filters }, extra);
                const url = `/trips/registrations?${qs.toString()}`;
                const response = await api.get<PagedResponse<TData>>(url);

                return {
                    data: response.content,
                    total: response.page?.totalElements ?? response.content.length,
                };
            }

            // --- Liste des sections ---
            // Endpoint: /sections
            // On veut généralement activeOnly=true, sortKey="yearLabel"
            if (resource === "sections") {
                const extra: Record<string, unknown> = {
                    activeOnly: meta?.activeOnly ?? true,
                    sortKey: meta?.sortKey ?? "yearLabel",
                };
                if (meta?.query && typeof meta.query === "object") {
                    Object.assign(extra, meta.query);
                }
                const qs = buildListParams({ resource, pagination, sorters, filters }, extra);
                const url = `/sections?${qs.toString()}`;
                const response = await api.get<PagedResponse<TData>>(url);

                return {
                    data: response.content,
                    total: response.page?.totalElements ?? response.content.length,
                };
            }

            // --- Fallback générique pageable ---
            const qs = buildListParams({ resource, pagination, sorters, filters }, meta?.query);
            const url = `/${resource}?${qs.toString()}`;
            const response = await api.get<PagedResponse<TData>>(url);

            return {
                data: response.content ?? (Array.isArray(response) ? (response as unknown as TData[]) : []),
                total: response.page?.totalElements ?? (Array.isArray(response) ? (response as unknown as TData[]).length : 0),
            };
        } catch (error) {
            return Promise.reject(error);
        }
    },

    getMany: () => Promise.reject("Not implemented"),

    // DELETE /:resource/:id
    deleteOne: async <TData extends BaseRecord = BaseRecord, TVariables = object>(
        params: DeleteOneParams<TVariables>
    ): Promise<DeleteOneResponse<TData>> => {
        const { resource, id } = params;
        const data = await api.delete<TData>(`/${resource}/${id}`);
        return { data };
    },

    getApiUrl: () => import.meta.env.VITE_API_URL,
};