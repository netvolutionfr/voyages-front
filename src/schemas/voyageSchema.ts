import { z } from "zod";

// accepte Date|string en entrée, sort une string ISO, valide ISO 8601
const dateTimeISO = z.preprocess(
    (val) => (val instanceof Date ? val.toISOString() : val),
    z.string()
);

const rangeISO = z.object({
    from: dateTimeISO,
    to:   dateTimeISO,
});

export const VoyageSchema = z.object({
    title: z.string().min(1),
    destination: z.string().min(1),
    countryId: z.number().int().positive(),
    tripDates: rangeISO,
    registrationPeriod: rangeISO.nullable().optional(),
    minParticipants: z.number().int().min(1),
    maxParticipants: z.number().int().min(1),
    description: z.string().nullable().optional(),
    totalPrice: z.number().min(0).nullable().optional(),
    familyContribution: z.number().min(0).nullable().optional(),
    coverPhotoUrl: z.string().nullable().optional(),
    chaperoneIds: z.array(z.string().min(1)).default([]),
    sectionIds: z.array(z.string()).default([]),
    sectors: z.array(z.enum(["CYCLE_BAC","CYCLE_POST_BAC"])).default([]),
    poll: z.boolean().default(false),
})
    .superRefine((v, ctx) => {
        // comparaisons sur strings ISO → convertis localement en Date pour la validation
        const toD = (s?: string) => (s ? new Date(s) : undefined);
        const i = v.registrationPeriod;
        const voyFrom = toD(v.tripDates.from);
        if (i?.to && voyFrom && new Date(i.to) >= voyFrom) {
            ctx.addIssue({ code: "custom", path: ["registrationPeriod"], message: "Les inscriptions doivent se terminer avant le début du voyage." });
        }
        if (v.minParticipants > v.maxParticipants) {
            ctx.addIssue({ code: "custom", path: ["maxParticipants"], message: "Le maximum doit être ≥ au minimum." });
        }
    });

export type VoyageFormData = z.infer<typeof VoyageSchema>;
