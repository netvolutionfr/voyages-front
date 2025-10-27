import { z } from "zod";

const phoneRegex = /^[+0-9 ().-]{6,20}$/;

export const studentHealthFormSchema = z.object({
    drugAllergiesCsv: z.string().default(""),
    foodAllergiesCsv: z.string().default(""),
    otherAllergiesCsv: z.string().default(""),
    allergiesNotes: z.string().max(2000).default(""),

    dietNotes: z.string().max(2000).default(""),
    dailyTreatments: z.string().max(2000).default(""),
    emergencyTreatments: z.string().max(2000).default(""),
    paiDetails: z.string().max(2000).default(""),

    // téléphones « optionnels » = union avec chaîne vide + default("")
    primaryAltPhone: z.union([z.string().regex(phoneRegex), z.literal("")]).default(""),
    secondaryPhone: z.union([z.string().regex(phoneRegex), z.literal("")]).default(""),
    backupPhone: z.union([z.string().regex(phoneRegex), z.literal("")]).default(""),

    // autres strings
    secondaryName: z.string().default(""),
    secondaryRelation: z.string().default(""),
    backupName: z.string().default(""),
    backupRelation: z.string().default(""),

    // requis
    primaryName: z.string().min(1),
    primaryRelation: z.string().min(1),
    primaryPhone: z.string().regex(phoneRegex),

    // booléens avec defaults
    vegetarian: z.boolean().default(false),
    noPork: z.boolean().default(false),
    lactoseIntolerant: z.boolean().default(false),
    glutenFree: z.boolean().default(false),
    hasPAI: z.boolean().default(false),
    consentHospitalization: z.boolean().default(false),
    consentTransport: z.boolean().default(false),

    // metas
    validUntil: z.string().default(""),
    version: z.number().int().nonnegative().default(0),
});

export type StudentHealthFormValues = z.infer<typeof studentHealthFormSchema>;
