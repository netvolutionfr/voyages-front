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
            const response = await axiosInstance.post(`/${resource}`, variables);
            return {
                data: response.data,
            };
        } catch (error) {
            return Promise.reject(error);
        }
    },

    update: async ({ resource, id, variables }) => {
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
            const params = buildListParams({ resource, pagination, sorters, filters });
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
