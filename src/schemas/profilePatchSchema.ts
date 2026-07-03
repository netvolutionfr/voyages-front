import { z } from "zod";
import { optionalPhone, optionalShortText } from "@/schemas/common.ts";

/** Champs modifiables en self-service via PATCH /me/profile.
 *  firstName/lastName/birthDate/email ne sont pas modifiables directement :
 *  voir rectificationRequestSchema.ts. */
export const profilePatchSchema = z.object({
    gender: z.enum(["M", "F", "N"]),
    telephone: optionalPhone,
    displayName: optionalShortText(80),
});

export type ProfilePatchFormData = z.infer<typeof profilePatchSchema>;
