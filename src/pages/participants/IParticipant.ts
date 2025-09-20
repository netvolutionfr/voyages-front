export type IParticipant = {
    id: number;
    lastName: string;
    firtName: string;
    email: string;
    birthDate: string;
    gender: 'M' | 'F' | 'N';
    telephone?: string;
}
