import { z } from "zod";
import { phoneRegex } from "@/schemas/common";

// Champs CSV (allergies) : bornés pour éviter les payloads démesurés ;
// le découpage/validation par item est fait au mapping DTO (csvToArray).
const csvField = z.string().trim().max(500).default("");

const optionalName = z.string().trim().max(100).default("");

export const studentHealthFormSchema = z.object({
    drugAllergiesCsv: csvField,
    foodAllergiesCsv: csvField,
    otherAllergiesCsv: csvField,
    allergiesNotes: z.string().trim().max(2000).default(""),

    dailyTreatments: z.string().trim().max(2000).default(""),
    emergencyTreatments: z.string().trim().max(2000).default(""),
    paiDetails: z.string().trim().max(2000).default(""),

    // téléphones « optionnels » = union avec chaîne vide + default("")
    primaryAltPhone: z.union([z.string().trim().regex(phoneRegex), z.literal("")]).default(""),
    secondaryPhone: z.union([z.string().trim().regex(phoneRegex), z.literal("")]).default(""),
    backupPhone: z.union([z.string().trim().regex(phoneRegex), z.literal("")]).default(""),

    // autres strings
    secondaryName: optionalName,
    secondaryRelation: optionalName,
    backupName: optionalName,
    backupRelation: optionalName,

    // requis
    primaryName: z.string().trim().min(1, "Le nom du contact principal est requis").max(100),
    primaryRelation: z.string().trim().min(1, "Le lien avec le contact principal est requis").max(100),
    primaryPhone: z.string().trim().regex(phoneRegex, "Téléphone invalide"),

    // booléens avec defaults
    hasPAI: z.boolean().default(false),
    consentHospitalization: z.boolean().default(false),
    consentTransport: z.boolean().default(false),

    // motifs de refus : requis quand le consentement correspondant est refusé
    // (voir superRefine) ; transmis dans le DTO pour ne pas perdre l'information.
    hospitalizationRefusalReason: z.string().trim().max(1000).default(""),
    transportRefusalReason: z.string().trim().max(1000).default(""),

    // metas
    validUntil: z.union([z.iso.date(), z.literal("")]).default(""),
    version: z.number().int().nonnegative().default(0),
})
    .superRefine((v, ctx) => {
        if (!v.consentHospitalization && v.hospitalizationRefusalReason.length === 0) {
            ctx.addIssue({
                code: "custom",
                path: ["hospitalizationRefusalReason"],
                message: "Motif obligatoire en cas de refus.",
            });
        }
        if (!v.consentTransport && v.transportRefusalReason.length === 0) {
            ctx.addIssue({
                code: "custom",
                path: ["transportRefusalReason"],
                message: "Motif obligatoire en cas de refus.",
            });
        }
    });

export type StudentHealthFormValues = z.infer<typeof studentHealthFormSchema>;
