import type {DataProvider, GetListParams} from "@refinedev/core";
import axiosInstance from "@/lib/axios";





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
    getOne: async ({ resource, id }) => {
        if (resource === "me") {
            const response = await axiosInstance.get("/me");
            const data = response.data;
            if (!data.telephone) {
                data.telephone = "";
            }
            return {
                data: data,
            };
        }

        try {
            const response = await axiosInstance.get(`/${resource}/${id}`);
            return {
                data: response.data,
            };
        } catch (error) {
            return Promise.reject(error);
        }
    },

    create: async ({ resource, variables }) => {
        try {
            const isForm = typeof FormData !== "undefined" && variables instanceof FormData;
            const response = await axiosInstance.post(
                `/${resource}`,
                variables,
                isForm ? undefined : { /* keep as-is; JSON par défaut */ }
            );
            return { data: response.data };
        } catch (error) {
            return Promise.reject(error);
        }
    },

    update: async ({ resource, id, variables }) => {
        if (resource === "me") {
            const response = await axiosInstance.post("/me", variables);
            return {
                data: response.data,
            };
        }
        if (resource === "trip-preferences") {
            try {
                const response = await axiosInstance.post(`/trip-preferences/${id}`, variables);
                return { data: response.data };
            } catch (error) {
                return Promise.reject(error);
            }
        }
        try {
            const response = await axiosInstance.put(`/${resource}/${id}`, variables);
            return {
                data: response.data,
            };
        } catch (error) {
            return Promise.reject(error);
        }
    },
    getList: async ({ resource, pagination, sorters, filters }) => {
        try {
            console.log("getList", { resource, pagination, sorters, filters });
            const params = buildListParams({ resource, pagination, sorters, filters });
            console.log("-> params", params.toString());
            const url = `/${resource}?${params.toString()}`;
            const response = await axiosInstance.get(url);

            return {
                data: response.data.content,
                total: response.data.totalElements,
            }
        } catch (error) {
            return Promise.reject(error);
        }
    },
    getMany: () => Promise.reject("Not implemented"),
    deleteOne: async ({ resource, id }) => {
        try {
            const response = await axiosInstance.delete(`/${resource}/${id}`);
            return {
                data: response.data,
            };
        } catch (error) {
            return Promise.reject(error);
        }
    },
    getApiUrl: () => import.meta.env.VITE_API_URL,
};
