export type Role = "ADMIN" | "TEACHER" | "STUDENT" | "PARENT" | "USER";

export interface Me {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: Role;
    telephone?: string | null;
}