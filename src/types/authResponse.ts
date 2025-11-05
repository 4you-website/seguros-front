// src/types/authResponse.ts
import { User } from "./User";
import { UserDataExtended } from "./UserDataExtended";


export interface AuthResponse {
    user: User;
    token: string;
    user_data?: UserDataExtended[];  // 👈 agregamos este opcional
}
