export type IUser = {
    id: string; // Id sous forme de UUID
    lastName?: string;
    firstName?: string;
    email?: string;
    telephone?: string;
    validated?: boolean;
    role: string;
}
