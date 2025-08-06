import type {DataProvider} from "@refinedev/core";
import axiosInstance from "@/lib/axios";
import {convertDateToString} from "@/lib/utils.ts";

export const voyagesDataProvider: DataProvider = {
    getOne: async ({ resource }) => {
        if (resource === "me") {
            const response = await axiosInstance.get("/me");
            const data = response.data;
            // Modifier le format de la date de naissance en DD/MM/YYYY
            if (data.dateNaissance) {
                data.dateNaissance = convertDateToString(data.dateNaissance)
            }
            return {
                data: data,
            };
        }

        throw new Error(`getOne not implemented for ${resource}`);
    },

    create: async ({ resource, variables }) => {
        if (resource === "me") {
            const { data } = await axiosInstance.post("/me", variables);
            return { data };
        }

        throw new Error(`create not implemented for ${resource}`);
    },

    update: async ({ resource, variables }) => {
        if (resource === "me") {
            const { data } = await axiosInstance.post("/me", variables); // ou PATCH
            return { data };
        }

        throw new Error(`update not implemented for ${resource}`);
    },

    // Implémente les autres méthodes si nécessaire
    getList: () => Promise.reject("Not implemented"),
    getMany: () => Promise.reject("Not implemented"),
    deleteOne: () => Promise.reject("Not implemented"),
    getApiUrl: () => import.meta.env.VITE_API_URL,
};
