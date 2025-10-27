import type {
    BaseRecord,
    CreateParams, CreateResponse,
    DataProvider, DeleteOneParams, DeleteOneResponse,
    GetListParams, GetListResponse,
    GetOneParams,
    GetOneResponse, UpdateParams, UpdateResponse
} from "@refinedev/core";
import {api} from "@/auth/api.ts";
/**
 * Construit les params Spring:
 * - Pagination: page (0/1-based selon config), size
 * - Tri: ?sort=field,asc&sort=other,desc
 * - Recherche q (facultative)
 */
function buildListParams(params: GetListParams) {
    const { pagination, sorters, filters } = params;
    const search = new URLSearchParams();

    // Pagination (Refine est 1-based). Spring par défaut est 0-based.
    const current = pagination?.current ?? 1;
    const pageSize = pagination?.pageSize ?? 10;

    search.set("page", String(current - 1)); // Spring est 0-based
    search.set("size", String(pageSize));

    // Tri multi-colonnes
    (sorters ?? []).forEach((s) => {
        const order = s.order?.toLowerCase() === "desc" ? "desc" : "asc";
        // IMPORTANT: le champ doit correspondre à la propriété triable côté JPA
        search.append("sort", `${s.field},${order}`);
    });

    // Recherche
    (filters ?? []).forEach((s) => {
        if (s.operator === "contains" && s.value) {
            search.set("q", s.value);
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
            // ex: ?field.in=v1,v2,v3
            search.set(`${s.field}.in`, (s.value as (string | number)[]).join(","));
        }
    })

    return search;
}

export const voyagesDataProvider: DataProvider = {
    // GET /:resource/:id  (+ cas spécial /me)
    getOne: async <
        TData extends BaseRecord = BaseRecord
    >(
        { resource, id }: GetOneParams
    ): Promise<GetOneResponse<TData>> => {
        try {
            let path = `/${resource}/${id}`;
            if (resource === "me") {
                path ="/me";
            }
            if (resource === "me/health-form") {
                path ="/me/health-form";
            }
            const data = await api.get<TData>(path);
            return { data };
        } catch (error) {
            return Promise.reject(error);
        }
    },

    // POST /:resource
    create: async <
        TData extends BaseRecord = BaseRecord,
        TVariables = unknown
    >(
        { resource, variables }: CreateParams<TVariables>
    ): Promise<CreateResponse<TData>> => {
        try {
            const data = await api.post<TData>(`/${resource}`, variables);
            return { data };
        } catch (error) {
            return Promise.reject(error);
        }
    },

    // PUT /:resource/:id  (+ cas spéciaux /me et /trip-preferences/:id)
    update: async <
        TData extends BaseRecord = BaseRecord,
        TVariables = unknown
    >(
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
    getList: async <
        TData extends BaseRecord = BaseRecord
    >(
        params: GetListParams
    ): Promise<GetListResponse<TData>> => {
        try {
            const { resource, pagination, sorters, filters } = params;
            const qs = buildListParams({ resource, pagination, sorters, filters });
            const url = `/${resource}?${qs.toString()}`;

            const response = await api.get<{ content: TData[]; page: { totalElements: number } }>(url);

            return {
                data: response.content,
                total: response.page.totalElements,
            };
        } catch (error) {
            return Promise.reject(error);
        }
    },

    getMany: () => Promise.reject("Not implemented"),

    // DELETE /:resource/:id

    deleteOne: async <
        TData extends BaseRecord = BaseRecord,
        TVariables = object
    >(
        params: DeleteOneParams<TVariables>
    ): Promise<DeleteOneResponse<TData>> => {
        const { resource, id } = params; // ← destructure ici, pas dans la signature
        const data = await api.delete<TData>(`/${resource}/${id}`);
        // si l'API fait 204 No Content :
        // const data = undefined as unknown as TData;
        return { data };
    },

    getApiUrl: () => import.meta.env.VITE_API_URL,
};
