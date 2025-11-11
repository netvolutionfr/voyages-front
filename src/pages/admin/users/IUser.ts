export type IUser = {
    publicId: string; // Id sous forme de UUID
    lastName?: string;
    firstName?: string;
    email?: string;
    gender?: 'M' | 'F' | 'N';
    birthDate?: string; // ISO string
    telephone?: string;
    validated?: boolean;
    role: string;
}
