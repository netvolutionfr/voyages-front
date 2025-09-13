import type {DataProvider} from "@refinedev/core";

const baseURL = import.meta.env.VITE_API_URL

export const publicDataProvider: DataProvider = {
    create: async ({ resource, variables }) => {
        const response = await fetch(`${baseURL}/public/${resource}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(variables),
        });

        if (!response.ok) {
            throw new Error("Erreur API publique");
        }
        return { data: await response.json() };
    },
    // tu pourrais ajouter read si besoin plus tard
} as DataProvider;
