export type Role = "ADMIN" | "TEACHER" | "STUDENT" | "PARENT" | "USER";

export type Identity = {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    roles: Role[]; // <-- renvoie ça depuis /me côté Spring
};
