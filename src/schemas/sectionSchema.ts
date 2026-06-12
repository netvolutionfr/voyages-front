import {z} from "zod";
import {optionalShortText, requiredShortText} from "@/schemas/common";

export const SectionSchema = z.object({
    label: requiredShortText("Le libellé est requis"),
    description: optionalShortText(1000),
})

export type SectionFormData = z.infer<typeof SectionSchema>;
