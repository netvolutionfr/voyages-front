import { z } from "zod";

const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;

const BirthDateSchema = z
    .union([
        z
            .string()
            .regex(dateRegex, "Format jj/mm/aaaa invalide")
            .refine((val) => {
                if (!val) return true; // chaîne vide acceptée
                const [day, month, year] = val.split("/").map(Number);
                const date = new Date(year, month - 1, day);
                return (
                    date.getFullYear() === year &&
                    date.getMonth() === month - 1 &&
                    date.getDate() === day
                );
            }, "Date de naissance non valide"),
        z.literal(""), // autorise le champ vide
    ])
    .nullable()
    .optional();

export const UserSchema = z.object({
    firstName: z.string().min(1, "Le prénom est requis"),
    lastName: z.string().min(1, "Le nom est requis"),
    email: z.email("Email invalide"),
    gender: z.enum(["M", "F", "N"]),
    birthDate: BirthDateSchema,
    telephone: z.string().optional(),
    sectionPublicId: z.string().nullable().optional(),
    role: z.enum(["STUDENT", "TEACHER", "PARENT", "ADMIN"]),
});

export type UserFormData = z.infer<typeof UserSchema>;