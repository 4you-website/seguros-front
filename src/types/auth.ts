
import { User } from "./user";

export interface AuthResponse {
    user: User;
    token: string;
    user_data?: any[];
}