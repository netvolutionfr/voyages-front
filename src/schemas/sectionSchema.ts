import {z} from "zod";

export const SectionSchema = z.object({
    libelle: z.string().min(1, "Le libellé est requis"),
    description: z.string().optional().nullable(),
})

export type SectionFormData = z.infer<typeof SectionSchema>;
