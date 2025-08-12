import {z} from "zod";

export const ParticipantSchema = z.object({
    sexe: z.enum(["M", "F", "N"], {
        error: "Le sexe doit être précisé",
    }),
    nom: z.string().min(1, "Le nom est requis"),
    prenom: z.string().min(1, "Le prénom est requis"),
    dateNaissance: z.string().min(1, "La date de naissance est requise"),
    email: z.email("L'email doit être valide").optional().nullable(),
    telephone: z.string().optional(),
    sectionId: z.number().optional().nullable(),
})

export type ParticipantFormData = z.infer<typeof ParticipantSchema>;
