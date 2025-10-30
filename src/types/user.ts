export interface User {
    id: number;
    username: string;
    email: string;
    company_id?: number;
    role_id?: number | null;
}
