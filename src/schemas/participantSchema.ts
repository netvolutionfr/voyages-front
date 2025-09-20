import {z} from "zod";

export const ParticipantSchema = z.object({
    gender: z.enum(["M", "F", "N"], {
        error: "Le genre doit être précisé",
    }),
    lastName: z.string().min(1, "Le nom est requis"),
    firstName: z.string().min(1, "Le prénom est requis"),
    birthDate: z.string().min(1, "La date de naissance est requise"),
    email: z.email("L'email doit être valide").optional().nullable(),
    telephone: z.string().optional(),
    sectionId: z.number().optional().nullable(),
})

export type ParticipantFormData = z.infer<typeof ParticipantSchema>;
