import { z } from "zod";
import { optionalShortText, requiredShortText } from "@/schemas/common.ts";

const dateRegex = /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/(19|20)\d{2}$/;

/** Validation par champ, miroir des règles back (POST /me/rectification-request) :
 *  le serveur reste l'autorité, mais on évite un aller-retour 400 évitable. */
export const rectificationRequestSchema = z
    .object({
        field: z.enum(["FIRST_NAME", "LAST_NAME", "BIRTH_DATE", "EMAIL"]),
        requestedValue: requiredShortText("Valeur requise", 150),
        reason: optionalShortText(300),
    })
    .superRefine((data, ctx) => {
        if (data.field === "EMAIL" && !z.string().email().safeParse(data.requestedValue).success) {
            ctx.addIssue({ code: "custom", path: ["requestedValue"], message: "Email invalide" });
        }
        if (data.field === "BIRTH_DATE" && !dateRegex.test(data.requestedValue)) {
            ctx.addIssue({ code: "custom", path: ["requestedValue"], message: "Format jj/mm/aaaa invalide" });
        }
    });

export type RectificationRequestFormData = z.infer<typeof rectificationRequestSchema>;
