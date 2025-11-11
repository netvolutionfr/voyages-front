export type Role = "ADMIN" | "TEACHER" | "STUDENT" | "PARENT" | "USER";

export interface Me {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    gender: "M" | "F" | "N";
    birthDate: string; // ISO string
    role: Role;
    telephone?: string | null;
}